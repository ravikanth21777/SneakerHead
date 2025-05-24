import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { ChevronLeft, ChevronRight, Heart, Share2, Clock, Users, Info } from 'lucide-react';

const DUMMY_SNEAKERS = [
  {
    id: "adidas_samba_1",
    name: "Lionel Messi X Samba 'Inter Miami CF - Away Kit'",
    price: 10799,
    brand: "Adidas",
    model: "Samba OG",
    colorway: "Core Black/Cloud White",
    releaseDate: "2024",
    condition: "New",
    baseBid: 10799,
    image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/fb7eda3c-5ac8-4d05-a18f-1c2c5e82e36e/air-max-90-shoes-N8M7Rb.png",
    auctionStart: '2024-05-21 10:00:00',
    auctionEnd: '2024-05-25 18:00:00',
    seller: 'SneakerVault_Official',
    sellerRating: 4.9,
    authenticity: 'Verified Authentic'
  }
];

const ProductDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Product loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [images, setImages] = useState([]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shoeSize, setShoeSize] = useState('UK 7.5');
  const [bidAmount, setBidAmount] = useState('');
  const [currentBid, setCurrentBid] = useState(20099);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 23,
    seconds: 45
  });
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [totalBids, setTotalBids] = useState(47);
  const [watchers, setWatchers] = useState(128);

  // Effect to fetch product data
  useEffect(() => {
    const fetchProduct = () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        const foundProduct = DUMMY_SNEAKERS.find(p => p.id === id);
        if (!foundProduct) {
          throw new Error('Product not found');
        }

        setProductData(foundProduct);
        setCurrentBid(foundProduct.baseBid);
        // Set product images (using the same image for all views for now)
        const productImages = Array(5).fill(foundProduct.image);
        setImages(productImages);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBidSubmit = () => {
    const bid = parseFloat(bidAmount.replace(/,/g, ''));
    if (bid > currentBid) {
      setCurrentBid(bid);
      setTotalBids(prev => prev + 1);
      setBidAmount('');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
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
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: '2rem' }}>{productData.name}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', '@media (min-width: 768px)': { gridTemplateColumns: '1fr 1fr' } }}>
          {/* Image Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
              <img 
                src={images[currentImageIndex]} 
                alt={`${productData.brand} ${productData.name}`}
                style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
              />
              <button 
                onClick={prevImage}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%', padding: '0.5rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextImage}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%', padding: '0.5rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', transition: 'all 0.3s' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{ width: '2rem', height: '0.25rem', borderRadius: '0.125rem', background: index === currentImageIndex ? '#333' : '#ccc', transition: 'background 0.3s' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#666' }}>{productData.brand}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setIsWatchlisted(!isWatchlisted)}
                    style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid #ccc', background: isWatchlisted ? 'rgba(255, 0, 0, 0.1)' : '#fff', color: isWatchlisted ? '#ff0000' : '#666', transition: 'all 0.3s' }}
                  >
                    <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid #ccc', background: '#fff', color: '#666', transition: 'all 0.3s' }}>
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#333', marginBottom: '0.5rem' }}>{productData.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
                <span>Model: {productData.model}</span>
                <span>•</span>
                <span>Colorway: {productData.colorway}</span>
                <span>•</span>
                <span>Release: {productData.releaseDate}</span>
              </div>
            </div>

            {/* Auction Timer */}
            <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)', borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Clock className="w-5 h-5 text-red-600" />
                <span style={{ fontWeight: '600', color: '#c53030', fontSize: '1rem' }}>Auction Ending Soon</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c53030' }}>{timeLeft.days}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Days</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c53030' }}>{timeLeft.hours}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Hours</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c53030' }}>{timeLeft.minutes}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Minutes</div>
                </div>
                <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c53030' }}>{timeLeft.seconds}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Seconds</div>
                </div>
              </div>
            </div>

            {/* Current Bid */}
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Current Bid</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#333' }}>{formatPrice(currentBid)}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Starting bid: {formatPrice(productData.baseBid)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                    <Users className="w-4 h-4 mr-1" />
                    {totalBids} bids
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{watchers} watching</div>
                </div>
              </div>

              {/* Bid Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Your Bid Amount</div>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>₹</span>
                    <input
                      type="text"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum ${formatPrice(currentBid + 500)}`}
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
                    Minimum increment: ₹500
                  </div>
                </div>
                <button
                  onClick={handleBidSubmit}
                  style={{ background: '#333', color: '#fff', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.3s' }}
                >
                  Place Bid
                </button>
              </div>
            </div>

            {/* Size Display */}
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '600', color: '#333' }}>Size</h3>
                <button style={{ fontSize: '0.875rem', color: '#3182ce', cursor: 'pointer', background: 'none', border: 'none', padding: 0, margin: 0 }}>Size Guide</button>
              </div>
              <div style={{ background: '#f7fafc', border: '1px solid #cbd5e0', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#333' }}>{shoeSize}</span>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info className="w-5 h-5 text-gray-500" />
                <span style={{ fontSize: '0.875rem', color: '#666' }}>Fits True to Size - Recommended to go with your true size</span>
              </div>
            </div>

            {/* Seller Information */}
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Seller Information</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#333' }}>{productData.seller}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>Rating: {productData.sellerRating}/5.0</div>
                </div>
                <button style={{ fontSize: '0.875rem', color: '#3182ce', cursor: 'pointer', background: 'none', border: 'none', padding: 0, margin: 0 }}>View Profile</button>
              </div>
            </div>

            {/* Auction Details */}
            <div style={{ background: '#f7fafc', border: '1px solid #cbd5e0', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Auction Details</h3>
              <div style={{ fontSize: '0.875rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Auction Started:</span>
                  <span>May 21, 2024 at 10:00 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Auction Ends:</span>
                  <span>May 25, 2024 at 6:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Starting Bid:</span>
                  <span>{formatPrice(productData.baseBid)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Reserve Price:</span>
                  <span>Not Met</span>
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