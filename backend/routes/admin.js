const express = require('express');
const { db } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Admin middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user.username !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all users
router.get('/users', authenticateToken, adminOnly, (req, res) => {
  const query = `
    SELECT id, username, email, full_name, bio, profile_picture, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json({ users });
  });
});

// Get all properties with user info
router.get('/properties', authenticateToken, adminOnly, (req, res) => {
  const query = `
    SELECT 
      p.*, 
      u.username, u.full_name,
      COUNT(DISTINCT l.id) as like_count,
      COUNT(DISTINCT c.id) as comment_count
    FROM properties p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.property_id
    LEFT JOIN comments c ON p.id = c.property_id
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
  `;

  db.all(query, [], (err, properties) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }

    const processedProperties = properties.map(property => ({
      ...property,
      image_urls: property.image_urls ? JSON.parse(property.image_urls) : [],
      features: property.features ? JSON.parse(property.features) : []
    }));

    res.json({ properties: processedProperties });
  });
});

// Delete user
router.delete('/users/:id', authenticateToken, adminOnly, (req, res) => {
  const userId = req.params.id;

  // Don't allow deleting admin user
  if (userId === req.user.id.toString()) {
    return res.status(400).json({ error: 'Cannot delete your own admin account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// Delete property
router.delete('/properties/:id', authenticateToken, adminOnly, (req, res) => {
  const propertyId = req.params.id;

  db.run('DELETE FROM properties WHERE id = ?', [propertyId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete property' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  });
});

// Get dashboard stats
router.get('/stats', authenticateToken, adminOnly, (req, res) => {
  const queries = {
    users: 'SELECT COUNT(*) as count FROM users',
    properties: 'SELECT COUNT(*) as count FROM properties',
    messages: 'SELECT COUNT(*) as count FROM messages',
    requests: 'SELECT COUNT(*) as count FROM property_requests'
  };

  const stats = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.get(queries[key], [], (err, result) => {
      if (!err) {
        stats[key] = result.count;
      } else {
        stats[key] = 0;
      }
      
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json(stats);
      }
    });
  });
});

module.exports = router;
