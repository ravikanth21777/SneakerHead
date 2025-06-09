const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  placeBid,
  buyProduct,
  getMyAuctions,
  getMyBids,
  uploadProductImages, 
  deleteProduct,
  getOrderSummary
} = require('../controllers/productController');

const { productUpload } = require('../util/upload');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createProduct);
router.get('/', getProducts);
// Place specific routes before parametric routes
router.get('/my-auctions', protect, getMyAuctions);
router.get('/my-bids', protect, getMyBids);
router.get('/order-summary/:id' ,protect, getOrderSummary);
// Parametric routes
router.get('/:id', getProductById);
router.put('/:id/bid', protect, placeBid);
router.put('/:id/buy', protect, buyProduct);
router.post('/:id/upload-images', protect, productUpload.array('productImages', 5), uploadProductImages);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
