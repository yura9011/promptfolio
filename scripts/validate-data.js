#!/usr/bin/env node

import chalk from 'chalk';
import { readImagesData } from './utils/json-manager.js';

const VALID_CATEGORIES = [
  'Anime',
  'Manga',
  'Dark Fantasy',
  'Fotorealismo',
  'RPG/Fantasy',
  'Surrealismo',
  'Otros'
];

/**
 * Main validation function
 */
async function main() {
  console.log(chalk.bold.cyan('\n🔍 AI Image Gallery - Data Validation\n'));

  // Read images data
  const images = await readImagesData();
  
  if (images.length === 0) {
    console.log(chalk.yellow('⚠️  No images found in database'));
    process.exit(0);
  }

  console.log(chalk.blue(`📊 Validating ${images.length} image(s)...\n`));

  const errors = [];
  const warnings = [];
  const hashSet = new Set();

  // Validate each image
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const prefix = `Image #${i + 1} (${img.filename || img.id})`;

    // Check required fields
    if (!img.id) {
      errors.push(`${prefix}: Missing 'id' field`);
    }
    if (!img.url) {
      errors.push(`${prefix}: Missing 'url' field`);
    }
    if (!img.thumbnail) {
      warnings.push(`${prefix}: Missing 'thumbnail' field`);
    }

    // Check hash
    if (!img.hash) {
      warnings.push(`${prefix}: Missing 'hash' field (duplicate detection won't work)`);
    } else {
      if (hashSet.has(img.hash)) {
        errors.push(`${prefix}: Duplicate hash found: ${img.hash}`);
      }
      hashSet.add(img.hash);
    }

    // Check category
    if (img.category && !VALID_CATEGORIES.includes(img.category)) {
      warnings.push(`${prefix}: Invalid category '${img.category}'. Valid: ${VALID_CATEGORIES.join(', ')}`);
    }

    // Check URLs format
    if (img.url && !img.url.startsWith('http')) {
      errors.push(`${prefix}: Invalid URL format: ${img.url}`);
    }

    // Check date format
    if (img.created_at) {
      const date = new Date(img.created_at);
      if (isNaN(date.getTime())) {
        warnings.push(`${prefix}: Invalid date format: ${img.created_at}`);
      }
    }

    // Check prompt
    if (!img.prompt || img.prompt === 'Sin descripción') {
      warnings.push(`${prefix}: No prompt provided`);
    }
  }

  // Show results
  console.log(chalk.bold.cyan('\n📋 Validation Results\n'));

  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.green('✓ All validations passed!'));
    console.log(chalk.green(`✓ ${images.length} image(s) validated successfully\n`));
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log(chalk.red.bold(`❌ ${errors.length} Error(s):\n`));
    errors.forEach(err => console.log(chalk.red(`   • ${err}`)));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold(`⚠️  ${warnings.length} Warning(s):\n`));
    warnings.forEach(warn => console.log(chalk.yellow(`   • ${warn}`)));
    console.log('');
  }

  if (errors.length > 0) {
    console.log(chalk.red('❌ Validation failed\n'));
    process.exit(1);
  } else {
    console.log(chalk.yellow('⚠️  Validation passed with warnings\n'));
    process.exit(0);
  }
}

// Run main function
main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});
