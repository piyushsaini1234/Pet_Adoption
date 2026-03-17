import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import useNotifications from '../hooks/useNotifications';

const TYPE_ICON = {
  adoption_approved:    '🎉',
  adoption_rejected:    '😔',
  adoption_pending:     '📋',
  new_adoption_request: '🐾',
};

const TYPE_BG = {
  adoption_approved:    'bg-green-50 border-green-100',
  adoption_rejected:    'bg-red-50 border-red-100',
  adoption_pending:     'bg-blue-50 border-blue-100',
  new_adoption_request: 'bg-orange-50 border-orange-100',
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate     = useNavigate();
  const dropdownRef  = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    open,
    toggleOpen,
    setOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setOpen]);

  const handleClick = async (n) => {
    if (!n.read) await markAsRead(n._id);
    setOpen(false);

    // Admins go to the admin dashboard; regular users go to pet detail
    if (n.type === 'new_adoption_request') {
      navigate('/admin');
    } else if (n.pet?._id || n.pet) {
      navigate(`/pets/${n.pet?._id || n.pet}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge bg-orange-100 text-orange-600">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs text-orange-500 hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-400">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                    !n.read ? 'bg-orange-50/40' : ''
                  }`}
                >
                  {/* Icon bubble */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border text-lg ${TYPE_BG[n.type] || 'bg-gray-50 border-gray-100'}`}>
                    {TYPE_ICON[n.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-sm leading-tight ${!n.read ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">
                      {n.message}
                    </p>

                    {/* ── Admin-only: applicant detail card ── */}
                    {n.type === 'new_adoption_request' && n.applicant && (
                      <div className="mt-2 bg-white border border-orange-100 rounded-lg px-3 py-2 flex items-center gap-2">
                        {/* Avatar initials */}
                        <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {n.applicant.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {n.applicant.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {n.applicant.email}
                          </p>
                        </div>
                        {/* Pet thumbnail if available */}
                        {n.pet?.image && (
                          <img
                            src={n.pet.image}
                            alt={n.pet.name}
                            className="w-7 h-7 rounded-lg object-cover ml-auto flex-shrink-0"
                          />
                        )}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-300 mt-1.5">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
                  setOpen(false);
                }}
                className="text-xs text-orange-500 hover:underline w-full text-center"
              >
                {user?.role === 'admin' ? 'Go to Admin Dashboard →' : 'View all applications →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
