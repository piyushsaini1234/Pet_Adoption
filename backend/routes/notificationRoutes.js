const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// IMPORTANT: specific routes before param routes
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
