const Product = require('../models/productModel');
const cloudinary = require('../util/cloudinary'); 

// Create Product
exports.createProduct = async (req, res) => {
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
};

// Get All Active Products
exports.getProducts = async (req, res) => {
  const now = new Date();
  const products = await Product.find({ AuctionEndDate: { $gt: now } });
  res.json(products);
};

// Get Single Product
exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'username')
    .populate('buyer', 'username');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// Place a Bid
exports.placeBid = async (req, res) => {
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
};

// Buy Now
exports.buyProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.buyNowPrice) return res.status(400).json({ message: 'Buy Now not available' });
  if (new Date() > product.AuctionEndDate) return res.status(400).json({ message: 'Auction has ended' });

  product.currentBid = product.buyNowPrice;
  product.buyer = req.user._id;
  await product.save();
  res.json(product);
};

// My Auctions
exports.getMyAuctions = async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
};

// My Bids
exports.getMyBids = async (req, res) => {
  const products = await Product.find({ buyer: req.user._id });
  res.json(products);
};

// Upload Product Images
exports.uploadProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const imageUrls = req.files.map(file => file.path || file.secure_url || file.url);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.productPictureUrls.push(...imageUrls);
    await product.save();

    res.status(200).json({
      message: 'Product images uploaded and saved successfully',
      productPictureUrls: product.productPictureUrls,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error while uploading images' });
  }
};

// Delete the listed products
exports.deleteProduct = async (req, res) => {
  try {
    // 1) Find the product (to check ownership)
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // 2) Verify that the current user is the seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You cannot delete this product' });
    }

    // 3) Delete by ID directly
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Product successfully deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res
      .status(500)
      .json({ message: 'Server error while deleting product' });
  }
};

