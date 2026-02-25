#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { calculateImageHash, findDuplicateByHash } from './utils/image-hash.js';
import { needsCompression, compressImage, formatFileSize } from './utils/compressor.js';
import { parseMetadata } from './utils/metadata-parser.js';
import { readImagesData, addImageEntry } from './utils/json-manager.js';

const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const BACKUP_DIR = 'backup';
const IMAGES_DIR = 'images';

// Parse command line arguments
const args = process.argv.slice(2);
const sourceDir = args[0] || 'uploads';

/**
 * Main function
 */
async function main() {
  console.log(chalk.bold.cyan('\n🎨 AI Image Gallery - Local Upload\n'));

  // Check if source directory exists
  try {
    await fs.access(sourceDir);
  } catch {
    console.error(chalk.red(`❌ Error: Directory "${sourceDir}" not found`));
    process.exit(1);
  }

  // Create images directory if it doesn't exist
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  // Scan for images
  console.log(chalk.blue('📂 Scanning for images...'));
  const imageFiles = await scanForImages(sourceDir);
  
  if (imageFiles.length === 0) {
    console.log(chalk.yellow('⚠️  No images found in the directory'));
    process.exit(0);
  }

  console.log(chalk.green(`✓ Found ${imageFiles.length} image(s)\n`));

  // Load existing images data
  const existingImages = await readImagesData();

  // Process images
  const stats = {
    uploaded: 0,
    duplicates: 0,
    compressed: 0,
    errors: 0,
    totalSavedBytes: 0,
    currentImageNumber: existingImages.length
  };

  for (const imageFile of imageFiles) {
    await processImage(imageFile, existingImages, stats);
  }

  // Show summary
  showSummary(stats);
}

/**
 * Scan directory for image files
 */
async function scanForImages(dir) {
  const files = await fs.readdir(dir);
  const imageFiles = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (SUPPORTED_EXTENSIONS.includes(ext)) {
      imageFiles.push(path.join(dir, file));
    }
  }

  return imageFiles;
}

/**
 * Process a single image
 */
async function processImage(imagePath, existingImages, stats) {
  const filename = path.basename(imagePath);
  console.log(chalk.cyan(`\n📸 Processing: ${filename}`));

  try {
    // Calculate hash
    const hash = await calculateImageHash(imagePath);
    console.log(chalk.gray(`   Hash: ${hash}`));

    // Check for duplicates
    const duplicate = findDuplicateByHash(hash, existingImages);
    if (duplicate) {
      console.log(chalk.yellow(`   ⚠️  Duplicate found (already uploaded)`));
      stats.duplicates++;
      return;
    }

    // Backup original
    await backupImage(imagePath);
    console.log(chalk.gray(`   ✓ Backed up to ${BACKUP_DIR}/`));

    // Generate sequential filename
    stats.currentImageNumber++;
    const imageNumber = stats.currentImageNumber;
    const ext = path.extname(imagePath);
    const newFilename = `img-${String(imageNumber).padStart(3, '0')}${ext}`;
    
    // Check if compression needed
    let finalImagePath = imagePath;
    let finalFilename = newFilename;
    
    if (await needsCompression(imagePath)) {
      console.log(chalk.yellow(`   🗜️  Image > 2MB, compressing...`));
      
      const compressedFilename = `img-${String(imageNumber).padStart(3, '0')}.webp`;
      const compressedPath = path.join(IMAGES_DIR, compressedFilename);
      const compressionStats = await compressImage(imagePath, compressedPath);
      
      console.log(chalk.green(`   ✓ Compressed: ${formatFileSize(compressionStats.originalSize)} → ${formatFileSize(compressionStats.compressedSize)} (saved ${compressionStats.savedPercentage}%)`));
      
      finalImagePath = compressedPath;
      finalFilename = compressedFilename;
      stats.compressed++;
      stats.totalSavedBytes += compressionStats.savedBytes;
    } else {
      // Copy image to images directory with new name
      const destPath = path.join(IMAGES_DIR, newFilename);
      await fs.copyFile(imagePath, destPath);
      finalImagePath = destPath;
      console.log(chalk.gray(`   ✓ Copied to ${IMAGES_DIR}/ as ${newFilename}`));
    }

    // Read metadata from .txt file
    const metadata = await readMetadataFile(imagePath);
    console.log(chalk.gray(`   Category: ${metadata.category}`));
    console.log(chalk.gray(`   Model: ${metadata.model}`));

    // Create image entry
    const imageEntry = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      hash,
      url: `images/${finalFilename}`,
      thumbnail: `images/${finalFilename}`,
      filename: finalFilename,
      ...metadata,
      created_at: new Date().toISOString()
    };

    // Add to JSON
    await addImageEntry(imageEntry);
    console.log(chalk.green(`   ✓ Added to database`));

    stats.uploaded++;
  } catch (error) {
    console.error(chalk.red(`   ❌ Error: ${error.message}`));
    stats.errors++;
  }
}

/**
 * Backup image to backup directory
 */
async function backupImage(imagePath) {
  const filename = path.basename(imagePath);
  const backupPath = path.join(BACKUP_DIR, filename);
  
  // Create backup directory if it doesn't exist
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  
  // Copy file
  await fs.copyFile(imagePath, backupPath);
}

/**
 * Read and parse metadata from .txt file
 */
async function readMetadataFile(imagePath) {
  const txtPath = imagePath.replace(path.extname(imagePath), '.txt');
  
  try {
    const content = await fs.readFile(txtPath, 'utf-8');
    return parseMetadata(content);
  } catch (error) {
    // No .txt file found, return defaults
    console.log(chalk.yellow(`   ⚠️  No .txt file found, using defaults`));
    return {
      prompt: 'Sin descripción',
      model: 'Desconocido',
      category: 'Otros',
      achievement: false,
      settings: {},
      notes: ''
    };
  }
}

/**
 * Show summary of operations
 */
function showSummary(stats) {
  console.log(chalk.bold.cyan('\n\n📊 Summary\n'));
  console.log(chalk.green(`✓ Uploaded: ${stats.uploaded}`));
  console.log(chalk.yellow(`⚠️  Duplicates skipped: ${stats.duplicates}`));
  console.log(chalk.blue(`🗜️  Compressed: ${stats.compressed}`));
  
  if (stats.totalSavedBytes > 0) {
    console.log(chalk.gray(`   Saved: ${formatFileSize(stats.totalSavedBytes)}`));
  }
  
  if (stats.errors > 0) {
    console.log(chalk.red(`❌ Errors: ${stats.errors}`));
  }

  console.log(chalk.green('\n✓ Done! Images are ready in the images/ folder'));
  console.log(chalk.yellow('Run "git add . && git commit -m \'Add new images\' && git push" to deploy'));
}

// Run main function
main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});
