/**
 * DataLoader - Load images from split JSON structure
 */
export class DataLoader {
  constructor(dataPath = 'data/') {
    this.dataPath = dataPath;
    this.index = null;
    this.cache = new Map();
  }

  /**
   * Initialize - Load index file
   */
  async init() {
    const response = await fetch(`${this.dataPath}index.json`);
    this.index = await response.json();
    return this.index;
  }

  /**
   * Get all images (variant groups + singles)
   */
  async getAllImages() {
    if (!this.index) {
      throw new Error('DataLoader not initialized. Call init() first.');
    }

    const allImages = [];

    // Load all variant groups
    for (const group of this.index.variant_groups) {
      const variantGroup = await this.getVariantGroup(group.name);
      allImages.push(variantGroup);
    }

    // Load all singles
    for (const [category, info] of Object.entries(this.index.singles_by_category)) {
      const singles = await this.getSinglesByCategory(category);
      allImages.push(...singles);
    }

    return allImages;
  }

  /**
   * Get specific variant group
   */
  async getVariantGroup(name) {
    const cacheKey = `variant:${name}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const groupInfo = this.index.variant_groups.find(g => g.name === name);
    if (!groupInfo) {
      throw new Error(`Variant group not found: ${name}`);
    }

    const response = await fetch(`${this.dataPath}${groupInfo.file}`);
    const data = await response.json();
    
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get singles by category
   */
  async getSinglesByCategory(category) {
    const cacheKey = `singles:${category}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const categoryInfo = this.index.singles_by_category[category];
    if (!categoryInfo) {
      throw new Error(`Category not found: ${category}`);
    }

    const allSingles = [];
    
    // Load all files for this category
    for (const file of categoryInfo.files) {
      const response = await fetch(`${this.dataPath}${file}`);
      const data = await response.json();
      allSingles.push(...data);
    }
    
    this.cache.set(cacheKey, allSingles);
    return allSingles;
  }

  /**
   * Search across all images
   */
  async search(query) {
    const allImages = await this.getAllImages();
    const lowerQuery = query.toLowerCase();

    return allImages.filter(image => {
      // Search in prompt
      if (image.prompt && image.prompt.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in tags
      if (image.tags && image.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      // Search in category
      if (image.category && image.category.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in model
      if (image.model && image.model.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in variant group name
      if (image.variant_group && image.variant_group.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Get index info
   */
  getIndex() {
    return this.index;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}
