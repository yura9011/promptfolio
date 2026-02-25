#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { calculateImageHash, findDuplicateByHash } from './utils/image-hash.js';
import { needsCompression, compressImage, formatFileSize } from './utils/compressor.js';
import { parseMetadata } from './utils/metadata-parser.js';
import { readImagesData, addImageEntry, updateImageEntry } from './utils/json-manager.js';
import { uploadImage, getUsageStats, isConfigured } from './utils/cloudinary.js';

const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const BACKUP_DIR = 'backup';

// Parse command line arguments
const args = process.argv.slice(2);
const sourceDir = args[0];
const isDryRun = args.includes('--dry-run');

/**
 * Main function
 */
async function main() {
  console.log(chalk.bold.cyan('\n🎨 AI Image Gallery - Upload Script\n'));

  // Validate arguments
  if (!sourceDir) {
    console.error(chalk.red('❌ Error: Please provide a source directory'));
    console.log(chalk.yellow('Usage: node scripts/upload-images.js <source-directory> [--dry-run]'));
    process.exit(1);
  }

  // Check if Cloudinary is configured
  if (!isConfigured() && !isDryRun) {
    console.error(chalk.red('❌ Error: Cloudinary not configured'));
    console.log(chalk.yellow('Please create a .env file with your Cloudinary credentials'));
    console.log(chalk.yellow('See .env.example for reference'));
    process.exit(1);
  }

  // Check if source directory exists
  try {
    await fs.access(sourceDir);
  } catch {
    console.error(chalk.red(`❌ Error: Directory "${sourceDir}" not found`));
    process.exit(1);
  }

  if (isDryRun) {
    console.log(chalk.yellow('🔍 Running in DRY-RUN mode (no uploads will be performed)\n'));
  }

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
    totalSavedBytes: 0
  };

  for (const imageFile of imageFiles) {
    await processImage(imageFile, existingImages, stats, isDryRun);
  }

  // Show summary
  showSummary(stats, isDryRun);

  // Show Cloudinary usage
  if (!isDryRun) {
    await showCloudinaryUsage();
  }
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
async function processImage(imagePath, existingImages, stats, isDryRun) {
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
      
      // TODO: Ask user if they want to update metadata
      // For now, skip duplicates
      return;
    }

    // Backup original
    if (!isDryRun) {
      await backupImage(imagePath);
      console.log(chalk.gray(`   ✓ Backed up to ${BACKUP_DIR}/`));
    }

    // Check if compression needed
    let finalImagePath = imagePath;
    if (await needsCompression(imagePath)) {
      console.log(chalk.yellow(`   🗜️  Image > 2MB, compressing...`));
      
      if (!isDryRun) {
        const compressedPath = imagePath.replace(path.extname(imagePath), '.compressed.webp');
        const compressionStats = await compressImage(imagePath, compressedPath);
        
        console.log(chalk.green(`   ✓ Compressed: ${formatFileSize(compressionStats.originalSize)} → ${formatFileSize(compressionStats.compressedSize)} (saved ${compressionStats.savedPercentage}%)`));
        
        finalImagePath = compressedPath;
        stats.compressed++;
        stats.totalSavedBytes += compressionStats.savedBytes;
      }
    }

    // Read metadata from .txt file
    const metadata = await readMetadataFile(imagePath);
    console.log(chalk.gray(`   Category: ${metadata.category}`));
    console.log(chalk.gray(`   Model: ${metadata.model}`));

    // Upload to Cloudinary
    if (!isDryRun) {
      console.log(chalk.blue(`   ☁️  Uploading to Cloudinary...`));
      const uploadResult = await uploadImage(finalImagePath);
      console.log(chalk.green(`   ✓ Uploaded successfully`));

      // Create image entry
      const imageEntry = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        hash,
        url: uploadResult.url,
        thumbnail: uploadResult.thumbnail,
        filename,
        ...metadata,
        created_at: new Date().toISOString()
      };

      // Add to JSON
      await addImageEntry(imageEntry);
      console.log(chalk.green(`   ✓ Added to database`));

      // Clean up compressed file if created
      if (finalImagePath !== imagePath) {
        await fs.unlink(finalImagePath);
      }
    } else {
      console.log(chalk.gray(`   [DRY-RUN] Would upload to Cloudinary`));
      console.log(chalk.gray(`   [DRY-RUN] Would add to database`));
    }

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
function showSummary(stats, isDryRun) {
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

  if (isDryRun) {
    console.log(chalk.yellow('\n🔍 This was a dry-run. No changes were made.'));
  }
}

/**
 * Show Cloudinary usage statistics
 */
async function showCloudinaryUsage() {
  console.log(chalk.bold.cyan('\n☁️  Cloudinary Usage\n'));
  
  const usage = await getUsageStats();
  
  if (usage) {
    console.log(chalk.blue(`Storage: ${usage.storage.used} GB / ${usage.storage.limit} GB (${usage.storage.percentage}%)`));
    console.log(chalk.blue(`Resources: ${usage.resources}`));
    
    if (parseFloat(usage.storage.percentage) > 80) {
      console.log(chalk.yellow('\n⚠️  Warning: You are using more than 80% of your Cloudinary storage'));
    }
  } else {
    console.log(chalk.gray('Unable to fetch usage statistics'));
  }
}

// Run main function
main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});
