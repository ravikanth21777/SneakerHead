const Product = require('../models/productModel');
const cloudinary = require('../util/cloudinary');
const { createNotification } = require('./notificationController');

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
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username email phone profilePictureUrl') // 👈 Add fields you want
      .populate('buyer', 'username');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Place a Bid
exports.placeBid = async (req, res) => {
  try {
    console.log('🎯 Bid placement started');
    const { amount } = req.body;
    const productId = req.params.id;
    
    console.log('📦 Bid details:', { productId, amount, userId: req.user._id });

    // Find the product and validate
    let product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found:', productId);
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

    await product.save();
     console.log('[placeBid] sending notifications');
  await createNotification(
    product.seller,
    `New bid of ₹${amount.toLocaleString()} on "${product.name}"`
  );
  await createNotification(
    req.user._id,
    `You placed a bid of ₹${amount.toLocaleString()} on "${product.name}"`
  );
    console.log('💾 Product updated with new bid');

    // Fetch fresh product data with populated fields
    const updatedProduct = await Product.findById(productId)
      .populate('seller', 'username')
      .populate('buyer', 'username');

    // Prepare socket payload
    const payload = {
      productId: updatedProduct._id.toString(),
      currentBid: Number(amount),
      bidder: req.user._id.toString(),
      endDate: updatedProduct.AuctionEndDate,
      updatedProduct: updatedProduct
    };

    console.log('🚀 Emitting socket events with payload:', payload);
    
    // Get socket.io instance
    const io = req.app.locals.io;
    
    // Emit to product room
    console.log('📢 Emitting to product room:', productId);
    io.to(productId).emit('newBid', payload);
    
    // Emit to global room
    console.log('🌐 Emitting to global room');
    io.to('globalUpdates').emit('globalBidUpdate', payload);
    
    // Also emit to all connected clients as fallback
    console.log('📣 Emitting to all clients');
    io.emit('globalBidUpdate', payload);

    console.log('✅ Bid placement completed');
    return res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Error in placeBid:', error);
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

  await createNotification(
    req.user._id,
    `You bought “${product.name}” for ₹${product.buyNowPrice.toLocaleString()}`
  )
  await createNotification(
    product.seller,
    `Your sneaker “${product.name}” just sold for ₹${product.buyNowPrice.toLocaleString()}`
  )

 res.json(product);
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
  const now = new Date();
  const products = await Product.find({ 
    seller: req.user._id,
    AuctionEndDate: { $lt: now }, 
  });
  res.json(products);
};

// My Bids
exports.getMyBids = async (req, res) => {
  const now = new Date();
  const products = await Product.find({ 
    buyer: req.user._id ,
    AuctionEndDate: { $lt: now },
  });
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

