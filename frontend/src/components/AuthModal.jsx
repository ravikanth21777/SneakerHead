import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sneakerBg from '../assets/sneaker-auth-bg.svg';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual auth logic
    console.log(isLogin ? 'Login' : 'Signup', { email, password, name });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '2rem'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '900px',
              position: 'relative',
              display: 'flex',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Image Section */}
            <div 
              style={{ 
                flex: '1',
                background: '#f8f8f8',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <img 
                src={sneakerBg} 
                alt="Stylish Sneaker"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '400px'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '2rem',
                  left: '2rem',
                  right: '2rem',
                  textAlign: 'center'
                }}
              >
                <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>
                  Step into Style
                </h3>
                <p style={{ color: '#666', margin: 0 }}>
                  Join our community of sneaker enthusiasts
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div 
              style={{ 
                flex: '1',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img 
                  src="/logo192.png" 
                  alt="SneakerHead Logo" 
                  style={{ 
                    width: '80px', 
                    height: 'auto',
                    marginBottom: '1rem'
                  }} 
                />
                <h2 style={{ margin: 0, color: '#333' }}>
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {!isLogin && (
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                      required
                    />
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>

                <p style={{ textAlign: 'center', margin: '1rem 0', color: '#666' }}>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#000',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      marginLeft: '0.5rem',
                      padding: 0,
                      fontSize: '1rem'
                    }}
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;