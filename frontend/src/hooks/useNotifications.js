import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL = 20000; // poll every 20 seconds

const TOAST_ICONS = {
  adoption_approved:    '🎉',
  adoption_rejected:    '😔',
  adoption_pending:     '📋',
  new_adoption_request: '🐾',
};

// ─────────────────────────────────────────────────────────────────────────────
// Audio module — all state lives at module level so it survives re-renders.
//
// Strategy:
//   1. `initAudio()` must be called inside a real user-gesture handler (e.g.
//      the bell icon click).  It creates + resumes the AudioContext and
//      pre-loads the WAV file into a decoded buffer.
//   2. `playNotificationSound()` reuses the already-running context, so it
//      works fine even from setInterval.
//   3. If the WAV file is missing or fails to decode, a short programmatic
//      two-tone beep is generated instead — no file required.
// ─────────────────────────────────────────────────────────────────────────────
let audioCtx    = null;
let audioBuffer = null; // decoded PCM, cached after first load

const getCtx = () => {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
};

// Call this inside any user-gesture handler (click, keydown …)
export const initAudio = async () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;

    // Resume the context so it moves from "suspended" → "running"
    if (ctx.state !== 'running') {
      await ctx.resume();
    }

    // Pre-load the WAV file in the background (ignore error if file missing)
    if (!audioBuffer) {
      fetch('/notification.wav')
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => { audioBuffer = buf; })
        .catch(() => { /* file missing — will fall back to beep */ });
    }
  } catch {
    // AudioContext not supported
  }
};

// Play a short programmatic two-tone beep (works even without a sound file)
const playBeep = (ctx) => {
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    // Two-tone chime: high note → lower note
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.55);
  } catch {
    // ignore
  }
};

export const playNotificationSound = async () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;

    // Make sure context is running (may need resume after tab switch)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (audioBuffer) {
      // Play the pre-loaded WAV file
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gain = ctx.createGain();
      gain.gain.value = 0.6;

      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    } else {
      // Fallback: programmatic beep — no file needed
      playBeep(ctx);
    }
  } catch {
    // Audio completely unavailable — fail silently
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [open, setOpen]                   = useState(false);

  const seenIds     = useRef(new Set());
  const isFirstLoad = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);

      let hasNew = false;

      data.forEach((n) => {
        if (!seenIds.current.has(n._id)) {
          if (!n.read && !isFirstLoad.current) {
            const icon = TOAST_ICONS[n.type] || '🔔';
            toast(`${icon} ${n.title}\n${n.message}`, {
              duration: 5000,
              style: { maxWidth: '380px', whiteSpace: 'pre-line' },
            });
            hasNew = true;
          }
          seenIds.current.add(n._id);
        }
      });

      if (hasNew) {
        playNotificationSound();
      }

      isFirstLoad.current = false;
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      // Network blip — ignore
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      seenIds.current     = new Set();
      isFirstLoad.current = true;
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Toggle the dropdown — calling initAudio here ensures it runs inside a
  // real user-gesture so the AudioContext gets properly resumed.
  const toggleOpen = () => {
    initAudio();          // unlock / warm-up audio on every bell click
    setOpen((prev) => !prev);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    open,
    toggleOpen,   // use this instead of setOpen directly
    setOpen,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};

export default useNotifications;
