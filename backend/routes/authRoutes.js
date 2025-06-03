const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUsers,
  getProfile,
  uploadProfilePicture
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const { profileUpload } = require('../util/upload');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', getUsers);
router.get('/profile',protect, getProfile); // Get logged-in user's profile
router.post('/profile-picture', protect, profileUpload.single('profilePicture'), uploadProfilePicture);


module.exports = router;
