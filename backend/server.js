// server.js
const User= require('./models/userModel');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
 // Assuming you have a db.js file for DB connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload  = require("./util/upload");
require('dotenv').config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());


// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field for security
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// ========== REGISTER ==========
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.status(201).json({
    _id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    token,
  });
});

// ========== LOGIN ==========
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    token,
  });
}); 

//=============== TO POST PROFILE PICTURE ==================

app.post('/api/user/profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.body.userId; // should come from frontend
    const imageUrl = req.file.path || req.file.secure_url || req.file.url; // Cloudinary URL

    if (!userId || !imageUrl) {
      return res.status(400).json({ message: 'Missing user ID or image file' });
    }

    // Find user and update profile picture
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
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));