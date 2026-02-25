// Search and filter component
export class Search {
  constructor(images, gallery) {
    this.allImages = images;
    this.gallery = gallery;
    this.filters = {
      search: '',
      category: 'all',
      achievementsOnly: false,
      sort: 'date-desc'
    };
  }

  handleSearch(query) {
    this.filters.search = query.toLowerCase();
    this.applyFilters();
  }

  handleCategoryFilter(category) {
    this.filters.category = category;
    this.applyFilters();
  }

  handleAchievementsFilter(enabled) {
    this.filters.achievementsOnly = enabled;
    this.applyFilters();
  }

  handleSort(sortOrder) {
    this.filters.sort = sortOrder;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allImages];

    // Search filter
    if (this.filters.search) {
      filtered = filtered.filter(img => {
        const searchText = [
          img.prompt,
          img.model,
          img.category,
          img.notes,
          img.filename
        ].join(' ').toLowerCase();
        
        return searchText.includes(this.filters.search);
      });
    }

    // Category filter
    if (this.filters.category !== 'all') {
      filtered = filtered.filter(img => img.category === this.filters.category);
    }

    // Achievements filter
    if (this.filters.achievementsOnly) {
      filtered = filtered.filter(img => img.achievement === true);
    }

    // Sort
    filtered = this.sortImages(filtered, this.filters.sort);

    // Render
    this.gallery.render(filtered);
  }

  sortImages(images, sortOrder) {
    const sorted = [...images];

    switch (sortOrder) {
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'alpha':
        sorted.sort((a, b) => {
          const nameA = (a.filename || a.prompt || '').toLowerCase();
          const nameB = (b.filename || b.prompt || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
    }

    return sorted;
  }
}
