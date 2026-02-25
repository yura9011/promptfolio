/**
 * Parse metadata from a .txt file
 * Supports flexible formats: key:value, key=value, XML tags, or free text
 * @param {string} content - Content of the .txt file
 * @returns {Object} Parsed metadata
 */
export function parseMetadata(content) {
  const metadata = {
    prompt: '',
    model: 'Desconocido',
    category: 'Otros',
    achievement: false,
    settings: {},
    notes: ''
  };

  // Try to extract from XML-like format first
  const xmlData = extractFromXML(content);
  if (xmlData) {
    return { ...metadata, ...xmlData };
  }

  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  // Try to parse as key:value or key=value format
  for (const line of lines) {
    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
    const equalsMatch = line.match(/^([^=]+)=\s*(.+)$/);
    
    const match = colonMatch || equalsMatch;
    
    if (match) {
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();

      // Map known fields
      if (key === 'prompt' || key === 'description' || key === 'desc') {
        metadata.prompt = value;
      } else if (key === 'model' || key === 'modelo') {
        metadata.model = value;
      } else if (key === 'category' || key === 'categoria' || key === 'categoría') {
        metadata.category = normalizeCategory(value);
      } else if (key === 'achievement' || key === 'logro') {
        metadata.achievement = parseBoolean(value);
      } else if (key === 'notes' || key === 'notas') {
        metadata.notes = value;
      } else if (key === 'steps') {
        metadata.settings.steps = parseInt(value) || value;
      } else if (key === 'cfg scale' || key === 'cfg_scale' || key === 'cfg') {
        metadata.settings.cfg_scale = parseFloat(value) || value;
      } else if (key === 'sampler') {
        metadata.settings.sampler = value;
      } else if (key === 'seed') {
        metadata.settings.seed = value;
      } else if (key === 'size' || key === 'resolution') {
        metadata.settings.size = value;
      } else {
        // Unknown field, store in settings.otros
        if (!metadata.settings.otros) metadata.settings.otros = {};
        metadata.settings.otros[key] = value;
      }
    }
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

/**
 * Extract metadata from XML-like format
 */
function extractFromXML(content) {
  // Check if content has XML-like structure
  if (!content.includes('<') || !content.includes('>')) {
    return null;
  }

  const metadata = {
    prompt: '',
    model: 'Desconocido',
    category: 'Otros',
    achievement: false,
    settings: {},
    notes: ''
  };

  // Extract Theme as prompt
  const themeMatch = content.match(/<Theme>([^<]+)<\/Theme>/);
  if (themeMatch) {
    metadata.prompt = themeMatch[1].trim();
  }

  // Extract Atmosphere as notes
  const atmosphereMatch = content.match(/<Atmosphere>([^<]+)<\/Atmosphere>/);
  if (atmosphereMatch) {
    metadata.notes = atmosphereMatch[1].trim();
  }

  // Extract MODEL
  const modelMatch = content.match(/MODEL\s*\n\s*([^\n]+)/);
  if (modelMatch) {
    metadata.model = modelMatch[1].trim();
  }

  // Extract DIMENSIONS
  const dimensionsMatch = content.match(/DIMENSIONS\s*\n\s*([^\n]+)/);
  if (dimensionsMatch) {
    metadata.settings.size = dimensionsMatch[1].trim();
  }

  // Extract SEED
  const seedMatch = content.match(/SEED\s*\n\s*([^\n]+)/);
  if (seedMatch) {
    metadata.settings.seed = seedMatch[1].trim();
  }

  // Extract STEPS
  const stepsMatch = content.match(/STEPS\s*\n\s*([^\n]+)/);
  if (stepsMatch) {
    metadata.settings.steps = parseInt(stepsMatch[1].trim()) || stepsMatch[1].trim();
  }

  // Extract SAMPLER
  const samplerMatch = content.match(/SAMPLER\s*\n\s*([^\n]+)/);
  if (samplerMatch) {
    metadata.settings.sampler = samplerMatch[1].trim();
  }

  // Extract SCHEDULER
  const schedulerMatch = content.match(/SCHEDULER\s*\n\s*([^\n]+)/);
  if (schedulerMatch) {
    metadata.settings.scheduler = schedulerMatch[1].trim();
  }

  // Detect category from content
  const lower = content.toLowerCase();
  if (lower.includes('anime')) metadata.category = 'Anime';
  else if (lower.includes('manga')) metadata.category = 'Manga';
  else if (lower.includes('fantasy')) metadata.category = 'Dark Fantasy';
  else if (lower.includes('fotorealismo') || lower.includes('photorealistic')) metadata.category = 'Fotorealismo';
  else if (lower.includes('rpg')) metadata.category = 'RPG/Fantasy';
  else if (lower.includes('surreal')) metadata.category = 'Surrealismo';

  // Only return if we found at least a prompt or model
  if (metadata.prompt || metadata.model !== 'Desconocido') {
    return metadata;
  }

  return null;
}
