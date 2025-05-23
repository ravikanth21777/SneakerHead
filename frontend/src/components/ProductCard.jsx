import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Prevent navigation if clicking the Add to Cart button
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
          src={product.image} 
          alt={product.name}
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
            {product.brand}
          </span>
          <h3 style={{ 
            margin: "0",
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#333"
          }}>
            {product.name}
          </h3>
        </div>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <p style={{ 
            margin: 0,
            fontSize: "1rem",
            color: "#666",
            fontWeight: "600"
          }}>
            from ₹{product.price}
          </p>
          
          <motion.button
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
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
