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
  const [sortBy, setSortBy] = useState(''); // Placeholder for future sorting

  // 3️⃣ Ref to hold the socket instance
  const socketRef = useRef(null);
  const sortProducts = (products, sortBy) => {
  if (!sortBy) return products;

  const sorted = [...products];

  switch (sortBy) {
    case 'priceLowHigh':
      return sorted.sort((a, b) => (a.currentBid || a.startBid || 0) - (b.currentBid || b.startBid || 0));

    case 'priceHighLow':
      return sorted.sort((a, b) => (b.currentBid || b.startBid || 0) - (a.currentBid || a.startBid || 0));

    case 'newestFirst':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    default:
      return products;
  }
};


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

  // Socket effect for real-time updates
  useEffect(() => {
    if (products.length === 0) {
      console.log('⏳ Waiting for products to load before initializing sockets...');
      return;
    }

    console.log('🔌 Initializing socket connection...');

    // Create socket instance with reconnection settings
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      debug: true
    });

    // Store socket in ref
    socketRef.current = socket;

    // Debug all incoming socket events
    socket.onAny((event, ...args) => {
      console.log('📨 Socket event received:', event, 'with data:', args);
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully', socket.id);
      
      // Join global updates room
      console.log('🌐 Joining global updates room...');
      socket.emit('joinGlobalRoom');
      
      console.log('🔄 Current socket state:', {
        id: socket.id,
        connected: socket.connected,
        disconnected: socket.disconnected
      });
    });

    // Confirm global room join
    socket.on('globalRoomJoined', (data) => {
      console.log('✅ Global room join confirmed:', data);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      console.log('Current socket state:', {
        id: socket.id,
        connected: socket.connected,
        disconnected: socket.disconnected
      });
    });

    // Handle global bid updates with enhanced logging
    const handleGlobalBidUpdate = async (data) => {
      console.log('🌐 Received global bid update:', data);
      
      if (!data || !data.productId) {
        console.error('❌ Invalid global bid data received:', data);
        return;
      }

      // Get the bid amount from the correct property
      const newBidAmount = Number(data.currentBid || data.amount);
      
      if (isNaN(newBidAmount)) {
        console.error('❌ Invalid bid amount:', data);
        return;
      }

      console.log('💰 Processing bid update:', {
        productId: data.productId,
        newBidAmount: newBidAmount
      });

      // Update product in state
      setProducts(prevProducts => {
        console.log('🔄 Updating products state with new bid');
        return prevProducts.map(product => {
          if (product._id === data.productId) {
            console.log(`✨ Updating product ${product._id}:`, {
              oldBid: product.currentBid,
              newBid: newBidAmount
            });
            
            // Only update if the new bid is higher
            if (newBidAmount > (product.currentBid || 0)) {
              return {
                ...product,
                currentBid: newBidAmount,
                buyer: data.bidder || data.userId,
                ...(data.endDate && { AuctionEndDate: data.endDate }),
                isUpdating: true
              };
            }
            console.log('ℹ️ Ignoring lower bid amount');
            return product;
          }
          return product;
        });
      });

      // Reset animation after delay
      setTimeout(() => {
        console.log('🔄 Resetting animation state for product:', data.productId);
        setProducts(prevProducts => {
          return prevProducts.map(product => {
            if (product._id === data.productId) {
              return { ...product, isUpdating: false };
            }
            return product;
          });
        });
      }, 500);
    };

    // Listen for both global and specific updates
    console.log('👂 Setting up event listeners...');
    
    socket.on('globalBidUpdate', handleGlobalBidUpdate);
    socket.on('newBid', (data) => console.log('📢 Received newBid event:', data));
    socket.on('bidPlaced', (data) => console.log('📢 Received bidPlaced event:', data));
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection...');
      if (socket) {
        console.log('Removing event listeners and disconnecting socket:', socket.id);
        socket.off('globalBidUpdate', handleGlobalBidUpdate);
        socket.off('newBid');
        socket.off('bidPlaced');
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [products.length]); // Only re-run if products array length changes

  // 6️⃣ Filter by selectedBrands (empty array = show all)
  const filteredProducts = products.filter((prod) => {
  return selectedBrands.length === 0 || selectedBrands.includes(prod.brand);
});

const sortedFilteredProducts = sortProducts(filteredProducts, sortBy);


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
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none'
          }}
        >
          <option>Sort By</option>
          <option value = "priceLowHigh">Price: Low to High</option>
          <option value = "priceHighLow">Price: High to Low</option>
          <option value = "priceNewestFirst">Newest First</option>
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
              {sortedFilteredProducts.map((sneaker) => (
                <ProductCard
                  key={sneaker._id}
                  product={{
                    id: sneaker._id,
                    _id: sneaker._id, // Add this to ensure ID matching works
                    name: sneaker.name,
                    brand: sneaker.brand,
                    currentBid: sneaker.currentBid || sneaker.startBid || 0,
                    startBid: sneaker.startBid || 0,
                    AuctionEndDate: sneaker.AuctionEndDate,
                    auctionEnded: sneaker.auctionEnded,
                    isUpdating: sneaker.isUpdating,
                    productPictureUrls: sneaker.productPictureUrls || [],
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