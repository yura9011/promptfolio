export class Search {
  constructor(images, gallery) {
    this.allImages = images;
    this.gallery = gallery;
    this.filters = {
      search: '',
      category: 'all',
      achievementsOnly: false,
      sort: 'date-desc',
      activeTag: null
    };
    this.debounceTimer = null;
    this.tagsContainer = document.getElementById('popularTags');
    this.searchInput = document.getElementById('searchInput');
  }

  handleSearch(query) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filters.search = query.toLowerCase().trim();
      this.applyFilters();
    }, 300);
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

  handleTagClick(tag) {
    if (this.filters.activeTag === tag) {
      this.filters.activeTag = null;
    } else {
      this.filters.activeTag = tag;
    }
    this.applyFilters();
    this.updateTagStyles();
  }

  updateTagStyles() {
    if (!this.tagsContainer) return;
    const chips = this.tagsContainer.querySelectorAll('.tag-chip');
    chips.forEach(chip => {
      if (chip.dataset.tag === this.filters.activeTag) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allImages];

    if (this.filters.search || this.filters.activeTag) {
      const searchText = this.filters.search.toLowerCase();
      
      filtered = filtered.filter(img => {
        const tagsMatch = img.tags && img.tags.some(tag => 
          tag.toLowerCase().includes(searchText)
        );
        
        const promptMatch = img.prompt && 
          img.prompt.toLowerCase().includes(searchText);
        
        const modelMatch = img.model && 
          img.model.toLowerCase().includes(searchText);
        
        const categoryMatch = img.category && 
          img.category.toLowerCase().includes(searchText);
        
        const tagFilterMatch = this.filters.activeTag ? 
          (img.tags && img.tags.some(tag => 
            tag.toLowerCase() === this.filters.activeTag.toLowerCase()
          )) : true;

        return (tagsMatch || promptMatch || modelMatch || categoryMatch) && tagFilterMatch;
      });
    }

    if (this.filters.category !== 'all') {
      filtered = filtered.filter(img => img.category === this.filters.category);
    }

    if (this.filters.achievementsOnly) {
      filtered = filtered.filter(img => img.achievement === true);
    }

    filtered = this.sortImages(filtered, this.filters.sort);

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

  renderPopularTags() {
    if (!this.tagsContainer) return;
    
    const tagCounts = {};
    this.allImages.forEach(image => {
      if (image.tags) {
        image.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);

    this.popularTags = sortedTags;

    this.tagsContainer.innerHTML = sortedTags.map(tag => 
      `<span class="tag-chip" data-tag="${tag}">#${tag}</span>`
    ).join('');

    this.tagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.handleTagClick(chip.dataset.tag);
      });
    });
  }

  updateImages(images) {
    this.allImages = images;
    this.renderPopularTags();
  }
}
