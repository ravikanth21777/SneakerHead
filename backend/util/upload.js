const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// For profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pictures',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// For product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'product_images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const profileUpload = multer({ storage: profileStorage });
const productUpload = multer({ storage: productStorage });

module.exports = {
  profileUpload,
  productUpload,
};
//this code sets up two separate multer storage configurations for handling file uploads to Cloudinary, one for user profile pictures and another for product images. The `profileUpload` and `productUpload` exports can be used in your routes to handle file uploads accordingly.
 // Update user profile with the image URL

