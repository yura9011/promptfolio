#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { calculateImageHash, findDuplicateByHash } from './utils/image-hash.js';
import { needsCompression, compressImage, formatFileSize } from './utils/compressor.js';
import { parseMetadata } from './utils/metadata-parser.js';
import { readImagesData, addImageEntry, writeImagesData } from './utils/json-manager.js';

const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const BACKUP_DIR = 'backup';
const IMAGES_DIR = 'images';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
  'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
  'once', 'if', 'because', 'until', 'while', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off',
  'over', 'under', 'again', 'further', 'being', 'having', 'doing', 'get', 'got',
  'showing', 'capturing', 'featuring', 'depicting', 'displaying',
  'com', 'www', 'http', 'https', 'jpg', 'png', 'image', 'photo', 'photograph',
  'picture', 'shot', 'taken', 'camera', 'lens', 'looking', 'seen', 'view',
  'scene', 'type', 'style', 'aesthetic', 'vibe', 'one', 'two', 'three', 'four',
  'five', 'using', 'with', 'without', 'based', 'inspired', 'render', 'generated',
  'created', 'made', 'digital', 'art', 'artwork', 'illustration', 'portrait',
  'background', 'foreground', 'middle', 'center', 'side', 'left', 'right',
  'top', 'bottom', 'front', 'back', 'behind', 'around', 'near', 'close', 'far'
]);

function extractTags(prompt) {
  let text = prompt;
  
  if (prompt.includes('<') && prompt.includes('>')) {
    text = text.replace(/<[^>]+>/g, ' ');
    text = text.replace(/\{[^}]+\}/g, ' ');
    text = text.replace(/<\?[^>]+\?>/g, ' ');
    text = text.replace(/&\w+;/g, ' ');
  }
  
  text = text.toLowerCase();
  text = text.replace(/[^\w\s#-]/g, ' ');
  text = text.replace(/\d+/g, ' ');
  
  const words = text.split(/\s+/).filter(w => w.length > 2);
  const keywords = [];
  const seen = new Set();
  
  for (const word of words) {
    const cleaned = word.trim().toLowerCase();
    if (cleaned.length < 3) continue;
    if (STOP_WORDS.has(cleaned)) continue;
    if (seen.has(cleaned)) continue;
    if (cleaned.startsWith('-year') || cleaned.startsWith('-star') || cleaned.startsWith('--')) continue;
    
    const isNumeric = /^\d+$/.test(cleaned);
    if (isNumeric) continue;
    
    seen.add(cleaned);
    keywords.push(cleaned);
  }
  
  return keywords.slice(0, 10);
}

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

  const newEntries = [];
  for (const imageFile of imageFiles) {
    const entry = await processImage(imageFile, existingImages, stats);
    if (entry) {
      newEntries.push(entry);
    }
  }

  // After processing all new images, group and save
  if (newEntries.length > 0) {
    console.log(chalk.blue(`\n📦 Grouping and saving ${newEntries.length} new entries...`));
    await groupAndSave(existingImages, newEntries);
  }

  // Show summary
  showSummary(stats);
}

/**
 * Group flat entries into variant collections and save
 */
async function groupAndSave(existingItems, newEntries) {
  const groups = {};
  const finalItems = [];

  // 1. Identify existing groups and ungrouped items with variant_group
  for (const item of existingItems) {
    if (item.variants && item.variant_group) {
      // It's already a group
      groups[item.variant_group] = item;
    } else if (item.variant_group) {
      // It's a flat item that SHOULD be in a group
      if (!groups[item.variant_group]) {
        groups[item.variant_group] = createGroupTemplate(item);
      }
      // Only add if not already in the group (by hash)
      if (!groups[item.variant_group].variants.some(v => v.hash === item.hash)) {
        groups[item.variant_group].variants.push(createVariantFromItem(item));
      }
    } else {
      // Regular item, no variant_group
      finalItems.push(item);
    }
  }

  // 2. Add new entries
  for (const item of newEntries) {
    if (item.variant_group) {
      if (!groups[item.variant_group]) {
        groups[item.variant_group] = createGroupTemplate(item);
      }
      
      // Check if already in group
      if (!groups[item.variant_group].variants.some(v => v.hash === item.hash)) {
        groups[item.variant_group].variants.push(createVariantFromItem(item));
      }
    } else {
      finalItems.push(item);
    }
  }

  // 3. Add all groups to finalItems and sort variants
  for (const groupName in groups) {
    const group = groups[groupName];
    // Sort variants by index (if available) or default to creation time/index
    group.variants.sort((a, b) => {
      const idxA = a.variant_index !== undefined && a.variant_index !== null ? a.variant_index : 999;
      const idxB = b.variant_index !== undefined && b.variant_index !== null ? b.variant_index : 999;
      return idxA - idxB;
    });
    
    // Update group timestamp if new variants added
    // (Could be sophisticated but let's keep it simple)
    finalItems.push(group);
  }

  // 4. Save to JSON
  await writeImagesData(finalItems);
}

/**
 * Create a template for a variant group
 */
function createGroupTemplate(item) {
  return {
    id: `variant-${item.variant_group}`,
    variant_group: item.variant_group,
    prompt: item.prompt,
    category: item.category,
    tags: item.tags,
    created_at: item.created_at || new Date().toISOString(),
    variants: []
  };
}

/**
 * Create a variant sub-item from a flat item
 */
function createVariantFromItem(item) {
  return {
    id: item.id,
    hash: item.hash,
    url: item.url,
    thumbnail: item.thumbnail,
    model: item.model,
    variant_index: item.variant_index,
    settings: item.settings,
    notes: item.notes
  };
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

    // Extract tags from prompt
    const tags = extractTags(metadata.prompt || '');
    console.log(chalk.gray(`   Tags: ${tags.slice(0, 5).join(', ')}${tags.length > 5 ? '...' : ''}`));

    // Create image entry
    const imageEntry = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      hash,
      url: `images/${finalFilename}`,
      thumbnail: `images/${finalFilename}`,
      filename: finalFilename,
      tags,
      ...metadata,
      created_at: new Date().toISOString()
    };

    console.log(chalk.green(`   ✓ Processed: ${finalFilename}`));
    stats.uploaded++;
    return imageEntry;
  } catch (error) {
    console.error(chalk.red(`   ❌ Error: ${error.message}`));
    stats.errors++;
    return null;
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
