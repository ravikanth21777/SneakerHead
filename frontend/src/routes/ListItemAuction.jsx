import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
  });

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setImages([...images, ...files]);

    // Create preview URLs
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log(formData);
    console.log(images);
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
              <img 
                src={previewImages[currentImageIndex]}
                alt="Primary preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={styles.uploadPlaceholder}>
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
                <span>Add product images</span>
                <label style={{ color: '#EF4444', cursor: 'pointer', fontWeight: 500 }}>
                  Upload files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    required={images.length === 0}
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
            </div>
          )}
        </div>

        {/* Form Section */}
        <div style={styles.formSection}>
          <h1 style={styles.formTitle}>List Your Sneaker</h1>
          <p style={styles.formSubtitle}>Fill in the details to list your sneaker for auction</p>

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