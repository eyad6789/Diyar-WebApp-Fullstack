const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all posts for feed
router.get('/feed', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      p.id, p.caption, p.image_url, p.created_at,
      u.id as user_id, u.username, u.full_name, u.profile_picture,
      COUNT(DISTINCT l.id) as like_count,
      COUNT(DISTINCT c.id) as comment_count,
      CASE WHEN ul.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    LEFT JOIN likes ul ON p.id = ul.post_id AND ul.user_id = ?
    GROUP BY p.id, u.id, ul.id
    ORDER BY p.created_at DESC
  `;

  db.all(query, [req.user.id], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    res.json({ posts });
  });
});

// Create new post
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const { caption } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  db.run(
    'INSERT INTO posts (user_id, caption, image_url) VALUES (?, ?, ?)',
    [req.user.id, caption || '', imageUrl],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create post' });
      }

      // Get the created post with user info
      const query = `
        SELECT 
          p.id, p.caption, p.image_url, p.created_at,
          u.id as user_id, u.username, u.full_name, u.profile_picture
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `;

      db.get(query, [this.lastID], (err, post) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created post' });
        }

        res.status(201).json({
          message: 'Post created successfully',
          post: {
            ...post,
            like_count: 0,
            comment_count: 0,
            is_liked: 0
          }
        });
      });
    }
  );
});

// Like/unlike post
router.post('/:id/like', authenticateToken, (req, res) => {
  const postId = req.params.id;

  // Check if already liked
  db.get('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId], (err, existingLike) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingLike) {
      // Unlike
      db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to unlike post' });
        }
        res.json({ message: 'Post unliked', liked: false });
      });
    } else {
      // Like
      db.run('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to like post' });
        }
        res.json({ message: 'Post liked', liked: true });
      });
    }
  });
});

// Get comments for a post
router.get('/:id/comments', authenticateToken, (req, res) => {
  const postId = req.params.id;

  const query = `
    SELECT 
      c.id, c.content, c.created_at,
      u.id as user_id, u.username, u.full_name, u.profile_picture
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;

  db.all(query, [postId], (err, comments) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
    res.json({ comments });
  });
});

// Add comment to post
router.post('/:id/comments', authenticateToken, (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  db.run(
    'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)',
    [req.user.id, postId, content.trim()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add comment' });
      }

      // Get the created comment with user info
      const query = `
        SELECT 
          c.id, c.content, c.created_at,
          u.id as user_id, u.username, u.full_name, u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `;

      db.get(query, [this.lastID], (err, comment) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created comment' });
        }

        res.status(201).json({
          message: 'Comment added successfully',
          comment
        });
      });
    }
  );
});

module.exports = router;
