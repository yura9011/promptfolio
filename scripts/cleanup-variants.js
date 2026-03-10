#!/usr/bin/env node

import fs from 'fs/promises';
import chalk from 'chalk';

const IMAGES_JSON = 'data/images.json';
const IMAGES_BACKUP = 'data/images.json.backup';
const MANIFEST_JSON = 'cleanup-manifest.json';

/**
 * Main cleanup function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const execute = args.includes('--execute');

  if (!dryRun && !execute) {
    console.log(chalk.yellow('\n⚠️  Please specify --dry-run or --execute\n'));
    console.log(chalk.gray('Usage:'));
    console.log(chalk.gray('  node scripts/cleanup-variants.js --dry-run   # Preview changes'));
    console.log(chalk.gray('  node scripts/cleanup-variants.js --execute   # Apply changes\n'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('\n🧹 Variant Cleanup\n'));

  // Load manifest
  console.log(chalk.blue('📂 Loading cleanup manifest...'));
  const manifest = await loadManifest();
  console.log(chalk.green(`✓ Loaded ${manifest.total_actions} actions\n`));

  // Load images data
  console.log(chalk.blue('📂 Loading images.json...'));
  const data = await loadImagesData();
  console.log(chalk.green(`✓ Loaded ${data.length} entries\n`));

  if (dryRun) {
    console.log(chalk.yellow.bold('🔍 DRY RUN MODE - No changes will be made\n'));
  } else {
    console.log(chalk.red.bold('⚠️  EXECUTE MODE - Changes will be applied!\n'));
    
    // Create backup
    console.log(chalk.blue('💾 Creating backup...'));
    await createBackup();
    console.log(chalk.green(`✓ Backup saved to ${IMAGES_BACKUP}\n`));
  }

  // Process actions
  console.log(chalk.blue('🔬 Processing actions...\n'));
  const stats = {
    removed: 0,
    notFound: 0,
    errors: 0
  };

  const updatedData = processActions(data, manifest.actions, stats, dryRun);

  // Display results
  displayStats(stats, manifest.total_actions);

  if (execute) {
    // Save updated data
    console.log(chalk.blue('\n💾 Saving updated data...'));
    await saveImagesData(updatedData);
    console.log(chalk.green(`✓ Saved to ${IMAGES_JSON}\n`));

    console.log(chalk.green.bold('✓ Cleanup complete!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('  1. Test the gallery: open index.html'));
    console.log(chalk.gray('  2. Verify variant groups look correct'));
    console.log(chalk.gray('  3. If something is wrong: cp data/images.json.backup data/images.json'));
    console.log(chalk.gray('  4. If everything is good: git add . && git commit -m "fix: clean variant groups"\n'));
  } else {
    console.log(chalk.yellow('\n⚠️  This was a dry run. No changes were made.'));
    console.log(chalk.cyan('To apply changes, run: node scripts/cleanup-variants.js --execute\n'));
  }
}

/**
 * Load cleanup manifest
 */
async function loadManifest() {
  const content = await fs.readFile(MANIFEST_JSON, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load images data
 */
async function loadImagesData() {
  const content = await fs.readFile(IMAGES_JSON, 'utf-8');
  return JSON.parse(content);
}

/**
 * Create backup
 */
async function createBackup() {
  await fs.copyFile(IMAGES_JSON, IMAGES_BACKUP);
}

/**
 * Process cleanup actions
 */
function processActions(data, actions, stats, dryRun) {
  const updatedData = JSON.parse(JSON.stringify(data)); // Deep clone

  for (const action of actions) {
    if (action.action === 'remove_variant') {
      const result = removeVariant(updatedData, action, dryRun);
      
      if (result.success) {
        stats.removed++;
        console.log(chalk.green(`✓ ${dryRun ? '[DRY RUN] Would remove' : 'Removed'}: ${action.url} from ${action.variant_group}`));
      } else if (result.notFound) {
        stats.notFound++;
        console.log(chalk.yellow(`⚠️  Not found: ${action.url} in ${action.variant_group}`));
      } else {
        stats.errors++;
        console.log(chalk.red(`❌ Error: ${action.url} in ${action.variant_group}`));
      }
    }
  }

  return updatedData;
}

/**
 * Remove a variant from a group
 */
function removeVariant(data, action, dryRun) {
  // Find the variant group
  const groupIndex = data.findIndex(item => 
    item.variant_group === action.variant_group && item.variants
  );

  if (groupIndex === -1) {
    return { success: false, notFound: true };
  }

  const group = data[groupIndex];
  
  // Find the variant by hash (more reliable than ID)
  const variantIndex = group.variants.findIndex(v => v.hash === action.hash);

  if (variantIndex === -1) {
    return { success: false, notFound: true };
  }

  // Remove the variant
  if (!dryRun) {
    group.variants.splice(variantIndex, 1);
    
    // If group is now empty, remove the entire group
    if (group.variants.length === 0) {
      data.splice(groupIndex, 1);
      console.log(chalk.yellow(`   ⚠️  Group ${action.variant_group} is now empty and was removed`));
    }
  }

  return { success: true };
}

/**
 * Display statistics
 */
function displayStats(stats, total) {
  console.log(chalk.bold.cyan('\n📊 Summary\n'));
  console.log(chalk.green(`✓ Removed: ${stats.removed}/${total}`));
  
  if (stats.notFound > 0) {
    console.log(chalk.yellow(`⚠️  Not found: ${stats.notFound}`));
  }
  
  if (stats.errors > 0) {
    console.log(chalk.red(`❌ Errors: ${stats.errors}`));
  }
}

/**
 * Save updated images data
 */
async function saveImagesData(data) {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(IMAGES_JSON, json, 'utf-8');
}

// Run
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error);
  process.exit(1);
});
