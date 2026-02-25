import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const COMPRESSION_QUALITY = 85;

/**
 * Check if image needs compression
 * @param {string} filePath - Path to the image file
 * @returns {Promise<boolean>} True if file size > 2MB
 */
export async function needsCompression(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size > MAX_SIZE_BYTES;
}

/**
 * Compress image to WebP format
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save compressed image
 * @returns {Promise<Object>} Compression stats
 */
export async function compressImage(inputPath, outputPath) {
  const originalStats = await fs.stat(inputPath);
  const originalSize = originalStats.size;

  await sharp(inputPath)
    .webp({ quality: COMPRESSION_QUALITY })
    .toFile(outputPath);

  const compressedStats = await fs.stat(outputPath);
  const compressedSize = compressedStats.size;
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = ((savedBytes / originalSize) * 100).toFixed(1);

  return {
    originalSize,
    compressedSize,
    savedBytes,
    savedPercentage,
    outputPath
  };
}

/**
 * Get human-readable file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
