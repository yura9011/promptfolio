# Milestone: Top Navigation Bar & UI Controls

## Objetivo
Implementar una barra de navegación superior (Top Nav) limpia y funcional que centralice los controles principales de la galería, inspirada en UI de aplicaciones modernas (como "Prompt & Circumstance").

## UI Layout (De izquierda a derecha)
1. **[ ☰ ] Menú Hamburguesa**: Para abrir un panel lateral (Drawer) con selección de tags y filtros por categoría/tipo de imagen.
2. **[ Promptfolio ] Título**: Nombre de nuestra galería, estilizado elegantemente.
3. **[ ⓘ ] Botón de Información**: Abre un modal/tooltip explicando qué es la galería.
4. **[ 🔍 Buscar ] Caja de Búsqueda**: Integrada en la barra, reemplazando el botón flotante actual.
5. **[ 🔀 ] Botón Aleatorio (Shuffle)**: Recarga la galería mostrando imágenes en orden aleatorio.
6. **[ ▦ / 🖼️ ] Toggle de Vista**: Alternar entre "Modo Grid" (grilla actual) y "Modo Detalle" (imágenes más grandes con info visible).
7. **[ ♡ ] Botón de Favoritos**: Mostrar solo las imágenes marcadas con "Me Gusta".

## Tareas

### Fase 1: Estructura HTML y Diseño CSS (Top Bar)
- [ ] Crear el contenedor `<header class="top-nav">` fijo en la parte superior.
- [ ] Implementar los iconos (SVG preferiblemente) para Menú, Info, Shuffle, Vista y Favoritos.
- [ ] Mover la lógica y el input de búsqueda actual dentro de la nueva barra de navegación.
- [ ] Diseñar con CSS moderno (flexbox, aspecto *glassmorphism* o fondo oscuro semitransparente, sticky al hacer scroll).

### Fase 2: Implementación de Menú Lateral (Drawer de Tags)
- [ ] Crear un componente visual `<aside id="tagDrawer">` oculto por defecto.
- [ ] Conectar el Menú Hamburguesa para abrir/cerrar este Drawer.
- [ ] Migrar la visualización de "Tags Populares" dentro de este Drawer.
- [ ] Permitir filtrar imágenes directamente desde este Drawer.

### Fase 3: Modos de Vista y Aleatorio
- [ ] Implementar la función de Shuffle (mezclar el array de imágenes renderizadas).
- [ ] Implementar el "Modo Detalle" mediante una clase CSS en el contenedor de la galería (ej. `.gallery__grid--detailed`) que cambie el layout de CSS Grid.

### Fase 4: Favoritos (Likes)
- [ ] Agregar un botón de corazón oculto o visible (hover) en cada tarjeta de imagen en la galería.
- [ ] Guardar los IDs de imágenes favoritas en `localStorage`.
- [ ] Hacer que el Botón del Corazón en la Top Nav filtre la galería para mostrar solo los favoritos guardados.

## Criterios de Éxito
- ✅ La barra superior se mantiene fija y accesible en todo momento.
- ✅ Todos los botones tienen interacciones (hover states, active states).
- ✅ El toggle de vistas cambia el diseño de forma fluida.
- ✅ Los "Me gusta" persisten al recargar la página (vía localStorage).
- ✅ Diseño 100% responsivo (se adapta bien en móviles, ocultando texto o moviendo la búsqueda si es necesario).

## Dependencias
- Requiere integrar parte del `MILESTONE-TAGS.md` para poblar el Drawer de Tags.
- Iconografía (lucide-icons, heroicons o SVGs inline).
