//routes/auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Email format regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ------------------------------------
// POST /api/auth/login
// ------------------------------------
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  });
});

// ------------------------------------
// POST /api/auth/register (Admins only)
// ------------------------------------
router.post('/register', authenticateToken, isAdmin, (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    db.query(insertQuery, [email, password, role], (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ error: 'Could not register user' });
      }

      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// ------------------------------------
// GET /api/auth/profile
// ------------------------------------
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  });
});

// GET /api/auth/getUserByEmail/:email (Admins only)
router.get('/getUserByEmail/:email', authenticateToken, isAdmin, (req, res) => {
  const email = req.params.email;

  // Query the database to get the user by email
  const query = 'SELECT id FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error (SELECT):', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the user ID
    const userId = results[0].id;
    res.json({ id: userId });
  });
});

// ------------------------------------
// POST /api/auth/logout (placeholder)
// ------------------------------------
router.post('/logout', (req, res) => {
  // Token invalidation (if implemented) goes here
  res.status(200).json({ message: 'Logged out successfully' });
});

// ------------------------------------
// DELETE /api/auth/removeAccess/:id (Admins only)
// ------------------------------------
// DELETE /api/auth/removeUserByEmail/:email (Admins only)
router.delete('/removeUserByEmail/:email', authenticateToken, isAdmin, (req, res) => {
  const emailToRemove = req.params.email; // Email of the user to remove
  const adminUserId = req.user.id; // ID of the admin who is requesting the removal
  const adminRole = req.user.role; // Role of the admin

  // Prevent admin from removing their own access
  if (req.user.email === emailToRemove) {
    return res.status(400).json({ error: 'Admin cannot remove their own access.' });
  }

  // Check if the user to be removed exists in the database
  const checkQuery = 'SELECT id, role FROM users WHERE email = ?';
  db.query(checkQuery, [emailToRemove], (err, results) => {
    if (err) {
      console.error('Database error (SELECT):', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userToRemove = results[0];

    // Prevent removing admin users
    if (userToRemove.role === 'admin') {
      return res.status(400).json({ error: 'Cannot remove an admin user.' });
    }

    // Proceed to remove the user from the database
    const deleteQuery = 'DELETE FROM users WHERE email = ?';
    db.query(deleteQuery, [emailToRemove], (err) => {
      if (err) {
        console.error('Database error (DELETE):', err);
        return res.status(500).json({ error: 'Failed to remove user access' });
      }

      // Successfully removed the user
      res.status(200).json({ message: 'User access removed successfully' });
    });
  });
});


module.exports = router;
