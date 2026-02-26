// Modal component - handles image detail view
export class Modal {
  constructor(images) {
    this.images = images;
    this.currentIndex = 0;
    this.modal = document.getElementById('imageModal');
    if (this.modal) {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.modal?.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Overlay click
    const overlay = this.modal?.querySelector('.modal__overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.close());
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
      if (e.key === 'ArrowLeft' && this.modal.classList.contains('active')) {
        this.prev();
      }
      if (e.key === 'ArrowRight' && this.modal.classList.contains('active')) {
        this.next();
      }
    });

    // Copy prompt button
    const copyBtn = document.getElementById('copyPrompt');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyPrompt());
    }
  }

  open(imageId) {
    if (!this.modal || !this.images) return;
    
    const index = this.images.findIndex(img => img.id === imageId);
    if (index === -1) return;

    this.currentIndex = index;
    this.render();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) {
      document.body.style.overflow = '';
      return;
    }
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.render();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.render();
  }

  render(variantIndex = 0) {
    const item = this.images[this.currentIndex];
    if (!item) return;

    const isGroup = !!item.variants && item.variants.length > 0;
    const variant = isGroup ? item.variants[variantIndex] : item;

    // Image
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
      modalImage.src = variant.url;
      modalImage.alt = item.prompt || 'AI generated image';
    }

    // Filename
    const filenameEl = document.getElementById('modalFilename');
    if (filenameEl) {
      filenameEl.textContent = variant.filename || item.filename || 'Imagen';
    }

    // Category
    const categoryEl = document.getElementById('modalCategory');
    if (categoryEl) {
      categoryEl.textContent = item.category || 'Otros';
    }

    // Achievement badge
    const achievementBadge = document.getElementById('modalAchievement');
    if (achievementBadge) {
      achievementBadge.style.display = (item.achievement || variant.achievement) ? 'inline-block' : 'none';
    }

    // Prompt
    const promptEl = document.getElementById('modalPrompt');
    if (promptEl) {
      promptEl.textContent = item.prompt || 'Sin descripción';
    }

    // Model
    const modelEl = document.getElementById('modalModel');
    if (modelEl) {
      modelEl.textContent = variant.model || item.model || 'Desconocido';
    }

    // Variants section
    this.renderVariants(item, variantIndex);

    // Tags
    this.renderTags(item.tags || []);

    // Settings
    this.renderSettings(variant.settings || item.settings || {});

    // Notes
    const notesSection = document.getElementById('modalNotesSection');
    const notesText = document.getElementById('modalNotes');
    if (notesSection && notesText) {
      const notes = variant.notes || item.notes;
      if (notes && notes.trim()) {
        notesSection.style.display = 'block';
        notesText.textContent = notes;
      } else {
        notesSection.style.display = 'none';
      }
    }

    // Date
    const dateEl = document.getElementById('modalDate');
    if (dateEl) {
      const date = new Date(item.created_at || variant.created_at);
      dateEl.textContent = 
        `Creado: ${date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`;
    }
  }

  renderVariants(item, activeIndex) {
    const container = document.getElementById('modalVariantsSection');
    const list = document.getElementById('modalVariantsList');
    
    if (!container || !list) return;

    if (!item.variants || item.variants.length <= 1) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    list.innerHTML = '';

    item.variants.forEach((variant, index) => {
      const thumb = document.createElement('div');
      thumb.className = `variant-thumb ${index === activeIndex ? 'active' : ''}`;
      
      const img = document.createElement('img');
      img.src = variant.thumbnail || variant.url;
      img.alt = `Variant ${index + 1}`;
      
      const modelLabel = document.createElement('span');
      modelLabel.className = 'variant-thumb__model';
      modelLabel.textContent = variant.model || 'Unknown';
      
      thumb.appendChild(img);
      thumb.appendChild(modelLabel);
      
      thumb.addEventListener('click', () => {
        this.render(index);
      });
      
      list.appendChild(thumb);
    });
  }

  renderSettings(settings) {
    const container = document.getElementById('modalSettings');
    container.innerHTML = '';

    // Common settings that are actually useful
    const commonSettings = ['steps', 'cfg_scale', 'sampler', 'seed', 'size', 'scheduler'];
    let hasValidSettings = false;
    
    commonSettings.forEach(key => {
      if (settings[key] !== undefined && settings[key] !== null && settings[key] !== '') {
        const item = this.createSettingItem(this.formatSettingLabel(key), settings[key]);
        container.appendChild(item);
        hasValidSettings = true;
      }
    });

    // Skip "otros" - usually contains garbage from parsing errors
    // If you want to show otros, uncomment this:
    /*
    if (settings.otros) {
      Object.entries(settings.otros).forEach(([key, value]) => {
        // Skip if key or value looks like part of a prompt (too long)
        if (key.length < 50 && value.toString().length < 100) {
          const item = this.createSettingItem(this.formatSettingLabel(key), value);
          container.appendChild(item);
          hasValidSettings = true;
        }
      });
    }
    */

    // Hide section if no valid settings
    const settingsSection = document.getElementById('modalSettingsSection');
    settingsSection.style.display = hasValidSettings ? 'block' : 'none';
  }

  createSettingItem(label, value) {
    const item = document.createElement('div');
    item.className = 'setting-item';

    const labelEl = document.createElement('span');
    labelEl.className = 'setting-item__label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'setting-item__value';
    valueEl.textContent = value;

    item.appendChild(labelEl);
    item.appendChild(valueEl);

    return item;
  }

  formatSettingLabel(key) {
    const labels = {
      'steps': 'Steps',
      'cfg_scale': 'CFG Scale',
      'sampler': 'Sampler',
      'seed': 'Seed',
      'size': 'Size'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  renderTags(tags) {
    const tagsSection = document.getElementById('modalTagsSection');
    const tagsContainer = document.getElementById('modalTags');
    
    if (!tags || tags.length === 0) {
      tagsSection.style.display = 'none';
      return;
    }

    tagsSection.style.display = 'block';
    tagsContainer.innerHTML = tags.map(tag => 
      `<span class="tag-chip" data-tag="${tag}">#${tag}</span>`
    ).join('');

    tagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tag = chip.dataset.tag;
        this.close();
        // Dispatch event for search to handle
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.value = tag;
          searchInput.dispatchEvent(new Event('input'));
        }
      });
    });
  }

  async copyPrompt() {
    const prompt = document.getElementById('modalPrompt').textContent;
    try {
      await navigator.clipboard.writeText(prompt);
      const btn = document.getElementById('copyPrompt');
      const originalText = btn.textContent;
      btn.textContent = '✓ Copiado';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}
