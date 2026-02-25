/**
 * Parse metadata from a .txt file
 * Supports flexible formats: key:value, key=value, or free text
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
  // Find the longest line as likely prompt
  const longestLine = lines.reduce((longest, line) => 
    line.length > longest.length ? line : longest, '');
  
  return longestLine || 'Sin descripción';
}
