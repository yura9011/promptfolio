// Main application entry point
import { Gallery } from './gallery.js';
import { Modal } from './modal.js';
import { Search } from './search.js';

class App {
  constructor() {
    this.gallery = null;
    this.modal = null;
    this.search = null;
    this.images = [];
  }

  async init() {
    try {
      // Load images data
      this.images = await this.loadImages();

      // Initialize components
      this.gallery = new Gallery(this.images);
      this.modal = new Modal(this.images);
      this.search = new Search(this.images, this.gallery);

      // Render initial gallery and tags
      this.search.renderPopularTags();
      this.gallery.render();

      // Setup event listeners
      this.setupEventListeners();

      // Hide loading state
      document.getElementById('loadingState').style.display = 'none';

    } catch (error) {
      console.error('Error initializing app:', error);
      this.showError('Error al cargar las imágenes. Por favor, recarga la página.');
    }
  }

  async loadImages() {
    const response = await fetch('data/images.json');
    if (!response.ok) {
      throw new Error('Failed to load images');
    }
    const data = await response.json();
    return data;
  }

  setupEventListeners() {
    // Gallery card clicks
    document.getElementById('galleryGrid').addEventListener('click', (e) => {
      // Handle Like button clicks
      const heartBtn = e.target.closest('.gallery__card-heart');
      if (heartBtn) {
        const card = heartBtn.closest('.gallery__card');
        if (card) {
          const imageId = card.dataset.imageId;
          this.toggleLike(imageId, heartBtn);
        }
        return; // Important: do not open modal
      }

      // Handle Image clicks
      const card = e.target.closest('.gallery__card');
      if (card && !e.target.classList.contains('gallery__dot')) {
        const imageId = card.dataset.imageId;
        this.modal.open(imageId);
      }
    });

    // Top Navigation UI
    const menuToggle = document.getElementById('menuToggle');
    const closeDrawer = document.getElementById('closeDrawer');
    const tagDrawer = document.getElementById('tagDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');

    const toggleDrawer = () => {
      tagDrawer.classList.toggle('open');
      drawerOverlay.classList.toggle('open');
    };

    menuToggle.addEventListener('click', toggleDrawer);
    closeDrawer.addEventListener('click', toggleDrawer);
    drawerOverlay.addEventListener('click', toggleDrawer);

    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      this.search.handleSearch(e.target.value);
    });

    // Shuffle
    const shuffleBtn = document.getElementById('shuffleBtn');
    shuffleBtn.addEventListener('click', () => {
      this.search.shuffleCurrent();
    });

    // View Toggle (Grid / Details)
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    const galleryGrid = document.getElementById('galleryGrid');
    const viewIconGrid = document.getElementById('viewIconGrid');
    const viewIconDetails = document.getElementById('viewIconDetails');

    viewToggleBtn.addEventListener('click', () => {
      galleryGrid.classList.toggle('gallery__grid--detailed');
      if (galleryGrid.classList.contains('gallery__grid--detailed')) {
        viewIconGrid.style.display = 'none';
        viewIconDetails.style.display = 'block';
      } else {
        viewIconGrid.style.display = 'block';
        viewIconDetails.style.display = 'none';
      }
    });

    // Likes Filter
    const likesBtn = document.getElementById('likesBtn');
    likesBtn.addEventListener('click', () => {
      likesBtn.classList.toggle('active');
      const showLikesOnly = likesBtn.classList.contains('active');
      this.search.handleLikesFilter(showLikesOnly, this.getLikedImageIds());
    });
  }

  getLikedImageIds() {
    try {
      const likes = localStorage.getItem('promptfolio_likes');
      return likes ? JSON.parse(likes) : [];
    } catch {
      return [];
    }
  }

  toggleLike(imageId, btn) {
    let likes = this.getLikedImageIds();
    const isLiked = likes.includes(imageId);

    if (isLiked) {
      likes = likes.filter(id => id !== imageId);
      btn.classList.remove('liked');
    } else {
      likes.push(imageId);
      btn.classList.add('liked');
    }

    localStorage.setItem('promptfolio_likes', JSON.stringify(likes));
  }

  showError(message) {
    const loadingState = document.getElementById('loadingState');
    loadingState.innerHTML = `
      <p style="color: var(--color-accent);">${message}</p>
    `;
  }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/promptfolio/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
