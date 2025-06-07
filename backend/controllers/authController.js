const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../util/cloudinary');


exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id ;
    const imageUrl = req.file?.path || req.file?.secure_url || req.file?.url;

    if (!userId || !imageUrl) {
      return res.status(400).json({ message: 'Missing user ID or image file' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePictureUrl: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("userId:", userId);
    console.log("Uploaded file info:", req.file);
    console.log("imageUrl:", imageUrl);
    console.log("Updated user:", user);

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePictureUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error while uploading profile picture' });
  }
};

exports.registerUser = async (req, res) => {
  const { username, email, phone,password } = req.body;
  if (!username || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (await (User.findOne({ email })) || await User.findOne({ username }) || await User.findOne({ phone })) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = await User.create({ username, email,phone, password: hashedPassword });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ _id: newUser._id, username: newUser.username, email: newUser.email,phone:newUser.phone , token });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ _id: user._id, username: user.username, email: user.email, token });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { username, email,phone, password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if(phone) user.phone = phone;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { _id: user._id, username: user.username, email: user.email , phone : user.phone } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
