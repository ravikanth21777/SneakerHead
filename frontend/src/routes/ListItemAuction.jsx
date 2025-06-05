import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Helper function to generate unique hash for each image
const generateImageHash = (file) => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

const conditions = ["New with Box", "New without Box", "Used - Like New", "Used - Good", "Used - Fair"];
const categories = ["Sneakers", "Limited Edition", "Collaboration", "Vintage", "Custom"];
const sizes = Array.from({ length: 20 }, (_, i) => i + 3).map(num => `US ${num}`);

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f8f8'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem'
  },
  imageSection: {
    position: 'sticky',
    top: '2rem',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  previewContainer: {
    aspectRatio: '4/3',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    background: '#fff',
    border: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
    color: '#666',
    cursor: 'pointer'
  },
  uploadIcon: {
    width: '48px',
    height: '48px',
    color: '#9CA3AF'
  },
  thumbnailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.5rem'
  },
  thumbnailButton: {
    padding: 0,
    border: 0,
    background: 'none',
    cursor: 'pointer',
    aspectRatio: '1',
    borderRadius: '0.5rem',
    overflow: 'hidden'
  },
  formSection: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '0.5rem',
    border: '1px solid #eee'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111',
    marginBottom: '0.5rem'
  },
  formSubtitle: {
    color: '#666',
    marginBottom: '2rem'
  },
  formGroup: {
    marginBottom: '2rem'
  },
  formGroupHeader: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #eee'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  inputGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#111',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  required: {
    '&::after': {
      content: '" *"',
      color: '#EF4444'
    }
  },
  submitButton: {
    width: '100%',
    padding: '0.75rem',
    background: '#EF4444',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    '&:hover': {
      background: '#DC2626'
    }
  },
  textarea: {
    minHeight: '120px',
    resize: 'vertical',
    lineHeight: '1.5'
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0
  }
};

