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
    currentBid: startBid, // Initialize currentBid with startBid
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
  const products = await Product.find({ 
    AuctionEndDate: { $gt: now },
    auctionEnded: false
  });
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
  try {
    const { amount } = req.body;
    const productId = req.params.id;
    
    // Find the product and validate
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if auction is still active
    const now = new Date();
    if (now > new Date(product.AuctionEndDate) || product.auctionEnded) {
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Validate bid amount
    const currentBidAmount = product.currentBid || product.startBid;
    const minAllowed = currentBidAmount + (product.bidIncrement || 0);
    if (Number(amount) < minAllowed) {
      return res.status(400).json({ 
        message: `Bid must be at least ${minAllowed}`,
        minBid: minAllowed 
      });
    }

    // Update product with new bid
    product.currentBid = Number(amount);
    product.buyer = req.user._id;

    // Check if auction is ending soon (within 30 seconds)
    const timeToEnd = new Date(product.AuctionEndDate) - now;
    if (timeToEnd <= 30000) { // 30 seconds or less
      // Extend auction by 30 seconds if bid is placed near the end
      const newEndDate = new Date(now.getTime() + 30000);
      product.AuctionEndDate = newEndDate;
    }

    await product.save();

    // Fetch fresh product data with populated fields
    product = await Product.findById(productId)
      .populate('seller', 'username')
      .populate('buyer', 'username');

    // Prepare socket payload
    const payload = {
      productId: product._id.toString(),
      currentBid: Number(amount),
      bidder: req.user._id.toString(),
      endDate: product.AuctionEndDate,
      updatedProduct: product
    };
    
    // Emit to all clients in the product room
    const io = req.app.locals.io;
    io.in(productId).emit('newBid', payload);

    return res.json(product);
  } catch (error) {
    console.error('Error placing bid:', error);
    return res.status(500).json({ message: 'Server error while placing bid' });
  }
};

// Buy Now
exports.buyProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.buyNowPrice) return res.status(400).json({ message: 'Buy Now not available' });
  if (product.auctionEnded || new Date() > product.AuctionEndDate) {
    return res.status(400).json({ message: 'Auction has ended' });
  }

  product.currentBid = product.buyNowPrice;
  product.buyer = req.user._id;
  product.auctionEnded = true;
  await product.save();

  // Emit auction ended event
  const io = req.app.locals.io;
  io.in(product._id.toString()).emit('auctionEnded', {
    productId: product._id.toString(),
    finalBid: product.buyNowPrice,
    winner: req.user._id.toString()
  });

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

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Product successfully deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Server error while deleting product' });
  }
};

