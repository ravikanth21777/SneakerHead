const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUsers,
  getProfile
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', getUsers);
router.get('/profile',protect, getProfile); // Get logged-in user's profile

module.exports = router;
