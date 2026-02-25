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
      
      // Render initial gallery
      this.gallery.render();
      
      // Render popular tags
      this.search.renderPopularTags();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Hide loading state
      document.getElementById('loadingState').style.display = 'none';
      
    } catch (error) {
      console.error('Error initializing app:', error);
      // Make sure scroll is enabled even on error
      document.body.style.overflow = '';
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
      const card = e.target.closest('.gallery__card');
      if (card) {
        const imageId = card.dataset.imageId;
        this.modal.open(imageId);
      }
    });

    // Search toggle button
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('searchContainer');
    if (searchToggle && searchContainer) {
      searchToggle.addEventListener('click', () => {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
          const searchInput = document.getElementById('searchInput');
          if (searchInput) searchInput.focus();
        }
      });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.search.handleSearch(e.target.value);
      });
    }
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
