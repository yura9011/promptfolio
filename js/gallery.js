// Gallery component - handles rendering of image grid with infinite scroll
export class Gallery {
  constructor(images) {
    this.allImages = images;
    this.filteredImages = images;
    this.container = document.getElementById('galleryGrid');
    this.emptyState = document.getElementById('emptyState');
    this.loadedCount = 0;
    this.batchSize = 20;
    this.isLoading = false;
    this.observer = null;
    this.sentinel = null;
  }

  render(images = this.filteredImages) {
    this.filteredImages = images;
    this.container.innerHTML = '';
    this.loadedCount = 0;

    if (images.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();

    // Load first batch
    this.loadMoreImages();

    // Setup infinite scroll
    this.setupInfiniteScroll();
  }

  loadMoreImages() {
    if (this.isLoading || this.loadedCount >= this.filteredImages.length) {
      return;
    }

    this.isLoading = true;

    const nextBatch = this.filteredImages.slice(
      this.loadedCount,
      this.loadedCount + this.batchSize
    );

    nextBatch.forEach(image => {
      const card = this.createCard(image);
      this.container.appendChild(card);
    });

    this.loadedCount += nextBatch.length;

    // Remove old sentinel if exists
    if (this.sentinel && this.sentinel.parentNode) {
      this.sentinel.parentNode.removeChild(this.sentinel);
    }

    // Add sentinel at the end if there are more images
    if (this.loadedCount < this.filteredImages.length) {
      this.sentinel = document.createElement('div');
      this.sentinel.className = 'gallery__sentinel';
      this.sentinel.style.height = '1px';
      this.container.appendChild(this.sentinel);
      
      // Observe the new sentinel
      if (this.observer) {
        this.observer.observe(this.sentinel);
      }
    }

    this.isLoading = false;

    // Setup lazy loading for new images
    this.setupLazyLoading();
  }

  setupInfiniteScroll() {
    // Disconnect previous observer if exists
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading) {
          this.loadMoreImages();
        }
      });
    }, {
      rootMargin: '200px'
    });

    if (this.sentinel) {
      this.observer.observe(this.sentinel);
    }
  }

  createCard(image) {
    const card = document.createElement('div');
    card.className = 'gallery__card';
    card.dataset.imageId = image.id;

    const img = document.createElement('img');
    img.className = 'gallery__image';
    img.dataset.src = image.thumbnail || image.url;
    img.alt = image.prompt ? image.prompt.substring(0, 100) : 'AI generated image';
    img.loading = 'lazy';

    // Achievement badge
    if (image.achievement) {
      card.innerHTML = '<span class="gallery__achievement">⭐</span>';
    }

    card.appendChild(img);

    return card;
  }

  setupLazyLoading() {
    const images = this.container.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
          
          img.style.opacity = '0';
          img.onload = () => {
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '1';
          };
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  showEmptyState() {
    this.emptyState.style.display = 'block';
  }

  hideEmptyState() {
    this.emptyState.style.display = 'none';
  }

  getFilteredImages() {
    return this.filteredImages;
  }
}
