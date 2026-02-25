import crypto from 'crypto';
import fs from 'fs/promises';

/**
 * Calculate MD5 hash of an image file
 * @param {string} filePath - Path to the image file
 * @returns {Promise<string>} MD5 hash
 */
export async function calculateImageHash(filePath) {
  const fileBuffer = await fs.readFile(filePath);
  const hash = crypto.createHash('md5');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

/**
 * Check if an image hash exists in the images database
 * @param {string} hash - MD5 hash to check
 * @param {Array} imagesData - Array of image objects from images.json
 * @returns {Object|null} Existing image object if found, null otherwise
 */
export function findDuplicateByHash(hash, imagesData) {
  return imagesData.find(img => img.hash === hash) || null;
}
