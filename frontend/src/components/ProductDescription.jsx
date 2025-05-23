const sizes = ['UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8', 'UK 8.5', 'UK 9', 'UK 9.5', 'UK 10', 'UK 10.5', 'UK 11'];import React, { useState, useEffect } from 'react';
import { Heart, Share2, Clock, Users, Shield, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const SneakerAuctionPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const shoeSize = 'UK 7.5';
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

  // Sample product data
  const product = {
    brand: 'New Balance',
    name: '9060 \'Black Cat\'',
    model: 'U9060BLK',
    colorway: 'Black/Grey',
    releaseDate: '2024',
    condition: 'New',
    baseBid: 15000,
    auctionStart: '2024-05-21 10:00:00',
    auctionEnd: '2024-05-25 18:00:00',
    seller: 'SneakerVault_Official',
    sellerRating: 4.9,
    authenticity: 'Verified Authentic'
  };

  const images = [
    '/api/placeholder/600/600', // Front view
    '/api/placeholder/600/600', // Side view
    '/api/placeholder/600/600', // Back view
    '/api/placeholder/600/600', // Top view
    '/api/placeholder/600/600'  // Sole view
  ];

  const sizes = ['UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8', 'UK 8.5', 'UK 9', 'UK 9.5', 'UK 10', 'UK 10.5', 'UK 11'];

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
      // Show success message or animation here
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <span>Home</span> / <span>Auctions</span> / <span>New Balance</span> / 
            <span className="text-gray-900 font-medium"> 9060 'Black Cat'</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">
              <img 
                src={images[currentImageIndex]} 
                alt={`${product.brand} ${product.name}`}
                className="w-full h-96 object-cover"
              />
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-black' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-600">{product.brand}</span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsWatchlisted(!isWatchlisted)}
                    className={`p-2 rounded-full border transition-all ${
                      isWatchlisted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 rounded-full border bg-white border-gray-200 text-gray-400 hover:text-gray-600">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Model: {product.model}</span>
                <span>•</span>
                <span>Colorway: {product.colorway}</span>
                <span>•</span>
                <span>Release: {product.releaseDate}</span>
              </div>
            </div>

            {/* Authenticity Badge */}
            <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">{product.authenticity}</span>
              <span className="text-green-600 ml-2">Condition: {product.condition}</span>
            </div>

            {/* Auction Timer */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-semibold">Auction Ending Soon</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white rounded-lg p-2">
                  <div className="text-2xl font-bold text-red-600">{timeLeft.days}</div>
                  <div className="text-xs text-gray-600">Days</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-2xl font-bold text-red-600">{timeLeft.hours}</div>
                  <div className="text-xs text-gray-600">Hours</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-2xl font-bold text-red-600">{timeLeft.minutes}</div>
                  <div className="text-xs text-gray-600">Minutes</div>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <div className="text-2xl font-bold text-red-600">{timeLeft.seconds}</div>
                  <div className="text-xs text-gray-600">Seconds</div>
                </div>
              </div>
            </div>

            {/* Current Bid */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-600">Current Bid</div>
                  <div className="text-3xl font-bold text-gray-900">{formatPrice(currentBid)}</div>
                  <div className="text-sm text-gray-600">Starting bid: {formatPrice(product.baseBid)}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Users className="w-4 h-4 mr-1" />
                    {totalBids} bids
                  </div>
                  <div className="text-sm text-gray-600">{watchers} watching</div>
                </div>
              </div>

              {/* Bid Form */}
              <div className="space-y-4">
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Your Bid Amount</div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="text"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum ${formatPrice(currentBid + 500)}`}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Minimum increment: ₹500
                  </div>
                </div>
                <button
                  onClick={handleBidSubmit}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Place Bid
                </button>
              </div>
            </div>

            {/* Size Display */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Size</h3>
                <button className="text-sm text-blue-600 hover:underline">Size Guide</button>
              </div>
              <div className="bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 text-center">
                <span className="text-xl font-bold text-gray-900">{shoeSize}</span>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <Info className="w-4 h-4 inline mr-1" />
                Fits True to Size - Recommended to go with your true size
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Seller Information</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{product.seller}</div>
                  <div className="text-sm text-gray-600">Rating: {product.sellerRating}/5.0</div>
                </div>
                <button className="text-blue-600 hover:underline text-sm">View Profile</button>
              </div>
            </div>

            {/* Auction Details */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Auction Details</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Auction Started:</span>
                  <span>May 21, 2024 at 10:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auction Ends:</span>
                  <span>May 25, 2024 at 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Starting Bid:</span>
                  <span>{formatPrice(product.baseBid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reserve Price:</span>
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

export default SneakerAuctionPage;