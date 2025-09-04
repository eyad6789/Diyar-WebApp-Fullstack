const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for multiple file uploads
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Get all properties for feed
router.get('/feed', authenticateToken, (req, res) => {
  const { type, category, city, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
  
  let query = `
    SELECT 
      p.*, 
      u.id as user_id, u.username, u.full_name, u.profile_picture,
      COUNT(DISTINCT l.id) as like_count,
      COUNT(DISTINCT c.id) as comment_count,
      CASE WHEN ul.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
    FROM properties p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.property_id
    LEFT JOIN comments c ON p.id = c.property_id
    LEFT JOIN likes ul ON p.id = ul.property_id AND ul.user_id = ?
    WHERE p.status = 'active'
  `;
  
  const params = [req.user.id];
  
  if (type) {
    query += ' AND p.property_type = ?';
    params.push(type);
  }
  if (category) {
    query += ' AND p.category = ?';
    params.push(category);
  }
  if (city) {
    query += ' AND p.city LIKE ?';
    params.push(`%${city}%`);
  }
  if (minPrice) {
    query += ' AND p.price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ' AND p.price <= ?';
    params.push(maxPrice);
  }
  
  query += `
    GROUP BY p.id, u.id, ul.id
    ORDER BY p.is_featured DESC, p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const offset = (page - 1) * limit;
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, properties) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }

    // Parse JSON fields
    const processedProperties = properties.map(property => ({
      ...property,
      image_urls: property.image_urls ? JSON.parse(property.image_urls) : [],
      features: property.features ? JSON.parse(property.features) : []
    }));

    res.json({ properties: processedProperties });
  });
});

// Get reels (properties with videos)
router.get('/reels', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      p.*, 
      u.id as user_id, u.username, u.full_name, u.profile_picture,
      COUNT(DISTINCT l.id) as like_count,
      COUNT(DISTINCT c.id) as comment_count,
      CASE WHEN ul.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
    FROM properties p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.property_id
    LEFT JOIN comments c ON p.id = c.property_id
    LEFT JOIN likes ul ON p.id = ul.property_id AND ul.user_id = ?
    WHERE p.status = 'active' AND p.video_url IS NOT NULL AND p.video_url != ''
    GROUP BY p.id, u.id, ul.id
    ORDER BY p.created_at DESC
  `;

  db.all(query, [req.user.id], (err, properties) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch reels' });
    }

    const processedProperties = properties.map(property => ({
      ...property,
      image_urls: property.image_urls ? JSON.parse(property.image_urls) : [],
      features: property.features ? JSON.parse(property.features) : []
    }));

    res.json({ properties: processedProperties });
  });
});

// Create new property
router.post('/', authenticateToken, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  const {
    title, description, price, currency = 'IQD', property_type, category,
    bedrooms, bathrooms, area, area_unit = 'sqm', location, city, district,
    latitude, longitude, features
  } = req.body;

  if (!title || !price || !property_type || !category || !location || !city) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Process uploaded files
  const imageUrls = req.files.images ? req.files.images.map(file => `/uploads/${file.filename}`) : [];
  const videoUrl = req.files.video ? `/uploads/${req.files.video[0].filename}` : null;

  const featuresJson = features ? JSON.stringify(features.split(',').map(f => f.trim())) : '[]';
  const imageUrlsJson = JSON.stringify(imageUrls);

  db.run(
    `INSERT INTO properties (
      user_id, title, description, price, currency, property_type, category,
      bedrooms, bathrooms, area, area_unit, location, city, district,
      latitude, longitude, features, image_urls, video_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id, title, description, price, currency, property_type, category,
      bedrooms || null, bathrooms || null, area || null, area_unit, location, city, district || null,
      latitude || null, longitude || null, featuresJson, imageUrlsJson, videoUrl
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create property' });
      }

      // Get the created property with user info
      const query = `
        SELECT 
          p.*, 
          u.id as user_id, u.username, u.full_name, u.profile_picture
        FROM properties p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `;

      db.get(query, [this.lastID], (err, property) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch created property' });
        }

        res.status(201).json({
          message: 'Property created successfully',
          property: {
            ...property,
            image_urls: JSON.parse(property.image_urls),
            features: JSON.parse(property.features),
            like_count: 0,
            comment_count: 0,
            is_liked: 0
          }
        });
      });
    }
  );
});

// Get property details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await db.get(`
      SELECT 
        p.*, 
        u.id as user_id, u.username, u.full_name, u.profile_picture, u.phone,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count,
        CASE WHEN ul.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
      FROM properties p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.property_id
      LEFT JOIN comments c ON p.id = c.property_id
      LEFT JOIN likes ul ON p.id = ul.property_id AND ul.user_id = ?
      WHERE p.id = ? AND p.status = 'active'
      GROUP BY p.id, u.id, ul.id
    `, [req.user.id, id]);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment view count
    await db.run('UPDATE properties SET views_count = views_count + 1 WHERE id = ?', [id]);
    property.views_count += 1;

    res.json({ 
      property: {
        ...property,
        image_urls: property.image_urls ? JSON.parse(property.image_urls) : [],
        features: property.features ? JSON.parse(property.features) : []
      } 
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user properties
router.get('/user/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Get user ID from username
    const user = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const properties = await db.all(`
      SELECT 
        p.*, 
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count
      FROM properties p
      LEFT JOIN likes l ON p.id = l.property_id
      LEFT JOIN comments c ON p.id = c.property_id
      WHERE p.user_id = ? AND p.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [user.id]);

    res.json({ properties });
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike property
router.post('/:id/like', authenticateToken, async (req, res) => {
  const propertyId = req.params.id;

  db.get('SELECT id FROM likes WHERE user_id = ? AND property_id = ?', [req.user.id, propertyId], (err, existingLike) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingLike) {
      db.run('DELETE FROM likes WHERE user_id = ? AND property_id = ?', [req.user.id, propertyId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to unlike property' });
        }
        res.json({ message: 'Property unliked', liked: false });
      });
    } else {
      db.run('INSERT INTO likes (user_id, property_id) VALUES (?, ?)', [req.user.id, propertyId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to like property' });
        }
        res.json({ message: 'Property liked', liked: true });
      });
    }
  });
});

// Get comments for a property
router.get('/:id/comments', authenticateToken, (req, res) => {
  const propertyId = req.params.id;

  const query = `
    SELECT 
      c.id, c.content, c.created_at,
      u.id as user_id, u.username, u.full_name, u.profile_picture
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.property_id = ?
    ORDER BY c.created_at ASC
  `;

  db.all(query, [propertyId], (err, comments) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
    res.json({ comments });
  });
});

// Add comment to property
router.post('/:id/comments', authenticateToken, (req, res) => {
  const propertyId = req.params.id;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  db.run(
    'INSERT INTO comments (user_id, property_id, content) VALUES (?, ?, ?)',
    [req.user.id, propertyId, content.trim()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add comment' });
      }

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
