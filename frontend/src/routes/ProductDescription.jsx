// src/routes/ProductDescription.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ChevronLeft, ChevronRight, Heart, Share2, Clock, Users, Info } from 'lucide-react';

const ProductDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1️⃣ Loading / error / product state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [images, setImages] = useState([]);

  // 2️⃣ Carousel and bid states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shoeSize, setShoeSize] = useState('UK 7.5');       // you can make this dynamic later
  const [bidAmount, setBidAmount] = useState('');
  const [currentBid, setCurrentBid] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [totalBids, setTotalBids] = useState(0);
  const [watchers, setWatchers] = useState(0);

  // 3️⃣ Fetch product once on mount
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        const product = response.data;

        // Save the main product object
        setProductData(product);

        // Initialize bids / watchers / currentBid from product
        setCurrentBid(product.currentBid || product.startBid || 0);
        setTotalBids(product.bids ? product.bids.length : 0); // if you keep a bids array in schema
        setWatchers( product.watchersCount || 0 ); // adjust if you track watchers

        // Build an array of image URLs; if none exist, fallback to a placeholder
        if (product.productPictureUrls && product.productPictureUrls.length > 0) {
          setImages(product.productPictureUrls);
        } else {
          setImages(['https://via.placeholder.com/600x600?text=No+Image']);
          }

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
  }, [id]);

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
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Immediately compute once, then every second
    setTimeLeft(calculateTimeLeft());
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timerId);
  }, [productData]);

  // 5️⃣ Bid submission handler
  const handleBidSubmit = () => {
    const bid = parseFloat(bidAmount.replace(/,/g, ''));
    if (bid > currentBid) {
      setCurrentBid(bid);
      setTotalBids((prev) => prev + 1);
      setBidAmount('');
      // TODO: You would also POST this bid to your backend here
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
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // 8️⃣ Early returns for loading / error
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading product…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    return null; // or a “No Data” message
  }

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

        {/* Grid: image gallery on left, details on right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            // Example media query fallback; if you use a CSS file, move this there
            // ['@media (min-width: 768px)']: { gridTemplateColumns: '1fr 1fr' }
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
            {/* --- Header: Brand, Name, Model Info --- */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#666' }}>
                  {productData.brand}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    <Heart size={20} fill={isWatchlisted ? '#ff0000' : 'none'} stroke={isWatchlisted ? '#ff0000' : '#666'} />
                  </button>
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
                  </button>
                </div>
              </div>
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
              {/* Add extra details if your schema has them (e.g., edition, size, category) */}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
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
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>
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
                  style={{
                    background: '#333',
                    color: '#fff',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  Place Bid
                </button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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
                >
                  Size Guide
                </button>
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
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                padding: '1rem'
              }}  
            >
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Seller Information</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#333' }}>
                    {productData.seller?.username || 'Unknown Seller'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    Rating: {productData.seller?.rating || 'N/A'}
                  </div>
                </div>
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
                >
                  View Profile
                </button>
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
                  <span>Buy Now Price:</span>
                  <span>
                    {productData.buyNowPrice ? formatPrice(productData.buyNowPrice) : 'N/A'}
                  </span>
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
