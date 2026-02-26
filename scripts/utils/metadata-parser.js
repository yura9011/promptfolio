/**
 * Parse metadata from a .txt file
 * Supports flexible formats: key:value, key=value, or free text
 * If content has XML/structured format, keeps it as-is in prompt
 * @param {string} content - Content of the .txt file
 * @returns {Object} Parsed metadata
 */
export function parseMetadata(content) {
  const metadata = {
    prompt: '',
    model: 'Desconocido',
    category: 'Otros',
    achievement: false,
    variant_group: null,
    variant_index: null,
    settings: {},
    notes: ''
  };

  // Check if content has MODEL/DIMENSIONS/SEED/STEPS at the end (common AI format)
  const hasMetadataSection = /MODEL\s*\n|DIMENSIONS\s*\n|SEED\s*\n|STEPS\s*\n|SAMPLER\s*\n|VARIANT_GROUP\s*\n/i.test(content);
  
  if (hasMetadataSection) {
    // Split content into prompt and metadata sections
    const parts = content.split(/\n(?=MODEL|DIMENSIONS|SEED|STEPS|SAMPLER|SCHEDULER|VARIANT_GROUP|VARIANT_INDEX)/i);
    
    // First part is the prompt (keep it complete)
    metadata.prompt = parts[0].trim();
    
    // Parse metadata from remaining parts
    const metadataText = parts.slice(1).join('\n');
    
    const modelMatch = metadataText.match(/MODEL\s*\n\s*([^\n]+)/i);
    if (modelMatch) metadata.model = modelMatch[1].trim();
    
    const dimensionsMatch = metadataText.match(/DIMENSIONS\s*\n\s*([^\n]+)/i);
    if (dimensionsMatch) metadata.settings.size = dimensionsMatch[1].trim();
    
    const seedMatch = metadataText.match(/SEED\s*\n\s*([^\n]+)/i);
    if (seedMatch) metadata.settings.seed = seedMatch[1].trim();
    
    const stepsMatch = metadataText.match(/STEPS\s*\n\s*([^\n]+)/i);
    if (stepsMatch) metadata.settings.steps = parseInt(stepsMatch[1].trim()) || stepsMatch[1].trim();
    
    const samplerMatch = metadataText.match(/SAMPLER\s*\n\s*([^\n]+)/i);
    if (samplerMatch) metadata.settings.sampler = samplerMatch[1].trim();
    
    const schedulerMatch = metadataText.match(/SCHEDULER\s*\n\s*([^\n]+)/i);
    if (schedulerMatch) metadata.settings.scheduler = schedulerMatch[1].trim();

    const groupMatch = metadataText.match(/VARIANT_GROUP\s*\n\s*([^\n]+)/i);
    if (groupMatch) metadata.variant_group = groupMatch[1].trim();

    const indexMatch = metadataText.match(/VARIANT_INDEX\s*\n\s*([^\n]+)/i);
    if (indexMatch) metadata.variant_index = parseInt(indexMatch[1].trim()) || indexMatch[1].trim();
    
    return metadata;
  }

  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const promptLines = [];
  let foundMetadata = false;

  // Try to parse as key:value or key=value format
  for (const line of lines) {
    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
    const equalsMatch = line.match(/^([^=]+)=\s*(.+)$/);
    
    const match = colonMatch || equalsMatch;
    
    // Only treat as key:value if the key is short (likely a metadata field)
    if (match && match[1].trim().length < 50) {
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();

      // Map known fields
      if (key === 'prompt' || key === 'description' || key === 'desc') {
        metadata.prompt = value;
        foundMetadata = true;
      } else if (key === 'model' || key === 'modelo') {
        metadata.model = value;
        foundMetadata = true;
      } else if (key === 'variant_group' || key === 'variant-group' || key === 'group') {
        metadata.variant_group = value;
        foundMetadata = true;
      } else if (key === 'variant_index' || key === 'variant-index' || key === 'index') {
        metadata.variant_index = parseInt(value) || value;
        foundMetadata = true;
      } else if (key === 'category' || key === 'categoria' || key === 'categoría') {
        metadata.category = normalizeCategory(value);
        foundMetadata = true;
      } else if (key === 'achievement' || key === 'logro') {
        metadata.achievement = parseBoolean(value);
        foundMetadata = true;
      } else if (key === 'notes' || key === 'notas') {
        metadata.notes = value;
        foundMetadata = true;
      } else if (key === 'steps') {
        metadata.settings.steps = parseInt(value) || value;
        foundMetadata = true;
      } else if (key === 'cfg scale' || key === 'cfg_scale' || key === 'cfg') {
        metadata.settings.cfg_scale = parseFloat(value) || value;
        foundMetadata = true;
      } else if (key === 'sampler') {
        metadata.settings.sampler = value;
        foundMetadata = true;
      } else if (key === 'seed') {
        metadata.settings.seed = value;
        foundMetadata = true;
      } else if (key === 'size' || key === 'resolution') {
        metadata.settings.size = value;
        foundMetadata = true;
      } else if (key === 'scheduler') {
        metadata.settings.scheduler = value;
        foundMetadata = true;
      } else {
        // Unknown short key - might be a valid setting, but skip if value is too long (likely prompt fragment)
        if (value.length < 100) {
          if (!metadata.settings.otros) metadata.settings.otros = {};
          metadata.settings.otros[key] = value;
          foundMetadata = true;
        } else {
          // Long value, treat as prompt line
          promptLines.push(line);
        }
      }
    } else {
      // Not a key:value line, or key is too long - part of prompt
      promptLines.push(line);
    }
  }

  // If we found metadata but no explicit prompt, use the non-metadata lines as prompt
  if (foundMetadata && !metadata.prompt && promptLines.length > 0) {
    metadata.prompt = promptLines.join(' ');
  }

  // If no structured data found, try to extract from free text
  if (!metadata.prompt) {
    // Try to detect model from lines
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('stable diffusion') || lower.includes('sd')) {
        metadata.model = line;
      } else if (lower.includes('midjourney')) {
        metadata.model = 'Midjourney';
      } else if (lower.includes('dall-e') || lower.includes('dalle')) {
        metadata.model = 'DALL-E';
      } else if (lower.includes('novelai')) {
        metadata.model = 'NovelAI';
      }
      
      // Try to detect category
      if (lower.includes('anime')) metadata.category = 'Anime';
      else if (lower.includes('manga')) metadata.category = 'Manga';
      else if (lower.includes('fantasy')) metadata.category = 'Dark Fantasy';
      else if (lower.includes('fotorealismo') || lower.includes('photorealistic')) metadata.category = 'Fotorealismo';
      else if (lower.includes('rpg')) metadata.category = 'RPG/Fantasy';
      else if (lower.includes('surreal')) metadata.category = 'Surrealismo';
      
      // Try to detect achievement
      if (lower.includes('achievement') || lower.includes('logro')) {
        metadata.achievement = true;
      }
    }
    
    metadata.prompt = extractPromptFromFreeText(lines);
  }

  return metadata;
}

