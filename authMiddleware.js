//middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify the token using access token secret
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        console.error('Token expired:', err);
        return res.status(401).json({ error: 'Token expired, please log in again' });
      }
      console.error('Token verification failed:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Attach user information to the request
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  });
}

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  // Ensure that the user's role is admin
  if (req.user.role !== 'admin') {
    console.warn('Access denied. Admins only. User:', req.user.email);
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  isAdmin
};


