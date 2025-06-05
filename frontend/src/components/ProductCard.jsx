import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

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

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [product.AuctionEndDate]);

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
          <p style={{ 
            margin: 0,
            fontSize: "0.9rem",
            color: "#666",
            fontWeight: "500"
          }}>
            Current Bid: ₹{product.currentBid || "0"}
          </p>
          <p style={{ 
            margin: 0,
            fontSize: "0.9rem",
            color: "#666",
            fontWeight: "500"
          }}>
            Base Price: ₹{product.basePrice || "0"}
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
