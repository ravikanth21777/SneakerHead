// server.js

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const dotenv     = require('dotenv');
const connectDB  = require('./config/db');

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));