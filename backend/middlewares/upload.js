const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/products/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const sanitizedFieldname = file.fieldname.replace(/[^a-zA-Z0-9]/g, '');
    cb(null, `${sanitizedFieldname}-${uniqueSuffix}${ext}`);
  }
});

// File type filter (images only)
const fileFilter = (req, file, cb) => {
  console.log(`📁 File filter check: ${file.originalname} (${file.mimetype})`);
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif'  // Added AVIF support
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, WebP, and AVIF images are allowed.`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
    files: 5 // Max 5 images per request
  }
});

// Error handling middleware for multer errors
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('📦 Multer Error:', error);
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB per file.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum is 5 files per upload.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Make sure you are using the correct field name.',
          error: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message,
          error: 'UPLOAD_ERROR'
        });
    }
  } else if (error && error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
};

module.exports = { upload, handleUploadErrors };