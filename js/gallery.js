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

    // Check if it's a variant collection
    const isVariant = !!image.variants && image.variants.length > 0;
    const initialVariant = isVariant ? image.variants[0] : image;

    const img = document.createElement('img');
    img.className = 'gallery__image';
    img.dataset.src = initialVariant.thumbnail || initialVariant.url;
    img.alt = image.prompt ? image.prompt.substring(0, 100) : 'AI generated image';
    img.loading = 'lazy';

    // Achievement badge
    const hasAchievement = image.achievement || (isVariant && image.variants.some(v => v.achievement));
    if (hasAchievement) {
      const badge = document.createElement('span');
      badge.className = 'gallery__achievement';
      badge.textContent = '⭐';
      badge.style.display = 'flex'; // Ensure it's visible if hidden in CSS
      card.appendChild(badge);
    }

    card.appendChild(img);

    // Add dots for variants
    if (isVariant && image.variants.length > 1) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'gallery__dots';
      
      image.variants.forEach((variant, index) => {
        const dot = document.createElement('span');
        dot.className = `gallery__dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.index = index;
        
        dot.addEventListener('click', (e) => {
          e.stopPropagation(); // Don't open modal when clicking dot
          this.switchVariant(card, image.variants[index], index);
        });
        
        dotsContainer.appendChild(dot);
      });
      
      card.appendChild(dotsContainer);
    }

    return card;
  }

  switchVariant(card, variant, index) {
    const img = card.querySelector('.gallery__image');
    const dots = card.querySelectorAll('.gallery__dot');
    
    // Update active dot
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Switch image with fade effect
    img.style.opacity = '0.5';
    const newSrc = variant.thumbnail || variant.url;
    
    // Preload image
    const tempImg = new Image();
    tempImg.src = newSrc;
    tempImg.onload = () => {
      img.src = newSrc;
      img.style.opacity = '1';
    };
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
