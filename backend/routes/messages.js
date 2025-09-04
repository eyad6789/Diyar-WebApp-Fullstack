const express = require('express');
const { db } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get conversations list
router.get('/conversations', authenticateToken, (req, res) => {
  const query = `
    SELECT DISTINCT
      CASE 
        WHEN m.sender_id = ? THEN m.receiver_id 
        ELSE m.sender_id 
      END as contact_id,
      u.username, u.full_name, u.profile_picture,
      m.content as last_message,
      m.created_at as last_message_time,
      COUNT(CASE WHEN m.receiver_id = ? AND m.is_read = 0 THEN 1 END) as unread_count
    FROM messages m
    JOIN users u ON (
      CASE 
        WHEN m.sender_id = ? THEN u.id = m.receiver_id 
        ELSE u.id = m.sender_id 
      END
    )
    WHERE m.sender_id = ? OR m.receiver_id = ?
    GROUP BY contact_id, u.username, u.full_name, u.profile_picture
    ORDER BY last_message_time DESC
  `;

  db.all(query, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id], (err, conversations) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
    res.json({ conversations });
  });
});

// Get messages with a specific user
router.get('/conversation/:userId', authenticateToken, (req, res) => {
  const otherUserId = req.params.userId;
  const { page = 1, limit = 50 } = req.query;

  // Mark messages as read
  db.run(
    'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?',
    [otherUserId, req.user.id]
  );

  const query = `
    SELECT m.*, 
           s.username as sender_username, s.full_name as sender_name, s.profile_picture as sender_picture,
           p.title as property_title, p.price as property_price, p.image_urls as property_images
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    LEFT JOIN properties p ON m.property_id = p.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const offset = (page - 1) * limit;

  db.all(query, [req.user.id, otherUserId, otherUserId, req.user.id, parseInt(limit), offset], (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    const processedMessages = messages.map(message => ({
      ...message,
      property_images: message.property_images ? JSON.parse(message.property_images) : null
    })).reverse();

    res.json({ messages: processedMessages });
  });
});

// Send message
router.post('/send', authenticateToken, (req, res) => {
  const { receiver_id, content, property_id, message_type = 'text' } = req.body;

  if (!receiver_id || !content) {
    return res.status(400).json({ error: 'Receiver ID and content are required' });
  }

  // Check if receiver exists
  db.get('SELECT id FROM users WHERE id = ?', [receiver_id], (err, receiver) => {
    if (err || !receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    db.run(
      'INSERT INTO messages (sender_id, receiver_id, property_id, content, message_type) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, receiver_id, property_id || null, content, message_type],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to send message' });
        }

        // Get the created message with sender info
        const query = `
          SELECT m.*, 
                 s.username as sender_username, s.full_name as sender_name, s.profile_picture as sender_picture,
                 p.title as property_title, p.price as property_price, p.image_urls as property_images
          FROM messages m
          JOIN users s ON m.sender_id = s.id
          LEFT JOIN properties p ON m.property_id = p.id
          WHERE m.id = ?
        `;

        db.get(query, [this.lastID], (err, message) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch sent message' });
          }

          // Create notification for receiver
          const notificationTitle = `رسالة جديدة من ${req.user.full_name || req.user.username}`;
          db.run(
            'INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
            [receiver_id, 'message', notificationTitle, content.substring(0, 100), this.lastID]
          );

          res.status(201).json({
            message: 'Message sent successfully',
            data: {
              ...message,
              property_images: message.property_images ? JSON.parse(message.property_images) : null
            }
          });
        });
      }
    );
  });
});

// Send property inquiry
router.post('/property-inquiry', authenticateToken, (req, res) => {
  const { property_id, message } = req.body;

  if (!property_id) {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  // Get property and owner info
  db.get('SELECT user_id, title FROM properties WHERE id = ?', [property_id], (err, property) => {
    if (err || !property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.user_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot send inquiry to your own property' });
    }

    const inquiryMessage = message || `مرحباً، أنا مهتم بعقارك: ${property.title}. هل يمكنك تزويدي بمزيد من التفاصيل؟`;

    db.run(
      'INSERT INTO messages (sender_id, receiver_id, property_id, content, message_type) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, property.user_id, property_id, inquiryMessage, 'property_inquiry'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to send inquiry' });
        }

        // Create notification
        const notificationTitle = `استفسار جديد عن عقارك`;
        const notificationContent = `${req.user.full_name || req.user.username} أرسل استفساراً عن: ${property.title}`;
        
        db.run(
          'INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
          [property.user_id, 'message', notificationTitle, notificationContent, this.lastID]
        );

        res.status(201).json({ message: 'Property inquiry sent successfully' });
      }
    );
  });
});

// Delete message
router.delete('/:messageId', authenticateToken, (req, res) => {
  const messageId = req.params.messageId;

  db.run(
    'DELETE FROM messages WHERE id = ? AND sender_id = ?',
    [messageId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete message' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Message not found or not authorized' });
      }

      res.json({ message: 'Message deleted successfully' });
    }
  );
});

module.exports = router;
