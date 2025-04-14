const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Replace with your actual admin credentials verification
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all trips
router.get('/trips', auth, async (req, res) => {
  try {
    const trips = await Trip.find().populate('driver', 'name');
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 