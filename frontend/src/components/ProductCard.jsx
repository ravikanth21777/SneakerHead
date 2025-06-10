import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  const [currentBid, setCurrentBid] = useState(product.currentBid || product.startBid || 0);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when product prop changes
  useEffect(() => {
    console.log('Product update received:', product.id, {
      newBid: product.currentBid,
      oldBid: currentBid,
      startBid: product.startBid
    });

    const newBidAmount = Number(product.currentBid);
    if (!isNaN(newBidAmount) && newBidAmount !== currentBid && newBidAmount > 0) {
      console.log('Updating bid amount:', {
        from: currentBid,
        to: newBidAmount
      });
      setIsUpdating(true);
      setCurrentBid(newBidAmount);
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [product.currentBid, product.startBid]);

  // Handle auction end status
  useEffect(() => {
    setIsAuctionEnded(product.auctionEnded || new Date() > new Date(product.AuctionEndDate));
  }, [product.auctionEnded, product.AuctionEndDate]);

  // Handle time left updates
  useEffect(() => {
  if (!product.AuctionEndDate) return;

  const calculateTimeLeft = () => {
    const end = new Date(product.AuctionEndDate);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) {
      setIsAuctionEnded(true);
      return "Auction Ended";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  };

  const updateTime = () => setTimeLeft(calculateTimeLeft());

  updateTime(); // set immediately
  const timer = setInterval(updateTime, 1000);
  return () => clearInterval(timer);
}, [product.AuctionEndDate]);
  const handleCardClick = (e) => {
    if (!e.target.closest('button')) {
      navigate(`/product/${product.id}`);
    }
  };

  // Price animation variants
  const priceAnimation = {
    initial: {
      scale: 1,
      backgroundColor: 'transparent'
    },
    highlight: {
      scale: [1, 1.05, 1],
      backgroundColor: ['transparent', 'rgba(255, 68, 68, 0.1)', 'transparent'],
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{
        cursor: "pointer",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: isUpdating ? "#ff4444" : "transparent",
          transformOrigin: "0%"
        }}
        animate={{
          scaleX: isUpdating ? [0, 1] : 0
        }}
        transition={{ duration: 0.5 }}
      />

      <div style={{ 
        position: "relative",
        paddingBottom: "100%",
        background: "#f8f8f8",
        overflow: "hidden"
      }}>
        <div
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden"
  }}
>
  <motion.img
    src={product.image}
    alt={product.name}
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }}
    initial={{ opacity: 1 }}
    whileHover={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  />

  <motion.img
    src={
      product.productPictureUrls && product.productPictureUrls[1]
        ? product.productPictureUrls[1]
        : product.image // fallback
    }
    alt={product.name + ' hover'}
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }}
    initial={{ opacity: 0 }}
    whileHover={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  />
</div>

      </div>

      <div style={{ padding: "1rem" }}>
        <span style={{
          display: "inline-block",
          padding: "0.2rem 0.5rem",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          fontSize: "0.7rem",
          fontWeight: "600",
          color: "#666",
          marginBottom: "0.5rem"
        }}>
          {product.brand}
        </span>

        <h3 style={{ 
          margin: "0 0 0.5rem 0",
          fontSize: "0.9rem",
          fontWeight: "500",
          color: "#333"
        }}>
          {product.name}
        </h3>

        <motion.div
          animate={isUpdating ? "highlight" : "initial"}
          variants={priceAnimation}
          style={{ padding: "0.5rem", borderRadius: "4px" }}
        >
          <div style={{ fontSize: "1rem", fontWeight: "600", color: isUpdating ? "#ff4444" : "#333" }}>
            ₹{formatPrice(currentBid)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#666" }}>
            Current Bid
          </div>
        </motion.div>

        <div style={{ 
          marginTop: "0.5rem",
          fontSize: "0.8rem",
          color: isAuctionEnded ? "#ff4444" : "#666"
        }}>
          {isAuctionEnded ? "Auction Ended" : `Time Left: ${timeLeft}`}
        </div>

        <button
          onClick={() => navigate(`/product/${product.id}`)}
          style={{
            width: "100%",
            marginTop: "1rem",
            padding: "0.5rem",
            backgroundColor: isAuctionEnded ? "#cccccc" : "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isAuctionEnded ? "default" : "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "transform 0.2s",
            transform: isUpdating ? "scale(1.05)" : "scale(1)"
          }}
          disabled={isAuctionEnded}
        >
          {isAuctionEnded ? "Auction Ended" : "Bid Now"}
        </button>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