const ListItemAuction = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    productTitle: '',
    description: '',
    category: '',
    brand: '',
    modelEdition: '',
    size: '',
    condition: '',
    sku: '',
    startingBid: '',
    auctionDuration: '',
    bidIncrement: '',
    reservePrice: '',
    buyItNowPrice: '',
    quantity: 1
  });    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files);
      const maxImages = 5;
      const remainingSlots = maxImages - images.length;
      
      if (files.length === 0) return;

      if (files.length > remainingSlots) {
        alert(`You can only add ${remainingSlots} more image${remainingSlots > 1 ? 's' : ''}`);
        return;
      }

      // Get hashes of existing images
      const existingHashes = images.map(generateImageHash);

      // Validate file types, sizes, and duplicates
      const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        const isDuplicate = existingHashes.includes(generateImageHash(file));
        
        if (!isImage) {
          alert(`File "${file.name}" is not an image`);
          return false;
        }
        if (!isValidSize) {
          alert(`File "${file.name}" exceeds 5MB limit`);
          return false;
        }
        if (isDuplicate) {
          alert(`File "${file.name}" has already been added`);
          return false;
        }
        return true;
      });

    if (validFiles.length === 0) return;
    
    setImages(prevImages => [...prevImages, ...validFiles]);

    // Create preview URLs
    const newPreviewImages = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prevPreviews => [...prevPreviews, ...newPreviewImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviewImages(newPreviews);
    
    if (currentImageIndex >= newPreviews.length) {
      setCurrentImageIndex(Math.max(0, newPreviews.length - 1));
    }
  };

  // Component cleanup
  React.useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, []); // Empty dependency array means this runs on unmount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('User not logged in');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    try {
      setError(''); // Clear any previous errors
      // STEP 1: Create the product
      const productResponse = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.productTitle,
          description: formData.description,
          brand: formData.brand,
          edition: formData.modelEdition,
          size: formData.size,
          category: formData.category,
          startBid: parseFloat(formData.startingBid),
          // Convert local datetime to UTC
          AuctionEndDate: new Date(formData.auctionDuration).toISOString(),
          bidIncrement: formData.bidIncrement ? parseFloat(formData.bidIncrement) : undefined,
          buyNowPrice: formData.buyItNowPrice ? parseFloat(formData.buyItNowPrice) : undefined,
          condition: formData.condition,
          sku: formData.sku || undefined,
          reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : undefined
        })
      });

    const productData = await productResponse.json();
    if (!productResponse.ok) {
      alert(productData.message || 'Failed to create product');
      return;
    }

    const productId = productData._id;

    // STEP 2: Upload images
    const imageFormData = new FormData();
    images.forEach(file => imageFormData.append('productImages', file));

    const imageResponse = await fetch(`http://localhost:5000/api/products/${productId}/upload-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type here; browser will set it with boundary for multipart/form-data
      },
      body: imageFormData,
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      try {
        const errorJson = JSON.parse(errorText);
        setError(errorJson.message || 'Failed to upload product images');
      } catch (e) {
        setError('Failed to upload product images');
      }
      return;
    }

    const imageResult = await imageResponse.json();
    setError('');
    alert('Product listed successfully!');
    navigate('/profile');

  } catch (err) {
    console.error(err);
    alert('Something went wrong while submitting the form');
  }
};

  return (
    <div style={styles.container}>
      <Navbar />

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Image Section */}
        <div style={styles.imageSection}>
          <div style={styles.previewContainer}>
            {previewImages.length > 0 ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={previewImages[currentImageIndex]}
                  alt={`Preview ${currentImageIndex + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '0.5rem' }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(currentImageIndex);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: '50%',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    fontSize: '16px',
                    lineHeight: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ) : (
              <div 
                style={styles.uploadPlaceholder}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <svg
                  style={styles.uploadIcon}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Add product images (up to 5)</span>
                <label style={{ color: '#EF4444', cursor: 'pointer', fontWeight: 500 }}>
                  Upload files
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={styles.srOnly}
                  />
                </label>
              </div>
            )}
          </div>

          {previewImages.length > 0 && (
            <div style={styles.thumbnailGrid}>
              {previewImages.map((preview, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    ...styles.thumbnailButton,
                    border: index === currentImageIndex ? '2px solid #EF4444' : '1px solid #E5E7EB'
                  }}
                >
                  <img 
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
              {previewImages.length < 5 && (
                <label
                  style={{
                    ...styles.thumbnailButton,
                    border: '1px dashed #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '24px',
                    background: '#f8f8f8',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f8f8f8'}
                  title="Add more images"
                >
                  +
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    style={styles.srOnly}
                    onClick={(e) => {
                      e.target.value = ''; // Clear the input to allow selecting the same file again
                    }}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Form Section */}
        <div style={styles.formSection}>
          <h1 style={styles.formTitle}>List Your Sneaker</h1>
          <p style={styles.formSubtitle}>Fill in the details to list your sneaker for auction</p>
          {error && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={styles.formGroup}>
              <h2 style={styles.formGroupHeader}>Basic Information</h2>
              <div style={styles.inputGroup}>
                <label style={{...styles.label, ...styles.required}}>
                  Product Title
                  <input
                    type="text"
                    name="productTitle"
                    value={formData.productTitle}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Nike Air Jordan 1 Retro High OG"
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={styles.inputGroup}>
                <label style={{...styles.label, ...styles.required}}>
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe your sneaker's condition, history, and any special features..."
                    style={{...styles.input, ...styles.textarea}}
                  />
                </label>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={{...styles.label, ...styles.required}}>
                    Category
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={styles.inputGroup}>
                  <label style={{...styles.label, ...styles.required}}>
                    Brand
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Nike"
                      style={styles.input}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div style={styles.formGroup}>
              <h2 style={styles.formGroupHeader}>Product Details</h2>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={{...styles.label, ...styles.required}}>
                    Model/Edition
                    <input
                      type="text"
                      name="modelEdition"
                      value={formData.modelEdition}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Air Jordan 1"
                      style={styles.input}
                    />
                  </label>
                </div>

                <div style={styles.inputGroup}>
                  <label style={{...styles.label, ...styles.required}}>
                    Size
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    >
                      <option value="">Select Size</option>
                      {sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={styles.inputGroup}>
                  <label style={{...styles.label, ...styles.required}}>
                    Condition
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                    >
                      <option value="">Select Condition</option>
                      {conditions.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    SKU
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Optional product identifier"
                      style={styles.input}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Auction Details */}
            <div style={styles.formGroup}>
              <h2 style={styles.formGroupHeader}>Auction Details</h2>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={{...styles.label, ...styles.required}}>
                    Starting Bid (₹)
                    <input
                      type="number"
                      name="startingBid"
                      value={formData.startingBid}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="e.g., 5000"
                      style={styles.input}
                    />
                  </label>
                </div>

                <div style={styles.inputGroup}>
                  <label style={{...styles.label, ...styles.required}}>
                    Auction End Date
                    <input
                      type="datetime-local"
                      name="auctionDuration"
                      value={formData.auctionDuration}
                      onChange={handleInputChange}
                      min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                      required
                      style={styles.input}
                    />
                  </label>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Bid Increment (₹)
                    <input
                      type="number"
                      name="bidIncrement"
                      value={formData.bidIncrement}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Optional minimum bid increase"
                      style={styles.input}
                    />
                  </label>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Reserve Price (₹)
                    <input
                      type="number"
                      name="reservePrice"
                      value={formData.reservePrice}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Optional minimum selling price"
                      style={styles.input}
                    />
                  </label>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Buy It Now Price (₹)
                  <input
                    type="number"
                    name="buyItNowPrice"
                    value={formData.buyItNowPrice}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Optional instant purchase price"
                    style={styles.input}
                  />
                </label>
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>
              List Item for Auction
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListItemAuction;