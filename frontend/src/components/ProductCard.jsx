import React from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  return (
    <motion.div
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
        <h3 style={{ 
          margin: "0 0 0.5rem 0", 
          fontSize: "0.9rem",
          fontWeight: "500",
          color: "#333"
        }}>
          {product.name}
        </h3>
        
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
