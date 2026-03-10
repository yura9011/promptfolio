#!/usr/bin/env node

/**
 * Build script - Generate split JSON files from images.json
 * This runs automatically before deployment
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.bold.cyan('\n🔨 Building split JSON structure...\n'));

try {
  // Run split script
  execSync('node scripts/split-json.js --execute', { stdio: 'inherit' });
  
  console.log(chalk.green.bold('\n✓ Build complete!\n'));
  process.exit(0);
} catch (error) {
  console.error(chalk.red('\n❌ Build failed\n'));
  process.exit(1);
}
