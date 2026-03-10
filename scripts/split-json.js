#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

const IMAGES_JSON = 'data/images.json';
const DATA_DIR = 'data';
const VARIANTS_DIR = path.join(DATA_DIR, 'variants');
const SINGLES_DIR = path.join(DATA_DIR, 'singles');
const INDEX_JSON = path.join(DATA_DIR, 'index.json');

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const execute = args.includes('--execute');

  if (!dryRun && !execute) {
    console.log(chalk.yellow('\n⚠️  Please specify --dry-run or --execute\n'));
    console.log(chalk.gray('Usage:'));
    console.log(chalk.gray('  node scripts/split-json.js --dry-run   # Preview structure'));
    console.log(chalk.gray('  node scripts/split-json.js --execute   # Apply changes\n'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('\n📦 Split JSON Architecture\n'));

  // Load images data
  console.log(chalk.blue('📂 Loading images.json...'));
  const data = await loadImagesData();
  console.log(chalk.green(`✓ Loaded ${data.length} entries\n`));

  // Analyze data
  console.log(chalk.blue('🔬 Analyzing data structure...'));
  const analysis = analyzeData(data);
  displayAnalysis(analysis);

  if (dryRun) {
    console.log(chalk.yellow.bold('\n🔍 DRY RUN MODE - Previewing structure\n'));
    previewStructure(analysis);
  } else {
    console.log(chalk.red.bold('\n⚠️  EXECUTE MODE - Creating split structure!\n'));
    
    // Create directories
    console.log(chalk.blue('📁 Creating directories...'));
    await createDirectories();
    console.log(chalk.green('✓ Directories created\n'));

    // Write variant files
    console.log(chalk.blue('📝 Writing variant group files...'));
    await writeVariantFiles(analysis.variantGroups);
    console.log(chalk.green(`✓ Wrote ${analysis.variantGroups.length} variant files\n`));

    // Write singles files
    console.log(chalk.blue('📝 Writing singles files...'));
    await writeSinglesFiles(analysis.singlesByCategory);
    console.log(chalk.green(`✓ Wrote ${Object.keys(analysis.singlesByCategory).length} singles files\n`));

    // Write index
    console.log(chalk.blue('📝 Writing index.json...'));
    await writeIndex(analysis);
    console.log(chalk.green('✓ Index created\n'));

    console.log(chalk.green.bold('✓ Split complete!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('  1. Review the new structure in data/'));
    console.log(chalk.gray('  2. Update gallery code to use DataLoader'));
    console.log(chalk.gray('  3. Test the gallery'));
    console.log(chalk.gray('  4. Keep images.json as backup\n'));
  }
}

/**
 * Load images data
 */
async function loadImagesData() {
  const content = await fs.readFile(IMAGES_JSON, 'utf-8');
  return JSON.parse(content);
}

/**
 * Analyze data structure
 */
function analyzeData(data) {
  const variantGroups = [];
  const singles = [];
  const singlesByCategory = {};

  for (const item of data) {
    if (item.variant_group && item.variants) {
      variantGroups.push(item);
    } else {
      singles.push(item);
      
      const category = item.category || 'Otros';
      if (!singlesByCategory[category]) {
        singlesByCategory[category] = [];
      }
      singlesByCategory[category].push(item);
    }
  }

  return {
    total: data.length,
    variantGroups,
    variantGroupsCount: variantGroups.length,
    singles,
    singlesCount: singles.length,
    singlesByCategory,
    categories: Object.keys(singlesByCategory)
  };
}

/**
 * Display analysis
 */
function displayAnalysis(analysis) {
  console.log(chalk.green(`✓ Total entries: ${analysis.total}`));
  console.log(chalk.green(`✓ Variant groups: ${analysis.variantGroupsCount}`));
  console.log(chalk.green(`✓ Single images: ${analysis.singlesCount}`));
  console.log(chalk.green(`✓ Categories: ${analysis.categories.length}`));
}

/**
 * Preview structure
 */
function previewStructure(analysis) {
  const MAX_IMAGES_PER_FILE = 20;
  
  console.log(chalk.cyan('📁 data/'));
  console.log(chalk.gray('  ├── index.json (main index)'));
  console.log(chalk.gray('  ├── images.json (backup - keep)'));
  console.log(chalk.gray('  ├── variants/'));
  
  analysis.variantGroups.forEach((group, i) => {
    const isLast = i === analysis.variantGroups.length - 1;
    const prefix = isLast ? '  │   └──' : '  │   ├──';
    const filename = `${group.variant_group}.json`;
    const size = estimateFileSize(group);
    console.log(chalk.gray(`${prefix} ${filename} (${group.variants.length} variants, ~${size} lines)`));
  });
  
  console.log(chalk.gray('  └── singles/'));
  
  const categories = Object.keys(analysis.singlesByCategory);
  categories.forEach((category, i) => {
    const isLast = i === categories.length - 1;
    const categorySlug = slugify(category);
    const count = analysis.singlesByCategory[category].length;
    
    if (count <= MAX_IMAGES_PER_FILE) {
      const prefix = isLast ? '      └──' : '      ├──';
      const filename = `${categorySlug}.json`;
      const size = estimateFileSize({ items: analysis.singlesByCategory[category] });
      console.log(chalk.gray(`${prefix} ${filename} (${count} images, ~${size} lines)`));
    } else {
      const chunks = Math.ceil(count / MAX_IMAGES_PER_FILE);
      for (let j = 0; j < chunks; j++) {
        const isLastChunk = j === chunks - 1 && isLast;
        const prefix = isLastChunk ? '      └──' : '      ├──';
        const filename = `${categorySlug}-${j + 1}.json`;
        const chunkSize = Math.min(MAX_IMAGES_PER_FILE, count - j * MAX_IMAGES_PER_FILE);
        const size = Math.ceil(chunkSize * 25 + 10);
        console.log(chalk.gray(`${prefix} ${filename} (${chunkSize} images, ~${size} lines)`));
      }
    }
  });

  console.log(chalk.cyan('\n📊 File Size Estimates:'));
  console.log(chalk.gray(`  Index: ~${estimateIndexSize(analysis)} lines`));
  console.log(chalk.gray(`  Largest variant file: ~${getLargestVariantSize(analysis)} lines`));
  console.log(chalk.gray(`  Largest singles file: ~${Math.min(MAX_IMAGES_PER_FILE * 25 + 10, getLargestSinglesSize(analysis))} lines`));
}

/**
 * Estimate file size in lines
 */
function estimateFileSize(item) {
  if (item.variants) {
    // Variant group: ~15 lines per variant + overhead
    return Math.ceil(item.variants.length * 15 + 20);
  } else if (item.items) {
    // Singles: ~25 lines per image + overhead
    return Math.ceil(item.items.length * 25 + 10);
  }
  return 0;
}

/**
 * Estimate index size
 */
function estimateIndexSize(analysis) {
  return Math.ceil(10 + analysis.variantGroupsCount * 5 + analysis.categories.length * 3);
}

/**
 * Get largest variant file size
 */
function getLargestVariantSize(analysis) {
  return Math.max(...analysis.variantGroups.map(g => estimateFileSize(g)));
}

/**
 * Get largest singles file size
 */
function getLargestSinglesSize(analysis) {
  return Math.max(...Object.values(analysis.singlesByCategory).map(items => 
    estimateFileSize({ items })
  ));
}

/**
 * Create directories
 */
async function createDirectories() {
  await fs.mkdir(VARIANTS_DIR, { recursive: true });
  await fs.mkdir(SINGLES_DIR, { recursive: true });
}

/**
 * Write variant group files
 */
async function writeVariantFiles(variantGroups) {
  for (const group of variantGroups) {
    const filename = `${group.variant_group}.json`;
    const filepath = path.join(VARIANTS_DIR, filename);
    const json = JSON.stringify(group, null, 2);
    await fs.writeFile(filepath, json, 'utf-8');
    console.log(chalk.gray(`  ✓ ${filename} (${group.variants.length} variants)`));
  }
}

/**
 * Write singles files by category
 */
async function writeSinglesFiles(singlesByCategory) {
  const MAX_IMAGES_PER_FILE = 20;
  
  for (const [category, images] of Object.entries(singlesByCategory)) {
    const categorySlug = slugify(category);
    
    // If category has few images, write single file
    if (images.length <= MAX_IMAGES_PER_FILE) {
      const filename = `${categorySlug}.json`;
      const filepath = path.join(SINGLES_DIR, filename);
      const json = JSON.stringify(images, null, 2);
      await fs.writeFile(filepath, json, 'utf-8');
      console.log(chalk.gray(`  ✓ ${filename} (${images.length} images)`));
    } else {
      // Split into multiple files
      const chunks = Math.ceil(images.length / MAX_IMAGES_PER_FILE);
      for (let i = 0; i < chunks; i++) {
        const start = i * MAX_IMAGES_PER_FILE;
        const end = Math.min(start + MAX_IMAGES_PER_FILE, images.length);
        const chunk = images.slice(start, end);
        
        const filename = `${categorySlug}-${i + 1}.json`;
        const filepath = path.join(SINGLES_DIR, filename);
        const json = JSON.stringify(chunk, null, 2);
        await fs.writeFile(filepath, json, 'utf-8');
        console.log(chalk.gray(`  ✓ ${filename} (${chunk.length} images)`));
      }
    }
  }
}

/**
 * Write index file
 */
async function writeIndex(analysis) {
  const MAX_IMAGES_PER_FILE = 20;
  
  const index = {
    version: '2.0',
    total_images: analysis.total,
    total_variant_groups: analysis.variantGroupsCount,
    total_singles: analysis.singlesCount,
    variant_groups: analysis.variantGroups.map(group => ({
      name: group.variant_group,
      file: `variants/${group.variant_group}.json`,
      count: group.variants.length,
      category: group.category,
      prompt_preview: group.prompt.substring(0, 100) + '...'
    })),
    singles_by_category: {},
    last_updated: new Date().toISOString()
  };

  // Build singles index
  for (const [category, images] of Object.entries(analysis.singlesByCategory)) {
    const categorySlug = slugify(category);
    
    if (images.length <= MAX_IMAGES_PER_FILE) {
      index.singles_by_category[category] = {
        files: [`singles/${categorySlug}.json`],
        count: images.length
      };
    } else {
      const chunks = Math.ceil(images.length / MAX_IMAGES_PER_FILE);
      const files = [];
      for (let i = 0; i < chunks; i++) {
        files.push(`singles/${categorySlug}-${i + 1}.json`);
      }
      index.singles_by_category[category] = {
        files,
        count: images.length
      };
    }
  }

  const json = JSON.stringify(index, null, 2);
  await fs.writeFile(INDEX_JSON, json, 'utf-8');
}

/**
 * Slugify string for filename
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Run
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error);
  process.exit(1);
});
