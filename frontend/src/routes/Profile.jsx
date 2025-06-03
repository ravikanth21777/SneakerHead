import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // NEW
  const [error, setError] = useState(null); // NEW
 const [profileData, setProfileData] = useState({
  username: '',
  email: '',
  profilePictureUrl: ''
});

  const [formData, setFormData] = useState(profileData);
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token'); // get the JWT token from localStorage

  if (!token) {
    setError('User not logged in');
    setLoading(false);
    return;
  }

  try {
    const res = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Profile data:', res.data); // Log the response data
    setProfileData(res.data);
    setFormData(res.data);
  } catch (err) {
    console.error(err);
    setError('Failed to load profile');
  } finally {
    setLoading(false);
  }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { username, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [username]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfileData(formData);
    setIsEditing(false);
    // TODO: Implement API call to update profile
  };

  const dummyOrders = [
    {
      id: '1',
      date: '2025-05-20',
      status: 'Delivered',
      items: [
        {
          username: 'Lionel Messi X Samba Indoor "Spark Gen10s"',
          price: 13099,
          image: 'https://assets.adidas.com/images/h_840,f_auto,q_auto:sensitive,fl_lossy,c_fill,g_auto/a4b35a2d1c5c46449c51af8b0083847f_9366/Samba_OG_Shoes_White_ID2046_01_standard.jpg'
        }
      ]
    },
    {
      id: '2',
      date: '2025-05-15',
      status: 'In Transit',
      items: [
        {
          username: 'Nike Air Max 90',
          price: 9995,
          image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/fb7eda3c-5ac8-4d05-a18f-1c2c5e82e36e/air-max-90-shoes-N8M7Rb.png'
        }
      ]
    }
  ];

  const tabStyle = (isActive) => ({
    padding: '1rem 2rem',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid #000' : '2px solid transparent',
    color: isActive ? '#000' : '#666',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.3s ease'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ minHeight: '100vh', background: '#ffffff' }}
    >
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Profile Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            background: '#f8f8f8',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '60px',
              background: '#ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: '#fff'
            }}
          >
            👤
          </div>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>{profileData.username}</h1>
            <p style={{ margin: '0', color: '#666' }}>{profileData.email}</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #eee', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div
              onClick={() => setActiveTab('orders')}
              style={tabStyle(activeTab === 'orders')}
            >
              Orders
            </div>
            <div
              onClick={() => setActiveTab('settings')}
              style={tabStyle(activeTab === 'settings')}
            >
              Settings
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h2 style={{ marginBottom: '1.5rem' }}>Order History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dummyOrders.map(order => (
                <motion.div
                  key={order.id}
                  whileHover={{ y: -4 }}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    background: '#fff'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '1rem',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ margin: '0', fontWeight: '600' }}>Order #{order.id}</p>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      background: order.status === 'Delivered' ? '#e8f5e9' : '#fff3e0',
                      color: order.status === 'Delivered' ? '#2e7d32' : '#ef6c00',
                      fontSize: '0.9rem'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem 0',
                        borderTop: '1px solid #eee'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.username}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <div>
                        <p style={{ margin: '0', fontWeight: '500' }}>{item.username}</p>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                          ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Profile Settings</h2>
              {!isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Edit Profile
                </motion.button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ 
                display: 'grid', 
                gap: '1.5rem',
                maxWidth: '600px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    color: '#666'
                  }}>
                    Full username
                  </label>
                  <input
                    type="text"
                    username="username"
                    value={isEditing ? formData.username : profileData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: isEditing ? '#fff' : '#f8f8f8'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    color: '#666'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    username="email"
                    value={isEditing ? formData.email : profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: isEditing ? '#fff' : '#f8f8f8'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    color: '#666'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    username="phone"
                    value={isEditing ? formData.phone : profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: isEditing ? '#fff' : '#f8f8f8'
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    color: '#666'
                  }}>
                    Address
                  </label>
                  <textarea
                    username="address"
                    value={isEditing ? formData.address : profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      minHeight: '100px',
                      resize: 'vertical',
                      background: isEditing ? '#fff' : '#f8f8f8'
                    }}
                  />
                </div>

                {isEditing && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      style={{
                        padding: '0.8rem 2rem',
                        background: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        flex: 1
                      }}
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setFormData(profileData);
                        setIsEditing(false);
                      }}
                      style={{
                        padding: '0.8rem 2rem',
                        background: '#fff',
                        color: '#000',
                        border: '1px solid #000',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        flex: 1
                      }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
