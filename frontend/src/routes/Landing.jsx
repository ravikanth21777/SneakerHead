// src/routes/Landing.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

const dummySneakers = [
  {
    id: 1,
    name: "Lionel Messi X Samba 'Inter Miami CF - Away Kit'",
    price: 10799,
    brand: "Adidas",
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto:sensitive,fl_lossy,c_fill,g_auto/c06b24af87e744aa9e2daf8b00836bb7_9366/Samba_OG_Shoes_Black_ID2045_01_standard.jpg"
  },
  {
    id: 2,
    name: "Lionel Messi X Samba Indoor 'Spark Gen10s'",
    price: 13099,
    brand: "Adidas",
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto:sensitive,fl_lossy,c_fill,g_auto/a4b35a2d1c5c46449c51af8b0083847f_9366/Samba_OG_Shoes_White_ID2046_01_standard.jpg"
  },
  {
    id: 3,
    name: "Lionel Messi X Samba 'Inter Miami CF - Home Kit'",
    price: 13999,
    brand: "Adidas",
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto:sensitive,fl_lossy,c_fill,g_auto/ce0b1685b7de4aa3981daf8b00837f1e_9366/Samba_OG_Shoes_Pink_ID2047_01_standard.jpg"
  },
  {
    id: 4,
    name: "Lionel Messi X Samba 'Triunfo Dorado'",
    price: 11099,
    brand: "Adidas",
    image: "https://assets.adidas.com/images/h_840,f_auto,q_auto:sensitive,fl_lossy,c_fill,g_auto/d0b6d063fa1c4a73a615af8b0083a51b_9366/Samba_OG_Shoes_Black_ID2048_01_standard.jpg"
  }
];

const fadeInUp = {
  initial: { y: 60, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Landing = () => {
  const [selectedBrand, setSelectedBrand] = useState("all");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ minHeight: "100vh", background: "#ffffff" }}
    >
      <Navbar />

      {/* Breadcrumb with fade */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ padding: "1rem 2rem", borderBottom: "1px solid #eee" }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.9rem" }}>
          <span>Home</span>
          <span>/</span>
          <span>Collection</span>
          <span>/</span>
          <span>All Sneakers</span>
        </div>
      </motion.div>

      {/* Header with slide */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ 
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Buy All Sneakers</h2>
        <select style={{ 
          padding: "0.5rem", 
          border: "1px solid #ddd",
          borderRadius: "4px",
          outline: "none"
        }}>
          <option>Sort By</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest First</option>
        </select>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{ padding: "2rem" }}
      >
        {/* Products Grid with stagger effect */}
        <motion.div 
          variants={staggerContainer}
          style={{ width: "100%" }}
        >
          <motion.div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: "2rem"
            }}
          >
            {dummySneakers.map((sneaker, index) => (
              <ProductCard 
                key={sneaker.id} 
                product={sneaker} 
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;
