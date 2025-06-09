// src/routes/OrderSummary.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const OrderSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); 
  // loading / error / product
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/order-summary/${id}`,{
          
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProduct(data);
        if (data.productPictureUrls?.length) {
          setImages(data.productPictureUrls);
        } else {
          setImages([ 'https://via.placeholder.com/600x600?text=No+Image' ]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p>Loading order summary…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'red' }}>Error: {error}</p>
        <button onClick={() => navigate('/')} style={{ marginTop:'1rem' }}>Back Home</button>
      </div>
    );
  }
  if (!product) return null;

  const { name, brand, seller, buyer, currentBid } = product;

  const nextImage = () => {
    setCurrentImageIndex((i) => (i+1) % images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((i) => (i-1+images.length)%images.length);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f8f8f8' }}>
      <Navbar />

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'2rem 1rem' }}>
        {/* Title */}
        <h1 style={{ textAlign:'center', fontSize:'1.75rem', fontWeight:700, marginBottom:'2rem' }}>
          Order Summary
        </h1>

        <div style={{
          display:'grid',
          gridTemplateColumns: '1fr',
          gap:'2rem',
          '@media (min-width:768px)': { gridTemplateColumns: '1fr 1fr' }
        }}>
          {/* Images */}
          <div style={{ position:'relative', borderRadius:'0.5rem', overflow:'hidden', boxShadow:'0 4px 8px rgba(0,0,0,0.1)' }}>
            <img
              src={images[currentImageIndex]}
              alt={name}
              style={{ width:'100%', height:'auto', objectFit:'contain', maxHeight:'500px' }}
            />
            <button
              onClick={prevImage}
              style={{
                position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)',
                background:'rgba(255,255,255,0.8)', borderRadius:'50%', padding:'0.5rem',
                boxShadow:'0 2px 4px rgba(0,0,0,0.2)', cursor:'pointer'
              }}
            >
              <ChevronLeft size={24}/>
            </button> 
            <button
              onClick={nextImage}
              style={{
                position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)',
                background:'rgba(255,255,255,0.8)', borderRadius:'50%', padding:'0.5rem',
                boxShadow:'0 2px 4px rgba(0,0,0,0.2)', cursor:'pointer'
              }}
            >
              <ChevronRight size={24}/>
            </button>
          </div>

          {/* Details */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            {/* Product Info */}
            <div>
              <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:600 }}>{name}</h2>
              <p style={{ margin:'0.5rem 0', color:'#666' }}>Brand: {brand}</p>
              <p style={{ fontSize:'1.25rem', fontWeight:700 }}>Final Price: ₹{currentBid.toLocaleString('en-IN')}</p>
            </div>

            {/* Seller Info */}
            <div style={{ background:'#fff', padding:'1rem', borderRadius:'0.5rem', boxShadow:'0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin:'0 0 0.5rem 0', fontWeight:600 }}>Seller</h3>
              <p style={{ margin:0 }}>{seller?.username || 'Unknown'}</p>
              <p style={{ margin:0, color:'#666' }}>{seller?.email || ''}</p>
              <p style={{ margin:0, color:'#666' }}>{seller?.phone || ''}</p>
            </div>

            {/* Buyer Info */}
            <div style={{ background:'#fff', padding:'1rem', borderRadius:'0.5rem', boxShadow:'0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin:'0 0 0.5rem 0', fontWeight:600 }}>Buyer</h3>
              <p style={{ margin:0 }}>{buyer?.username || 'Unknown'}</p>
              <p style={{ margin:0, color:'#666' }}>{buyer?.email || ''}</p>
              <p style={{ margin:0, color:'#666' }}>{buyer?.phone || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
