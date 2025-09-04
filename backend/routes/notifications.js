const express = require('express');
const { db } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, limit = 20, unread_only = false } = req.query;
  
  let query = `
    SELECT n.*, 
           p.title as property_title, p.image_urls as property_images,
           u.username as sender_username, u.full_name as sender_name
    FROM notifications n
    LEFT JOIN properties p ON n.related_id = p.id AND n.type IN ('property_match', 'like', 'comment')
    LEFT JOIN messages m ON n.related_id = m.id AND n.type = 'message'
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE n.user_id = ?
  `;
  
  const params = [req.user.id];
  
  if (unread_only === 'true') {
    query += ' AND n.is_read = 0';
  }
  
  query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
  
  const offset = (page - 1) * limit;
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    const processedNotifications = notifications.map(notification => ({
      ...notification,
      property_images: notification.property_images ? JSON.parse(notification.property_images) : null
    }));

    res.json({ notifications: processedNotifications });
  });
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  const notificationId = req.params.id;

  db.run(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark notification as read' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification marked as read' });
    }
  );
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, (req, res) => {
  db.run(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
    [req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark notifications as read' });
      }

      res.json({ 
        message: 'All notifications marked as read',
        updated_count: this.changes
      });
    }
  );
});

// Get unread notifications count
router.get('/unread-count', authenticateToken, (req, res) => {
  db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get unread count' });
      }

      res.json({ count: result.count });
    }
  );
});

// Delete notification
router.delete('/:id', authenticateToken, (req, res) => {
  const notificationId = req.params.id;

  db.run(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [notificationId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete notification' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification deleted successfully' });
    }
  );
});

module.exports = router;
