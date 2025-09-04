const jwt = require('jsonwebtoken');
const { db } = require('../models/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Get user details from database
    db.get('SELECT id, username, email, full_name FROM users WHERE id = ?', [user.userId], (err, userRow) => {
      if (err || !userRow) {
        return res.status(403).json({ error: 'User not found' });
      }
      
      req.user = userRow;
      next();
    });
  });
};

module.exports = { authenticateToken };
