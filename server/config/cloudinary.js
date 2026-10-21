const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads an in-memory Buffer to Cloudinary via upload_stream
 * @param {Buffer} buffer - In-memory image buffer from multer
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadBufferToCloudinary = (buffer, folder = 'rwave_cardio_nx/products') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(
        new Error('Cloudinary credentials missing in environment variables. Check server/.env.')
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Uploads a local file from disk directly to Cloudinary (used by seeder)
 * @param {string} filePath - Absolute or relative path to local image file
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadLocalFileToCloudinary = async (filePath, folder = 'rwave_cardio_nx/products') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials missing in environment variables.');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
};

/**
 * Deletes an asset from Cloudinary by its public ID
 * @param {string} publicId - Cloudinary asset public_id
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ Cloudinary not configured. Skipping deletion of:', publicId);
    return null;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.error('❌ Cloudinary destroy error for public_id:', publicId, err.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  uploadLocalFileToCloudinary,
  deleteFromCloudinary,
};
