# Fase 2: Estructura Base Frontend - Plan de Implementación

**Fecha**: 2026-02-25  
**Objetivo**: Crear galería visual funcional con HTML/CSS/JS

---

<plan>
  <goal>
    Crear una galería web responsive que muestre las imágenes del JSON con vista detallada,
    usando HTML/CSS/JS vanilla sin frameworks pesados.
  </goal>
  
  <prerequisites>
    <item>Fase 1 completada (scripts funcionando)</item>
    <item>data/images.json con estructura definida</item>
  </prerequisites>
  
  <tasks>
    <task id="1">
      <description>Crear estructura HTML de la galería principal</description>
      <files>
        - index.html
      </files>
      <changes>
        - HTML5 semántico con estructura clara
        - Header con título y barra de búsqueda
        - Sección de filtros por categoría
        - Grid container para las imágenes
        - Modal para vista detallada
        - Footer con info del proyecto
        - Meta tags para SEO y responsive
      </changes>
      <verification>
        - HTML válido (sin errores de sintaxis)
        - Estructura semántica correcta
        - Responsive meta tags presentes
      </verification>
    </task>
    
    <task id="2">
      <description>Crear estilos CSS responsive</description>
      <files>
        - css/main.css
        - css/responsive.css
      </files>
      <changes>
        - Variables CSS para colores y espaciados
        - Estilos del header y navegación
        - Grid layout responsive (3-4 cols desktop, 1-2 mobile)
        - Estilos de cards de imágenes con hover effects
        - Modal de vista detallada con overlay
        - Estilos de filtros y búsqueda
        - Badges para categorías y logros
        - Media queries para mobile/tablet/desktop
      </changes>
      <verification>
        - Responsive en diferentes tamaños de pantalla
        - Hover effects funcionan
        - Modal se ve correctamente
        - Colores y tipografía consistentes
      </verification>
    </task>
    
    <task id="3">
      <description>Implementar JavaScript para cargar y mostrar imágenes</description>
      <files>
        - js/app.js
        - js/gallery.js
      </files>
      <changes>
        - app.js: Inicialización y coordinación
        - gallery.js:
          * Función loadImages() para cargar JSON
          * Función renderGallery() para crear cards
          * Función showImageDetail() para modal
          * Event listeners para clicks en imágenes
          * Lazy loading de imágenes
          * Manejo de errores (JSON no encontrado, etc.)
      </changes>
      <verification>
        - Imágenes se cargan desde JSON correctamente
        - Click en imagen abre modal con detalles
        - Lazy loading funciona
        - Manejo de errores muestra mensajes claros
      </verification>
    </task>
    
    <task id="4">
      <description>Implementar vista detallada (modal)</description>
      <files>
        - js/modal.js
      </files>
      <changes>
        - Función openModal() con datos de imagen
        - Renderizar toda la metadata:
          * Imagen en tamaño completo
          * Prompt (copiable al click)
          * Settings organizados
          * Modelo y categoría
          * Badge de logro si aplica
          * Fecha de creación
        - Función closeModal() con ESC y click fuera
        - Navegación entre imágenes (prev/next)
        - Animaciones suaves de entrada/salida
      </changes>
      <verification>
        - Modal muestra toda la metadata correctamente
        - Cerrar con ESC, click fuera, o botón X
        - Navegación prev/next funciona
        - Animaciones suaves
      </verification>
    </task>
  </tasks>
  
  <success_criteria>
    <criterion>Galería muestra todas las imágenes del JSON en grid responsive</criterion>
    <criterion>Click en imagen abre modal con vista detallada</criterion>
    <criterion>Modal muestra toda la metadata correctamente</criterion>
    <criterion>Responsive funciona en mobile, tablet y desktop</criterion>
    <criterion>Lazy loading mejora performance</criterion>
    <criterion>Diseño visual atractivo y profesional</criterion>
    <criterion>Sin errores en consola del navegador</criterion>
  </success_criteria>
</plan>

---

## Orden de Ejecución

**Wave 1** (estructura base):
- Task 1: HTML estructura
- Task 2: CSS estilos

**Wave 2** (funcionalidad):
- Task 3: JavaScript galería
- Task 4: Modal vista detallada

---

## Notas de Diseño

### Paleta de Colores
- Primary: #6366f1 (indigo)
- Secondary: #8b5cf6 (purple)
- Background: #0f172a (dark blue)
- Surface: #1e293b (lighter dark)
- Text: #f1f5f9 (light gray)
- Accent: #f59e0b (amber)

### Tipografía
- Headings: 'Inter', sans-serif
- Body: 'Inter', sans-serif
- Monospace (code): 'Fira Code', monospace

### Grid Layout
- Desktop (>1024px): 4 columnas
- Tablet (768-1024px): 3 columnas
- Mobile (480-768px): 2 columnas
- Small mobile (<480px): 1 columna

### Animaciones
- Hover: scale(1.05) + shadow
- Modal: fade in + slide up
- Lazy load: fade in cuando aparece
