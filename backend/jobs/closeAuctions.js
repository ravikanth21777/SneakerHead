// backend/jobs/closeAuctions.js

const cron = require('node-cron');
const Product = require('../models/productModel');
const { createNotification } = require('../controllers/notificationController');

module.exports = function startAuctionCloser() {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // find auctions ended but not yet closed
      const expired = await Product.find({
        AuctionEndDate: { $lt: now },
        isClosed: false
      });
      if (expired.length === 0) return;

      for (const product of expired) {
        // mark closed
        product.isClosed = true;
        await product.save();

        const winnerId = product.buyer;
        const sellerId = product.seller;
        const finalPrice = product.currentBid;

        // notify winner
        if (winnerId) {
          await createNotification(
            winnerId,
            `🎉 You won the auction for "${product.name}" at ₹${finalPrice.toLocaleString()}!`
          );
        }

        // notify seller
        await createNotification(
          sellerId,
          `✅ Your auction "${product.name}" closed at ₹${finalPrice.toLocaleString()}.`
        );
      }

      console.log(`[closeAuctions] closed ${expired.length} auctions`);
    } catch (err) {
      console.error('[closeAuctions] error:', err);
    }
  });
};