/**
 * Normalize category name to match predefined categories
 */
function normalizeCategory(category) {
  const normalized = category.toLowerCase().trim();
  const categories = {
    'anime': 'Anime',
    'manga': 'Manga',
    'dark fantasy': 'Dark Fantasy',
    'fantasy': 'Dark Fantasy',
    'fotorealismo': 'Fotorealismo',
    'fotorealism': 'Fotorealismo',
    'photorealistic': 'Fotorealismo',
    'rpg': 'RPG/Fantasy',
    'rpg/fantasy': 'RPG/Fantasy',
    'surrealismo': 'Surrealismo',
    'surrealism': 'Surrealismo',
    'otros': 'Otros',
    'other': 'Otros'
  };

  return categories[normalized] || 'Otros';
}

/**
 * Parse boolean from various string formats
 */
function parseBoolean(value) {
  const normalized = value.toLowerCase().trim();
  return ['yes', 'true', 'si', 'sí', '1', 'achievement', 'logro'].includes(normalized);
}

/**
 * Extract prompt from free text (fallback)
 */
function extractPromptFromFreeText(lines) {
  // Try to find the longest line as likely prompt
  const longestLine = lines.reduce((longest, line) => 
    line.length > longest.length ? line : longest, '');
  
  // If we found a long line, use it
  if (longestLine.length > 20) {
    return longestLine;
  }
  
  // Otherwise, join all lines that don't look like metadata
  const textLines = lines.filter(line => {
    const lower = line.toLowerCase();
    return !lower.includes('stable diffusion') && 
           !lower.includes('midjourney') &&
           !lower.includes('dall-e') &&
           !lower.includes('achievement') &&
           !lower.includes('anime') &&
           !lower.includes('manga') &&
           !lower.includes('fantasy') &&
           !lower.includes('fotorealismo');
  });
  
  return textLines.join(' ') || 'Sin descripción';
}
