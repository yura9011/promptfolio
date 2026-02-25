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
      const card = e.target.closest('.gallery__card');
      if (card) {
        const imageId = card.dataset.imageId;
        this.modal.open(imageId);
      }
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      this.search.handleSearch(e.target.value);
    });

    // Category filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.search.handleCategoryFilter(e.target.dataset.category);
      });
    });

    // Achievements only checkbox
    const achievementsCheckbox = document.getElementById('achievementsOnly');
    achievementsCheckbox.addEventListener('change', (e) => {
      this.search.handleAchievementsFilter(e.target.checked);
    });

    // Sort order
    const sortSelect = document.getElementById('sortOrder');
    sortSelect.addEventListener('change', (e) => {
      this.search.handleSort(e.target.value);
    });
  }

  showError(message) {
    const loadingState = document.getElementById('loadingState');
    loadingState.innerHTML = `
      <p style="color: var(--color-accent);">${message}</p>
    `;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
