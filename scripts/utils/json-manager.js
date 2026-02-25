import fs from 'fs/promises';
import path from 'path';

const IMAGES_JSON_PATH = 'data/images.json';

/**
 * Read images.json file
 * @returns {Promise<Array>} Array of image objects
 */
export async function readImagesData() {
  try {
    const content = await fs.readFile(IMAGES_JSON_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

/**
 * Write images.json file
 * @param {Array} data - Array of image objects
 * @returns {Promise<void>}
 */
export async function writeImagesData(data) {
  const jsonContent = JSON.stringify(data, null, 2);
  await fs.writeFile(IMAGES_JSON_PATH, jsonContent, 'utf-8');
}

/**
 * Add a new image entry to images.json
 * @param {Object} imageData - Image object to add
 * @returns {Promise<void>}
 */
export async function addImageEntry(imageData) {
  const images = await readImagesData();
  images.push(imageData);
  await writeImagesData(images);
}

/**
 * Update an existing image entry by hash
 * @param {string} hash - MD5 hash of the image
 * @param {Object} newData - New data to merge
 * @returns {Promise<boolean>} True if updated, false if not found
 */
export async function updateImageEntry(hash, newData) {
  const images = await readImagesData();
  const index = images.findIndex(img => img.hash === hash);
  
  if (index === -1) return false;
  
  images[index] = { ...images[index], ...newData, updated_at: new Date().toISOString() };
  await writeImagesData(images);
  return true;
}

/**
 * Create backup of images.json
 * @returns {Promise<string>} Path to backup file
 */
export async function backupImagesData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `data/images.json.backup-${timestamp}`;
  
  try {
    await fs.copyFile(IMAGES_JSON_PATH, backupPath);
    return backupPath;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Original file doesn't exist, no backup needed
      return null;
    }
    throw error;
  }
}
