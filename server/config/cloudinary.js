import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test configuration
cloudinary.api.ping()
  .then(() => logger.info('Cloudinary configuration successful'))
  .catch((error) => logger.error('Cloudinary configuration failed:', error));

export default cloudinary;