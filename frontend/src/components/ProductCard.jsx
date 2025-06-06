import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  const [currentBid, setCurrentBid] = useState(product.currentBid || product.startBid || 0);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when product prop changes
  useEffect(() => {
    setCurrentBid(product.currentBid || product.startBid || 0);
    setIsAuctionEnded(product.auctionEnded || new Date() > new Date(product.AuctionEndDate));
  }, [product.currentBid, product.startBid, product.auctionEnded, product.AuctionEndDate]);

  useEffect(() => {
    if (!product.AuctionEndDate) return;

    const calculateTimeLeft = () => {
      const end = new Date(product.AuctionEndDate);
      const now = new Date();
      const diff = end - now;
      
      if (diff <= 0) return "Auction Ended";
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
      if (minutes > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    };

    const updateTimeAndStatus = () => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Check if auction has ended
      if (newTimeLeft === "Auction Ended") {
        setIsAuctionEnded(true);
      }
    };

    updateTimeAndStatus();
    const timer = setInterval(() => {
      updateTimeAndStatus();
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [product.AuctionEndDate]);

  // Animation variants for price updates
  const priceAnimation = {
    highlight: {
      backgroundColor: 'rgba(255, 220, 220, 0.5)',
      transition: { duration: 0.3 }
    },
    normal: {
      backgroundColor: 'transparent',
      transition: { duration: 0.3 }
    }
  };

  // Handle bid updates with animation
  useEffect(() => {
    if (product.currentBid !== currentBid) {
      setIsUpdating(true);
      setCurrentBid(product.currentBid || product.startBid || 0);
      
      // Reset updating state after animation
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [product.currentBid, product.startBid, currentBid]);

  const handleCardClick = (e) => {
    // Prevent navigation if clicking the Bid button
    if (!e.target.closest('button')) {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <motion.div
      onClick={handleCardClick}
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      style={{ 
        cursor: "pointer",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflow: "hidden"
      }}
    >
      <div style={{ 
        position: "relative",
        paddingBottom: "100%",
        background: "#f8f8f8",
        overflow: "hidden"
      }}>
        <motion.img 
          src={product.image || "https://via.placeholder.com/150"} 
          alt={product.name || "Product Image"}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div style={{ padding: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
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
            {product.brand || "Brand Name"}
          </span>
          <h3 style={{ 
            margin: "0",
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#333"
          }}>
            {product.name || "Model Name"}
          </h3>
        </div>
        
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "0.5rem"
        }}>
          <motion.p
            animate={isUpdating ? "highlight" : "normal"}
            variants={priceAnimation}
            style={{ 
              margin: 0,
              padding: "0.25rem",
              borderRadius: "0.25rem",
              fontSize: "0.9rem",
              color: "#666",
              fontWeight: "600"
            }}
          >
            Current Bid: <span style={{ color: isUpdating ? "#ff4444" : "#333" }}>
              ₹{currentBid.toLocaleString('en-IN')}
            </span>
          </motion.p>
          <p style={{ 
            margin: 0,
            fontSize: "0.9rem",
            color: "#666",
            fontWeight: "500"
          }}>
            Starting Price: ₹{product.startBid?.toLocaleString('en-IN') || "0"}
          </p>
          <p style={{ 
            margin: 0,
            fontSize: "0.9rem",
            color: "#ff4444",
            fontWeight: "600"
          }}>
            Time Left: {timeLeft || "N/A"}
          </p>
          {product.AuctionEndDate && (
            <p style={{ 
              margin: 0,
              fontSize: "0.8rem",
              color: "#666",
              fontStyle: "italic"
            }}>
              Ends: {new Date(product.AuctionEndDate).toLocaleString()}
            </p>
          )}
        </div>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end",
          alignItems: "center"
        }}>
          <motion.button
            onClick={() => navigate(`/product/${product.id}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500"
            }}
          >
            Bid
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
