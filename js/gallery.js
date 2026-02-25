// Gallery component - handles rendering of image grid
export class Gallery {
  constructor(images) {
    this.allImages = images;
    this.filteredImages = images;
    this.container = document.getElementById('galleryGrid');
    this.emptyState = document.getElementById('emptyState');
  }

  render(images = this.filteredImages) {
    this.filteredImages = images;
    this.container.innerHTML = '';

    if (images.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();

    images.forEach(image => {
      const card = this.createCard(image);
      this.container.appendChild(card);
    });

    // Setup lazy loading
    this.setupLazyLoading();
  }

  createCard(image) {
    const card = document.createElement('div');
    card.className = 'gallery__card';
    card.dataset.imageId = image.id;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'gallery__image-container';

    const img = document.createElement('img');
    img.className = 'gallery__image';
    img.dataset.src = image.thumbnail || image.url;
    img.alt = image.prompt || 'AI generated image';
    img.loading = 'lazy';

    // Achievement badge
    if (image.achievement) {
      const badge = document.createElement('span');
      badge.className = 'gallery__achievement';
      badge.textContent = '⭐';
      imageContainer.appendChild(badge);
    }

    imageContainer.appendChild(img);

    const info = document.createElement('div');
    info.className = 'gallery__info';

    const category = document.createElement('span');
    category.className = 'gallery__category';
    category.textContent = image.category || 'Otros';

    const prompt = document.createElement('p');
    prompt.className = 'gallery__prompt';
    prompt.textContent = image.prompt || 'Sin descripción';

    const model = document.createElement('p');
    model.className = 'gallery__model';
    model.textContent = image.model || 'Desconocido';

    info.appendChild(category);
    info.appendChild(prompt);
    info.appendChild(model);

    card.appendChild(imageContainer);
    card.appendChild(info);

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
          
          // Fade in animation
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
