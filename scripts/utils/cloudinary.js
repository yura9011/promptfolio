import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'ai-gallery';

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the image file
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} Upload result with URLs
 */
export async function uploadImage(filePath, publicId = null) {
  try {
    const options = {
      folder: CLOUDINARY_FOLDER,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };

    if (publicId) {
      options.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(filePath, options);

    // Generate thumbnail URL (300x300)
    const thumbnailUrl = cloudinary.url(result.public_id, {
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'auto' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      thumbnail: thumbnailUrl,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.message);
    throw error;
  }
}

/**
 * Get Cloudinary account usage statistics
 * @returns {Promise<Object>} Usage stats
 */
export async function getUsageStats() {
  try {
    const result = await cloudinary.api.usage();
    
    const usedGB = (result.storage.usage / (1024 * 1024 * 1024)).toFixed(2);
    const limitGB = (result.storage.limit / (1024 * 1024 * 1024)).toFixed(2);
    const usedPercentage = ((result.storage.usage / result.storage.limit) * 100).toFixed(1);

    return {
      storage: {
        used: usedGB,
        limit: limitGB,
        percentage: usedPercentage
      },
      credits: {
        used: result.credits?.usage || 0,
        limit: result.credits?.limit || 0
      },
      resources: result.resources || 0
    };
  } catch (error) {
    console.error('Error getting Cloudinary usage:', error.message);
    return null;
  }
}

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean} True if configured
 */
export function isConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}
