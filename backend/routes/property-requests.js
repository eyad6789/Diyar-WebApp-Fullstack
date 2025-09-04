const express = require('express');
const { db } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create property request
router.post('/', authenticateToken, (req, res) => {
  const {
    title, property_type, category, min_price, max_price, currency = 'IQD',
    min_bedrooms, max_bedrooms, min_bathrooms, min_area, max_area,
    preferred_cities, preferred_districts, features, description,
    contact_phone, contact_whatsapp
  } = req.body;

  if (!title || !property_type || !category) {
    return res.status(400).json({ error: 'Title, property type, and category are required' });
  }

  const citiesJson = preferred_cities ? JSON.stringify(preferred_cities) : '[]';
  const districtsJson = preferred_districts ? JSON.stringify(preferred_districts) : '[]';
  const featuresJson = features ? JSON.stringify(features) : '[]';

  db.run(
    `INSERT INTO property_requests (
      user_id, title, property_type, category, min_price, max_price, currency,
      min_bedrooms, max_bedrooms, min_bathrooms, min_area, max_area,
      preferred_cities, preferred_districts, features, description,
      contact_phone, contact_whatsapp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id, title, property_type, category, min_price || null, max_price || null, currency,
      min_bedrooms || null, max_bedrooms || null, min_bathrooms || null, min_area || null, max_area || null,
      citiesJson, districtsJson, featuresJson, description || null,
      contact_phone || null, contact_whatsapp || null
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create property request' });
      }

      // Find matching properties and notify owners
      findMatchingProperties(this.lastID, req.body);

      res.status(201).json({
        message: 'Property request created successfully',
        requestId: this.lastID
      });
    }
  );
});

// Get user's property requests
router.get('/my-requests', authenticateToken, (req, res) => {
  const query = `
    SELECT pr.*, COUNT(DISTINCT n.id) as match_count
    FROM property_requests pr
    LEFT JOIN notifications n ON pr.id = n.related_id AND n.type = 'property_match'
    WHERE pr.user_id = ?
    GROUP BY pr.id
    ORDER BY pr.created_at DESC
  `;

  db.all(query, [req.user.id], (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    const processedRequests = requests.map(request => ({
      ...request,
      preferred_cities: request.preferred_cities ? JSON.parse(request.preferred_cities) : [],
      preferred_districts: request.preferred_districts ? JSON.parse(request.preferred_districts) : [],
      features: request.features ? JSON.parse(request.features) : []
    }));

    res.json({ requests: processedRequests });
  });
});

// Get all active property requests (for property owners to see)
router.get('/active', authenticateToken, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const query = `
    SELECT pr.*, u.username, u.full_name, u.profile_picture
    FROM property_requests pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.status = 'active'
    ORDER BY pr.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const offset = (page - 1) * limit;

  db.all(query, [parseInt(limit), offset], (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    const processedRequests = requests.map(request => ({
      ...request,
      preferred_cities: request.preferred_cities ? JSON.parse(request.preferred_cities) : [],
      preferred_districts: request.preferred_districts ? JSON.parse(request.preferred_districts) : [],
      features: request.features ? JSON.parse(request.features) : []
    }));

    res.json({ requests: processedRequests });
  });
});

// Find matching properties for a request
function findMatchingProperties(requestId, requestData) {
  let query = `
    SELECT p.*, u.id as owner_id, u.username, u.full_name
    FROM properties p
    JOIN users u ON p.user_id = u.id
    WHERE p.status = 'active'
  `;
  
  const params = [];

  // Match property type and category
  if (requestData.property_type) {
    query += ' AND p.property_type = ?';
    params.push(requestData.property_type);
  }
  
  if (requestData.category) {
    query += ' AND p.category = ?';
    params.push(requestData.category);
  }

  // Price range
  if (requestData.min_price) {
    query += ' AND p.price >= ?';
    params.push(requestData.min_price);
  }
  
  if (requestData.max_price) {
    query += ' AND p.price <= ?';
    params.push(requestData.max_price);
  }

  // Bedrooms
  if (requestData.min_bedrooms) {
    query += ' AND p.bedrooms >= ?';
    params.push(requestData.min_bedrooms);
  }
  
  if (requestData.max_bedrooms) {
    query += ' AND p.bedrooms <= ?';
    params.push(requestData.max_bedrooms);
  }

  // Area
  if (requestData.min_area) {
    query += ' AND p.area >= ?';
    params.push(requestData.min_area);
  }
  
  if (requestData.max_area) {
    query += ' AND p.area <= ?';
    params.push(requestData.max_area);
  }

  // City matching
  if (requestData.preferred_cities && requestData.preferred_cities.length > 0) {
    const cityConditions = requestData.preferred_cities.map(() => 'p.city LIKE ?').join(' OR ');
    query += ` AND (${cityConditions})`;
    requestData.preferred_cities.forEach(city => params.push(`%${city}%`));
  }

  db.all(query, params, (err, matchingProperties) => {
    if (err) {
      console.error('Error finding matching properties:', err);
      return;
    }

    // Create notifications for property owners
    matchingProperties.forEach(property => {
      const notificationTitle = `طلب عقار مطابق لعقارك`;
      const notificationContent = `يوجد شخص يبحث عن عقار مشابه لعقارك: ${property.title}`;

      db.run(
        'INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
        [property.owner_id, 'property_match', notificationTitle, notificationContent, requestId],
        (err) => {
          if (err) {
            console.error('Error creating notification:', err);
          }
        }
      );
    });
  });
}

// Update property request status
router.patch('/:id/status', authenticateToken, (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  if (!['active', 'fulfilled', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE property_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [status, requestId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update request status' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Request not found or not authorized' });
      }

      res.json({ message: 'Request status updated successfully' });
    }
  );
});

module.exports = router;
