import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';

const brands = [
  { name: "Adidas", count: 4 },
  { name: "Nike", count: 1 },
  { name: "ASICS", count: 1 },
  { name: "Puma", count: 1 }
];

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Navbar = ({ onBrandSelect }) => {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update parent component when selected brands change
  useEffect(() => {
    onBrandSelect(selectedBrands);
  }, [selectedBrands, onBrandSelect]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBrandToggle = (brandName) => {
    setSelectedBrands(prev => 
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
    // Close the dropdown when a brand is selected
    setIsSearchFocused(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ 
          padding: "1rem 1.2rem", 
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          gap: '1rem'
        }}
      >
        <motion.h1 
          whileHover={{ scale: 1.05 }}
          style={{ margin: 0, fontWeight: "bold", fontSize: "1.5rem", flex: '0 0 auto' }}
        >
          SneakerHead
        </motion.h1>

        {/* Gallery Icon */}
        <motion.span
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#f8f8f8',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#333',
            flex: '0 0 auto'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🖼️</span>
          Gallery
        </motion.span>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', flex: '1 1 auto' }} ref={searchRef}>
          <motion.div 
            style={{
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${isSearchFocused ? '#ff4444' : '#eee'}`,
              borderRadius: '12px',
              padding: '0.8rem 1.5rem',
              background: '#fff',
              width: '100%',
              boxShadow: isSearchFocused ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '1.1rem',
                fontWeight: '400'
              }}
            />
            {selectedBrands.length > 0 && (
              <span style={{ 
                color: '#ff4444', 
                marginLeft: '12px',
                fontSize: '1rem',
                fontWeight: '500' 
              }}>
                {selectedBrands.length} selected
              </span>
            )}
          </motion.div>

          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  marginTop: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1001
                }}
              >
                <div style={{ padding: '1rem' }}>
                  {brands
                    .filter(brand => 
                      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(brand => (
                      <motion.label
                        key={brand.name}
                        whileHover={{ backgroundColor: '#f8f8f8' }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.name)}
                          onChange={() => handleBrandToggle(brand.name)}
                          style={{ marginRight: '8px' }}
                        />
                        <span>{brand.name}</span>
                        <span style={{ marginLeft: 'auto', color: '#999' }}>
                          ({brand.count})
                        </span>
                      </motion.label>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Icons */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: "flex", gap: "1.5rem", alignItems: "center", flex: '0 0 auto' }}
        >
          <motion.span
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            style={{ cursor: 'pointer' }}
            onClick={() => setIsAuthModalOpen(true)}
          >
            👤
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            🛒
          </motion.span>
        </motion.div>
      </motion.nav>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
