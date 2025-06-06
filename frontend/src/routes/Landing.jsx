// src/routes/Landing.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

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
  // 1️⃣ Track which brands are selected
  const [selectedBrands, setSelectedBrands] = useState([]);

  // 2️⃣ State for products, loading, and error
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3️⃣ Ref to hold the socket instance
  const socketRef = useRef(null);

  // 4️⃣ Fetch live products from backend on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('http://localhost:5000/api/products');
        console.log('Fetched products:', response.data);
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          setError(`Server returned ${err.response.status}`);
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('No response from server');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 5️⃣ Once products are loaded, open a single global socket and listen for newBid
  useEffect(() => {
    // Only initialize socket after the first successful fetch
    if (products.length === 0) return;

    // Create socket (global)
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    // Listen for global newBid events
    socket.on('newBid', (payload) => {
      // payload = { productId, currentBid, bidder }
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          if (prod._id.toString() === payload.productId) {
            return { ...prod, currentBid: payload.currentBid };
          }
          return prod;
        })
      );
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [products]);

  // Socket effect for real-time updates
  useEffect(() => {
    // Create socket instance
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Store socket in ref
    socketRef.current = socket;

    // Handle connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });    // Handle new bid events
  const handleNewBid = async (data) => {
    console.log('Received new bid event:', data);
    
    // Immediate partial update for responsiveness
    setProducts(currentProducts => {
      return currentProducts.map(product => {
        if (product._id === data.productId) {
          return {
            ...product,
            currentBid: Number(data.currentBid),
            buyer: data.bidder,
            ...(data.endDate && { AuctionEndDate: data.endDate })
          };
        }
        return product;
      });
    });
    
    // Fetch fresh data for the updated product
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${data.productId}`);
      if (response.data) {
        setProducts(currentProducts => {
          return currentProducts.map(product => {
            if (product._id === data.productId) {
              return response.data;
            }
            return product;
          });
        });
      }
    } catch (err) {
      console.error('Error fetching updated product:', err);
    }
    };

    // Handle auction ended events
    const handleAuctionEnded = (data) => {
      console.log('Auction ended event:', data);
      setProducts(currentProducts => {
        return currentProducts.map(product => {
          if (product._id === data.productId) {
            return {
              ...product,
              auctionEnded: true,
              currentBid: Number(data.finalBid),
              buyer: data.winner
            };
          }
          return product;
        });
      });
    };

    socket.on('newBid', handleNewBid);
    socket.on('auctionEnded', handleAuctionEnded);

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('newBid', handleNewBid);
        socket.off('auctionEnded', handleAuctionEnded);
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, []); // Empty dependency array as we want this to run only once

  // 6️⃣ Filter by selectedBrands (empty array = show all)
  const filteredProducts = products.filter((prod) => {
    return selectedBrands.length === 0 || selectedBrands.includes(prod.brand);
  });

  // 7️⃣ Called by Navbar when brand checkboxes change
  const handleBrandSelection = (brands) => {
    setSelectedBrands(brands);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ minHeight: '100vh', background: '#ffffff' }}
    >
      {/* Navbar */}
      <Navbar onBrandSelect={handleBrandSelection} />

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ padding: '1rem 2rem', borderBottom: '1px solid #eee' }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            fontSize: '0.9rem'
          }}
        >
          <span>Home</span>
          <span>/</span>
          <span>Collection</span>
          <span>/</span>
          <span>All Sneakers</span>
        </div>
      </motion.div>

      {/* Header: Title, Count, Sort */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
            {selectedBrands.length > 0
              ? `${selectedBrands.join(' & ')} Sneakers`
              : 'All Sneakers'}
          </h2>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>
            {loading ? 'Loading…' : `(${filteredProducts.length}products)`}
          </span>
        </div>

        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Buy All Sneakers</h2>

        <select
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none'
          }}
        >
          <option>Sort By</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Newest First</option>
        </select>
      </motion.div>

      {/* Loading / Error */}
      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading products…</p>
        </div>
      )}
      {error && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'red'
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {/* Product Grid (only if not loading & no error) */}
      {!loading && !error && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ padding: '2rem' }}
        >
          <motion.div style={{ width: '100%' }}>
            <motion.div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem'
              }}
            >
              {filteredProducts.map((sneaker) => (
                <ProductCard
                  key={sneaker._id}
                  product={{
                    id: sneaker._id,
                    name: sneaker.name,
                    brand: sneaker.brand,
                    currentBid: sneaker.currentBid || sneaker.startBid || 0,
                    basePrice: sneaker.startBid || 0,
                    AuctionEndDate: sneaker.AuctionEndDate,
                    image:
                      sneaker.productPictureUrls && sneaker.productPictureUrls.length > 0
                        ? sneaker.productPictureUrls[0]
                        : 'https://via.placeholder.com/300x300?text=No+Image'
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Landing;