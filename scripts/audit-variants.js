#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

const IMAGES_JSON = 'data/images.json';
const OUTPUT_JSON = 'data/audit-report.json';

/**
 * Main audit function
 */
async function main() {
  console.log(chalk.bold.cyan('\n🔍 Variant Groups Audit\n'));

  // Load images.json
  console.log(chalk.blue('📂 Loading images.json...'));
  const data = await loadImagesData();
  console.log(chalk.green(`✓ Loaded ${data.length} entries\n`));

  // Analyze variant groups
  console.log(chalk.blue('🔬 Analyzing variant groups...'));
  const analysis = analyzeVariantGroups(data);
  
  // Display summary
  displaySummary(analysis);

  // Save report
  console.log(chalk.blue('\n💾 Saving audit report...'));
  await saveReport(analysis);
  console.log(chalk.green(`✓ Report saved to ${OUTPUT_JSON}\n`));

  // Display issues
  if (analysis.issues.length > 0) {
    console.log(chalk.yellow.bold('\n⚠️  Issues Found:\n'));
    analysis.issues.forEach((issue, i) => {
      console.log(chalk.yellow(`${i + 1}. ${issue.type}: ${issue.message}`));
      if (issue.details) {
        console.log(chalk.gray(`   ${issue.details}`));
      }
    });
  } else {
    console.log(chalk.green.bold('\n✓ No issues found!\n'));
  }

  console.log(chalk.cyan('\nNext step: Run "node scripts/generate-visual-report.js" to create HTML report\n'));
}

/**
 * Load and parse images.json
 */
async function loadImagesData() {
  const content = await fs.readFile(IMAGES_JSON, 'utf-8');
  return JSON.parse(content);
}

/**
 * Analyze all variant groups
 */
function analyzeVariantGroups(data) {
  const variantGroups = [];
  const singleImages = [];
  const imageNumberMap = new Map(); // Track which groups use which image numbers
  const issues = [];

  // Separate variant groups from single images
  for (const item of data) {
    if (item.variant_group && item.variants) {
      variantGroups.push(item);
    } else if (!item.variant_group) {
      singleImages.push(item);
    }
  }

  // Analyze each variant group
  const groupAnalysis = variantGroups.map(group => {
    const analysis = {
      id: group.id,
      variant_group: group.variant_group,
      prompt: group.prompt.substring(0, 100) + '...',
      category: group.category,
      variant_count: group.variants.length,
      variants: [],
      issues: []
    };

    // Analyze each variant
    group.variants.forEach(variant => {
      const imageNumber = extractImageNumber(variant.url);
      const extension = path.extname(variant.url);
      
      const variantInfo = {
        id: variant.id,
        url: variant.url,
        image_number: imageNumber,
        extension: extension,
        variant_index: variant.variant_index,
        model: variant.model,
        hash: variant.hash
      };

      analysis.variants.push(variantInfo);

      // Track image number usage
      if (imageNumber) {
        if (!imageNumberMap.has(imageNumber)) {
          imageNumberMap.set(imageNumber, []);
        }
        imageNumberMap.get(imageNumber).push({
          group: group.variant_group,
          url: variant.url,
          variant_index: variant.variant_index
        });
      }
    });

    // Check for missing variant_index 0
    const hasVariantZero = analysis.variants.some(v => v.variant_index === 0);
    if (!hasVariantZero) {
      analysis.issues.push({
        type: 'missing_original',
        message: 'Missing variant_index 0 (original image)'
      });
      issues.push({
        type: 'missing_original',
        message: `Group "${group.variant_group}" missing variant_index 0`,
        group: group.variant_group
      });
    }

    // Check for gaps in variant_index
    const indices = analysis.variants.map(v => v.variant_index).sort((a, b) => a - b);
    for (let i = 0; i < indices.length - 1; i++) {
      if (indices[i + 1] - indices[i] > 1) {
        analysis.issues.push({
          type: 'index_gap',
          message: `Gap in variant_index: ${indices[i]} → ${indices[i + 1]}`
        });
      }
    }

    return analysis;
  });

  // Check for image number collisions
  for (const [imageNumber, usages] of imageNumberMap.entries()) {
    if (usages.length > 1) {
      const groups = [...new Set(usages.map(u => u.group))];
      if (groups.length > 1) {
        issues.push({
          type: 'number_collision',
          message: `Image number ${imageNumber} used in multiple groups: ${groups.join(', ')}`,
          details: usages.map(u => `  - ${u.group}: ${u.url} (variant ${u.variant_index})`).join('\n'),
          image_number: imageNumber,
          groups: groups,
          usages: usages
        });
      }
    }
  }

  return {
    total_entries: data.length,
    variant_groups_count: variantGroups.length,
    single_images_count: singleImages.length,
    variant_groups: groupAnalysis,
    single_images: singleImages.map(img => ({
      id: img.id,
      url: img.url,
      image_number: extractImageNumber(img.url),
      category: img.category
    })),
    image_number_map: Object.fromEntries(imageNumberMap),
    issues: issues,
    generated_at: new Date().toISOString()
  };
}

/**
 * Extract image number from URL (e.g., "images/img-097.jpeg" → "097")
 */
function extractImageNumber(url) {
  const match = url.match(/img-(\d+)\./);
  return match ? match[1] : null;
}

/**
 * Display summary
 */
function displaySummary(analysis) {
  console.log(chalk.green(`✓ Total entries: ${analysis.total_entries}`));
  console.log(chalk.green(`✓ Variant groups: ${analysis.variant_groups_count}`));
  console.log(chalk.green(`✓ Single images: ${analysis.single_images_count}`));
  console.log(chalk.yellow(`⚠️  Issues found: ${analysis.issues.length}`));
}

/**
 * Save report to JSON
 */
async function saveReport(analysis) {
  const json = JSON.stringify(analysis, null, 2);
  await fs.writeFile(OUTPUT_JSON, json, 'utf-8');
}

// Run
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error);
  process.exit(1);
});
