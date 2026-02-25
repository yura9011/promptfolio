// Modal component - handles image detail view
export class Modal {
  constructor(images) {
    this.images = images;
    this.currentIndex = 0;
    this.modal = document.getElementById('imageModal');
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Overlay click
    const overlay = this.modal.querySelector('.modal__overlay');
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
    const index = this.images.findIndex(img => img.id === imageId);
    if (index === -1) return;

    this.currentIndex = index;
    this.render();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
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

  render() {
    const image = this.images[this.currentIndex];

    // Image
    document.getElementById('modalImage').src = image.url;
    document.getElementById('modalImage').alt = image.prompt || 'AI generated image';

    // Filename
    document.getElementById('modalFilename').textContent = image.filename || 'Imagen';

    // Category
    document.getElementById('modalCategory').textContent = image.category || 'Otros';

    // Achievement badge
    const achievementBadge = document.getElementById('modalAchievement');
    achievementBadge.style.display = image.achievement ? 'inline-block' : 'none';

    // Prompt
    document.getElementById('modalPrompt').textContent = image.prompt || 'Sin descripción';

    // Model
    document.getElementById('modalModel').textContent = image.model || 'Desconocido';

    // Tags
    this.renderTags(image.tags || []);

    // Settings
    this.renderSettings(image.settings || {});

    // Notes
    const notesSection = document.getElementById('modalNotesSection');
    const notesText = document.getElementById('modalNotes');
    if (image.notes && image.notes.trim()) {
      notesSection.style.display = 'block';
      notesText.textContent = image.notes;
    } else {
      notesSection.style.display = 'none';
    }

    // Date
    const date = new Date(image.created_at);
    document.getElementById('modalDate').textContent = 
      `Creado: ${date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
  }

  renderSettings(settings) {
    const container = document.getElementById('modalSettings');
    container.innerHTML = '';

    // Common settings
    const commonSettings = ['steps', 'cfg_scale', 'sampler', 'seed', 'size'];
    
    commonSettings.forEach(key => {
      if (settings[key] !== undefined) {
        const item = this.createSettingItem(this.formatSettingLabel(key), settings[key]);
        container.appendChild(item);
      }
    });

    // Other settings
    if (settings.otros) {
      Object.entries(settings.otros).forEach(([key, value]) => {
        const item = this.createSettingItem(this.formatSettingLabel(key), value);
        container.appendChild(item);
      });
    }

    // Hide section if no settings
    const settingsSection = document.getElementById('modalSettingsSection');
    settingsSection.style.display = container.children.length > 0 ? 'block' : 'none';
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
