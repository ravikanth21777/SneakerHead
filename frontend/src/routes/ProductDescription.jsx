// src/routes/ProductDescription.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Clock,
  Users,
  Info
} from 'lucide-react';

// Socket.io instance will be created in useEffect

const ProductDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // 0️⃣ Grab logged‐in user ID from localStorage (string or null)
  const loggedInUserId = localStorage.getItem('userId');

  // 1️⃣ Loading / error / product state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [images, setImages] = useState([]);

  // 2️⃣ Carousel and bid states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shoeSize, setShoeSize] = useState('UK 7.5');
  const [bidAmount, setBidAmount] = useState('');
  const [currentBid, setCurrentBid] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [totalBids, setTotalBids] = useState(0);
  const [watchers, setWatchers] = useState(0);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // 3️⃣ Fetch product once on mount
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );
        const product = response.data;

        setProductData(product);
        setCurrentBid(product.currentBid || product.startBid || 0);
        setTotalBids(product.bids ? product.bids.length : 0);
        setWatchers(product.watchersCount || 0);

        // Check auction status when product data is loaded
        if (product.auctionEnded || new Date() >= new Date(product.AuctionEndDate)) {
          setIsAuctionEnded(true);
        }

        if (
          product.productPictureUrls &&
          product.productPictureUrls.length > 0
        ) {
          setImages(product.productPictureUrls);
        } else {
          setImages([
            'https://via.placeholder.com/600x600?text=No+Image'
          ]);
        }

        // (Debugging) Log out the IDs for confirmation
        console.log(
          '[ProductDescription] loggedInUserId =',
          loggedInUserId
        );
        console.log(
          '[ProductDescription] sellerId =',
          product.seller?._id
        );
      } catch (err) {
        console.error('Error fetching product:', err);
        if (err.response) {
          setError(`Server returned ${err.response.status}`);
        } else if (err.request) {
          setError('No response from server');
        } else {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, loggedInUserId]);

  // 4️⃣ Countdown “time left” effect
  useEffect(() => {
    if (!productData) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(productData.AuctionEndDate);
      const diffMs = end - now;
      if (diffMs <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    };

    // Immediately compute, then update every second
    setTimeLeft(calculateTimeLeft());
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timerId);
  }, [productData]);

  // Socket Effect for real-time updates
  useEffect(() => {
    if (!id) return;

    console.log('Initializing socket connection for product:', id);
    
    // Create socket instance
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Store socket in ref for access in other functions
    socketRef.current = socket;

    // Handle connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      socket.emit('joinRoom', id);
      console.log('Joined room:', id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      alert('Error connecting to real-time updates. Some features may be delayed.');
    });

    // Handle new bids
    const handleNewBid = async (data) => {
      console.log('Received new bid event:', data);
      if (data.productId === id) {
        console.log('Updating bid amount to:', data.currentBid);
        
        // Immediate bid amount update for responsiveness
        setCurrentBid(Number(data.currentBid));
        setTotalBids(prev => prev + 1);
        
        try {
          // Always fetch fresh data to ensure consistency
          const response = await axios.get(`http://localhost:5000/api/products/${id}`);
          const updatedProduct = response.data;
          
          if (updatedProduct) {
            setProductData(updatedProduct);
            // Update current bid if the fetched data has a higher bid
            if (updatedProduct.currentBid > Number(data.currentBid)) {
              setCurrentBid(updatedProduct.currentBid);
            }
            // Check if the auction end time was extended
            if (data.endDate) {
              const newEndDate = new Date(data.endDate);
              const currentEndDate = new Date(updatedProduct.AuctionEndDate);
              if (newEndDate > currentEndDate) {
                setProductData(prev => ({
                  ...prev,
                  AuctionEndDate: data.endDate
                }));
              }
            }
          }
        } catch (err) {
          console.error('Error fetching updated product:', err);
        }

        // Check auction status
        checkAuctionStatus();

        // Show notification for others' bids
        if (data.bidder !== loggedInUserId) {
          alert(`New bid placed: ${formatPrice(data.currentBid)}`);
        }
      }
    };

    socket.on('newBid', handleNewBid);

    // Cleanup
    return () => {
      console.log('Leaving room:', id);
      socket.off('newBid', handleNewBid);
      if (socket.connected) {
        socket.emit('leaveRoom', id);
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [id, loggedInUserId]);

  // Check auction status function
  const checkAuctionStatus = useCallback(() => {
    if (!productData) return;
    
    const now = new Date();
    const endDate = new Date(productData.AuctionEndDate);
    
    if (now >= endDate || productData.auctionEnded) {
      setIsAuctionEnded(true);
      // Show auction ended message if you're the winner
      if (productData.buyer && productData.buyer._id === loggedInUserId) {
        alert('Congratulations! You won this auction!');
      }
    }
  }, [productData, loggedInUserId]);

  // 5️⃣ Bid submission handler
  const handleBidSubmit = async () => {
    try {
      // Validate auction status first
      if (isAuctionEnded) {
        alert('This auction has ended');
        return;
      }

      // Parse and validate bid amount
      const bid = parseFloat(bidAmount.replace(/,/g, ''));
      const minBid = (currentBid || 0) + (productData.bidIncrement || 0);

      // Validation checks
      if (!bidAmount || bidAmount.trim() === '') {
        alert('Please enter a bid amount');
        return;
      }

      if (isNaN(bid)) {
        alert('Please enter a valid number');
        return;
      }

      if (bid < minBid) {
        alert(`Bid must be at least ${formatPrice(minBid)}`);
        return;
      }

      if (!productData) {
        alert('Product data is not available');
        return;
      }

      // Check if auction has ended
      const now = new Date();
      const endDate = new Date(productData.AuctionEndDate);
      if (now > endDate) {
        alert('This auction has ended');
        return;
      }

      console.log('Submitting bid:', bid);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/products/${id}/bid`,
        { amount: bid },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      console.log('Bid response:', response.data);
      if (response.data) {
        setBidAmount('');
        setProductData(response.data);
        
        // Ensure we use number type for current bid
        const updatedBid = Number(response.data.currentBid);
        if (!isNaN(updatedBid) && updatedBid > 0) {
          setCurrentBid(updatedBid);
          setTotalBids(prev => prev + 1);
        }
        
        // Check auction status and handle socket update
        checkAuctionStatus();

        // Emit bid event through socket if connected
        if (socketRef.current?.connected) {
          socketRef.current.emit('placeBid', {
            productId: id,
            amount: bid,
            userId: loggedInUserId,
            currentBid: response.data.currentBid
          });
        }
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error placing bid. Please try again.');
      }
    }
  };

  // 6️⃣ Image carousel controls
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // 7️⃣ Price formatter helper
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '₹0';
    return `₹${Number(price).toLocaleString('en-IN')}`;
  };

  // 8️⃣ Early returns for loading / error
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div>Loading product…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div>
          <h2>Error: {error}</h2>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.5rem 1rem',
              background: '#333',
              color: '#fff',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!productData || images.length === 0) {
    return null;
  }

  // 9️⃣ Check if the logged‐in user is the seller
  const sellerId = productData.seller?._id;
  // Compare as strings (both are strings when retrieved)
  const isSeller =
    typeof loggedInUserId === 'string' && sellerId === loggedInUserId;

  // 1️⃣0️⃣ Delete‐product handler
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Make sure you are the seller.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8' }}>
      <Navbar />

      {/* Main container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Product title */}
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#333',
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          {productData.name}
        </h1>

        {/* Auction Status Banner */}
        {isAuctionEnded && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ color: '#b91c1c', fontWeight: '600' }}>
              Auction Ended
            </span>
            {productData.buyer && productData.buyer._id === loggedInUserId ? (
              <span style={{ color: '#15803d', marginLeft: 'auto' }}>
                Congratulations! You won this auction!
              </span>
            ) : productData.buyer ? (
              <span style={{ color: '#666', marginLeft: 'auto' }}>
                Won by: {productData.buyer.username}
              </span>
            ) : null}
          </div>
        )}

        {/* Grid: image gallery on left, details on right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem'
          }}
        >
          {/* Left: Image Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
            >
              <img
                src={images[currentImageIndex]}
                alt={`${productData.brand} ${productData.name}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain'
                }}
              />
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  padding: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s'
                }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  padding: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s'
                }}
              >
                <ChevronRight size={24} />
              </button>
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '0.5rem'
                }}
              >
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      width: '2rem',
                      height: '0.25rem',
                      borderRadius: '0.125rem',
                      background: index === currentImageIndex ? '#333' : '#ccc',
                      transition: 'background 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* --- Header: Brand, Delete Button, Watchlist & Share --- */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}
              >
                {/* Brand Name */}
                <span
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#666'
                  }}
                >
                  {productData.brand}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {/* Delete Button (only if user is the seller) */}
                  {isSeller && (
                    <button
                      onClick={handleDelete}
                      style={{
                        background: '#ff4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  )}

                  {/* Watchlist Icon
                  <button
                    onClick={() => setIsWatchlisted((prev) => !prev)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '50%',
                      border: '1px solid #ccc',
                      background: isWatchlisted ? 'rgba(255, 0, 0, 0.1)' : '#fff',
                      color: isWatchlisted ? '#ff0000' : '#666',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Heart
                      size={20}
                      fill={isWatchlisted ? '#ff0000' : 'none'}
                      stroke={isWatchlisted ? '#ff0000' : '#666'}
                    />
                  </button> */}

                  {/* Share Icon
                  <button
                    style={{
                      padding: '0.5rem',
                      borderRadius: '50%',
                      border: '1px solid #ccc',
                      background: '#fff',
                      color: '#666',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Share2 size={20} />
                  </button> */}
                </div>
              </div>

              {/* Product Name & Details */}
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#333',
                  marginBottom: '0.5rem'
                }}
              >
                {productData.name}
              </h1>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.875rem',
                  color: '#666'
                }}
              >
                <span>Edition: {productData.edition || 'N/A'}</span>
                <span>•</span>
                <span>Size: {productData.size || 'N/A'}</span>
                <span>•</span>
                <span>Category: {productData.category}</span>
              </div>
            </div>

            {/* --- Auction Timer --- */}
            <div
              style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                <Clock size={20} color="#c53030" />
                <span style={{ fontWeight: '600', color: '#c53030', fontSize: '1rem' }}>
                  Auction Ending Soon
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '1rem',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c53030' }}>
                    {timeLeft.days}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Days</div>
                </div>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c53030' }}>
                    {timeLeft.hours}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Hours</div>
                </div>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c53030' }}>
                    {timeLeft.minutes}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Minutes</div>
                </div>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c53030' }}>
                    {timeLeft.seconds}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Seconds</div>
                </div>
              </div>
            </div>

            {/* --- Current Bid + Bid Form --- */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Current Bid</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#333' }}>
                    {formatPrice(currentBid)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    Starting bid: {formatPrice(productData.startBid)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      color: '#666',
                      marginBottom: '0.25rem'
                    }}
                  >
                    <Users size={16} style={{ marginRight: '0.25rem' }} />
                    {totalBids} bids
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{watchers} watching</div>
                </div>
              </div>

              {/* Bid Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
                    Your Bid Amount
                  </div>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }}
                    >
                      ₹
                    </span>
                    <input
                      type="text"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum ${formatPrice(currentBid + (productData.bidIncrement || 0))}`}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        paddingLeft: '2.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        color: '#333',
                        transition: 'border-color 0.3s',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                    Minimum increment: ₹{productData.bidIncrement || 0}
                  </div>
                </div>
                <button
                  onClick={handleBidSubmit}
                  disabled={isAuctionEnded}
                  style={{
                    background: isAuctionEnded ? '#ccc' : '#333',
                    color: '#fff',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: isAuctionEnded ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  {isAuctionEnded ? 'Auction Ended' : 'Place Bid'}
                </button>
                {!isAuctionEnded && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 5 && (
                  <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    ⚠️ Auction ending soon! Any bids in the last 30 seconds will extend the auction.
                  </div>
                )}
              </div>
            </div>

            {/* --- Size Display --- */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}
              >
                <h3 style={{ fontWeight: '600', color: '#333' }}>Size</h3>
                <button
                  style={{
                    fontSize: '0.875rem',
                    color: '#3182ce',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0
                  }}
                  onClick={() => setShowSizeGuide(true)}
                >
                  Size Guide
                </button>
                {showSizeGuide && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      height: '100vh',
                      width: '100vw',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1000
                    }}>
                      <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        overflow: 'auto',
                        position: 'relative'
                      }}>
                        <button onClick={() => setShowSizeGuide(false)} style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'none',
                          border: 'none',
                          fontSize: '1.2rem',
                          cursor: 'pointer'
                        }}>✕</button>
                        <img
                          src="/size-guide.png"
                          alt="Size Guide"
                          style={{ width: '100%', height: 'auto' }}
                        />

                      </div>
                    </div>
                  )}

              </div>
              <div
                style={{
                  background: '#f7fafc',
                  border: '1px solid #cbd5e0',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#333' }}>
                  {shoeSize}
                </span>
              </div>
              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Info size={20} color="#666" />
                <span style={{ fontSize: '0.875rem', color: '#666' }}>
                  Fits True to Size – Recommended to go with your true size
                </span>
              </div>
            </div>

           {/* --- Seller Information --- */}
<div
  style={{
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '0.5rem',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    maxWidth: 400,
  }}
>
  <h3 style={{ fontWeight: '700', marginBottom: '1.25rem', color: '#222' }}>
    Seller Information
  </h3>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1.5rem',
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: '600', color: '#222', marginBottom: '0.4rem' }}>
        Username:
        <span style={{ fontWeight: '400', marginLeft: '0.5rem' }}>
          {productData.seller?.username || 'Unknown Seller'}
        </span>
      </div>
      <div style={{ fontWeight: '600', color: '#222', marginBottom: '0.6rem' }}>
        Phone:
        <span style={{ fontWeight: '400', marginLeft: '0.5rem' }}>
          {productData.seller?.phone || 'No phone number available'}
        </span>
      </div>
      <div style={{ fontWeight: '600', color: '#222', marginBottom: '0.6rem' }}>
        Email:
        <span style={{ fontWeight: '400', marginLeft: '0.5rem' }}>
          {productData.seller?.email || 'No email available'}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.875rem',
          color: '#666',
          gap: '0.75rem',
        }}
      >
        <span>Seller Picture:</span>
        {productData.seller?.profilePictureUrl ? (
          <img
            src={productData.seller.profilePictureUrl}
            alt="Seller"
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: '1px solid #ddd',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span style={{ fontStyle: 'italic', color: '#aaa' }}>No image</span>
        )}
      </div>
    </div>
  </div>
</div>


            {/* --- Auction Details --- */}
            <div
              style={{
                background: '#f7fafc',
                border: '1px solid #cbd5e0',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Auction Details</h3>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Auction Started:</span>
                  <span>
                    {new Date(productData.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Auction Ends:</span>
                  <span>
                    {new Date(productData.AuctionEndDate).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Starting Bid:</span>
                  <span>{formatPrice(productData.startBid)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;