#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

const DATA_FILE = 'data/images.json';

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
  'showing', 'showing', 'capturing', 'featuring', 'depicting', 'displaying',
  'com', 'www', 'http', 'https', 'jpg', 'png', 'image', 'photo', 'photograph',
  'picture', 'shot', 'shot', 'taken', 'camera', 'lens', 'looking', 'seen', 'view',
  'scene', 'type', 'style', 'aesthetic', 'vibe', 'one', 'two', 'three', 'four',
  'five', 'using', 'with', 'without', 'based', 'inspired', 'render', 'generated',
  'created', 'made', 'digital', 'art', 'artwork', 'illustration', 'portrait',
  'background', 'foreground', 'middle', 'center', 'side', 'left', 'right',
  'top', 'bottom', 'front', 'back', 'behind', 'around', 'near', 'close', 'far'
]);

const STYLE_INDICATORS = [
  'cinematic', 'dramatic', 'moody', 'soft', 'hard', 'bright', 'dark', 'light',
  'vintage', 'retro', 'modern', 'classic', 'minimal', 'detailed', 'simple',
  'complex', 'realistic', 'stylized', 'abstract', 'surreal', 'dreamy', 'ethereal',
  'atmospheric', 'textured', 'grainy', 'noir', 'sepia', 'monochrome', 'colorful',
  'vibrant', 'muted', 'pastel', 'neon', 'warm', 'cool', 'natural', 'artificial'
];

const SUBJECT_INDICATORS = [
  'portrait', 'portrait', 'landscape', 'scene', 'object', 'creature', 'character',
  'person', 'woman', 'man', 'girl', 'boy', 'animal', 'building', 'city', 'nature'
];

function cleanXmlPrompt(prompt) {
  let text = prompt;
  
  text = text.replace(/<[^>]+>/g, ' ');
  
  text = text.replace(/\{[^}]+\}/g, ' ');
  
  const themeMatch = text.match(/<Theme>([^<]+)<\/Theme>/i);
  const atmosphereMatch = text.match(/<Atmosphere>([^<]+)<\/Atmosphere>/i);
  const lightingMatch = text.match(/<Lighting_Style>([^<]+)<\/Lighting_Style>/i);
  const artStyleMatch = text.match(/<Art_Style>([^<]+)<\/Art_Style>/i);
  const compositionMatch = text.match(/<Composition>([^<]+)<\/Composition>/i);
  
  let extracted = '';
  if (themeMatch) extracted += themeMatch[1] + ' ';
  if (atmosphereMatch) extracted += atmosphereMatch[1] + ' ';
  if (lightingMatch) extracted += lightingMatch[1] + ' ';
  if (artStyleMatch) extracted += artStyleMatch[1] + ' ';
  if (compositionMatch) extracted += compositionMatch[1] + ' ';
  
  if (extracted.trim()) {
    text = extracted;
  } else {
    text = text.replace(/<[^>]+>/g, ' ');
  }
  
  text = text.replace(/<\?[^>]+\?>/g, ' ');
  text = text.replace(/&\w+;/g, ' ');
  
  return text;
}

function extractKeywords(prompt) {
  let text = prompt;
  
  if (prompt.includes('<') && prompt.includes('>')) {
    text = cleanXmlPrompt(prompt);
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
  
  const prioritized = [];
  const remaining = [];
  
  for (const kw of keywords) {
    if (STYLE_INDICATORS.includes(kw)) {
      prioritized.push(kw);
    } else if (kw.includes('-')) {
      prioritized.push(kw);
    } else if (kw.length > 6) {
      remaining.push(kw);
    }
  }
  
  const others = keywords.filter(kw => !prioritized.includes(kw) && !remaining.includes(kw));
  
  return [...prioritized, ...remaining, ...others].slice(0, 10);
}

async function main() {
  console.log(chalk.bold.cyan('\n🏷️  Tag Extraction Script\n'));

  try {
    const data = await fs.readFile(path.join(process.cwd(), DATA_FILE), 'utf-8');
    const images = JSON.parse(data);

    console.log(chalk.blue(`📊 Found ${images.length} images`));

    let updatedCount = 0;
    let totalTagsAdded = 0;

    for (const image of images) {
      if (image.tags && image.tags.length > 0) {
        console.log(chalk.gray(`   ⏭️  Skip: ${image.id} (already has tags)`));
        continue;
      }

      const tags = extractKeywords(image.prompt || '');
      image.tags = tags;
      
      updatedCount++;
      totalTagsAdded += tags.length;

      console.log(chalk.green(`   ✓ ${image.id}: ${tags.slice(0, 5).join(', ')}${tags.length > 5 ? '...' : ''}`));
    }

    await fs.writeFile(path.join(process.cwd(), DATA_FILE), JSON.stringify(images, null, 2));

    console.log(chalk.bold.cyan('\n📈 Summary\n'));
    console.log(chalk.green(`✓ Updated: ${updatedCount} images`));
    console.log(chalk.blue(`🏷️  Total tags added: ${totalTagsAdded}`));
    console.log(chalk.green('\n✅ Done! Tags have been added to images.json'));

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

main();
