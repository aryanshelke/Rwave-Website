const multer = require('multer');

// Store uploaded files in memory as Buffers for direct streaming to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg'];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, PNG, WEBP, and AVIF image files are allowed!'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
