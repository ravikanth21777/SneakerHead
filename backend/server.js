// server.js

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const dotenv     = require('dotenv');
const connectDB  = require('./config/db');
const { profileUpload, productUpload } = require('./utils/upload');


// Models
const User    = require('./models/userModel');
const Product = require('./models/productModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
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
// Auth Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// ========== AUTH ROUTES ==========

// @route   POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = await User.create({ username, email, password: hashedPassword });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ _id: newUser._id, username: newUser.username, email: newUser.email, token });
});

// @route   POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ _id: user._id, username: user.username, email: user.email, token });
});

// ========== PRODUCT / AUCTION ROUTES ==========

// @route   POST /api/products
app.post('/api/products', protect, async (req, res) => {
  const {
    name, description, brand, edition,
    size, category, startBid, AuctionEndDate,
    bidIncrement, buyNowPrice
  } = req.body;

  if (!name || !description || !brand || !edition || !size || !category || !startBid || !AuctionEndDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const product = await Product.create({
    name, description, brand, edition,
    size, category, startBid,
    currentBid: startBid,
    AuctionEndDate: new Date(AuctionEndDate),
    bidIncrement: bidIncrement || 0,
    buyNowPrice: buyNowPrice || null,
    seller: req.user._id
  });
  res.status(201).json(product);
});

// @route   GET /api/products
app.get('/api/products', async (req, res) => {
  const now = new Date();
  const products = await Product.find({ AuctionEndDate: { $gt: now } });
  res.json(products);
});

// @route   GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'username')
    .populate('buyer', 'username');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// @route   PUT /api/products/:id/bid
app.put('/api/products/:id/bid', protect, async (req, res) => {
  const { amount } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (new Date() > product.AuctionEndDate) return res.status(400).json({ message: 'Auction has ended' });
  const minAllowed = product.currentBid + (product.bidIncrement || 0);
  if (amount < minAllowed) return res.status(400).json({ message: `Bid must be at least ${minAllowed}` });

  product.currentBid = amount;
  product.buyer = req.user._id;
  await product.save();
  res.json(product);
});

// @route   PUT /api/products/:id/buy
app.put('/api/products/:id/buy', protect, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.buyNowPrice) return res.status(400).json({ message: 'Buy Now not available' });
  if (new Date() > product.AuctionEndDate) return res.status(400).json({ message: 'Auction has ended' });

  product.currentBid = product.buyNowPrice;
  product.buyer = req.user._id;
  await product.save();
  res.json(product);
});

// @route   GET /api/products/my-auctions
app.get('/api/products/my-auctions', protect, async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
});

// @route   GET /api/products/my-bids
app.get('/api/products/my-bids', protect, async (req, res) => {
  const products = await Product.find({ buyer: req.user._id });
  res.json(products);
});

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




app.post('/api/products/upload-images', productUpload.array('productImages', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const imageUrls = req.files.map(file => file.path || file.secure_url);

    res.status(200).json({
      message: 'Product images uploaded successfully',
      imageUrls,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error while uploading images' });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));