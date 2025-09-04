const express = require('express');
const { db } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:username', authenticateToken, (req, res) => {
  const username = req.params.username;

  const userQuery = `
    SELECT 
      u.id, u.username, u.full_name, u.bio, u.profile_picture, u.created_at,
      COUNT(DISTINCT p.id) as post_count,
      COUNT(DISTINCT f1.id) as followers_count,
      COUNT(DISTINCT f2.id) as following_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN follows f1 ON u.id = f1.following_id
    LEFT JOIN follows f2 ON u.id = f2.follower_id
    WHERE u.username = ?
    GROUP BY u.id
  `;

  db.get(userQuery, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's posts
    const postsQuery = `
      SELECT 
        p.id, p.caption, p.image_url, p.created_at,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count
      FROM posts p
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    db.all(postsQuery, [user.id], (err, posts) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch user posts' });
      }

      res.json({
        user: {
          ...user,
          posts
        }
      });
    });
  });
});

// Search users
router.get('/search/:query', authenticateToken, (req, res) => {
  const searchQuery = req.params.query;

  db.all(
    'SELECT id, username, full_name, profile_picture FROM users WHERE username LIKE ? OR full_name LIKE ? LIMIT 20',
    [`%${searchQuery}%`, `%${searchQuery}%`],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Search failed' });
      }
      res.json({ users });
    }
  );
});

module.exports = router;
