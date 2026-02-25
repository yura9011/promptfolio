# Galería de Imágenes IA - Especificación del Proyecto

**Estado**: FINALIZED  
**Versión**: 1.0  
**Fecha**: 2026-02-25

---

## Visión General

Una galería visual personal para documentar y explorar imágenes generadas por IA, mostrando el proceso creativo detrás de cada imagen (prompts, configuraciones, modelo usado) y permitiendo categorización y búsqueda.

**Mantenimiento**: Sistema diseñado para ser gestionado por agentes mediante scripts de automatización y APIs, permitiendo subida batch de imágenes con metadata.

## Objetivos

1. **Repositorio Visual**: Galería de imágenes con vista de cuadrícula responsive
2. **Documentación Creativa**: Cada imagen muestra su metadata completa (prompt, settings, modelo, logro)
3. **Organización**: Sistema de categorías para filtrar contenido
4. **Búsqueda**: Buscador básico por texto (prompt, categoría, modelo)
5. **Automatización Agent-First**: Scripts y APIs para que agentes suban imágenes en batch

## Alcance

### Incluido (MVP)
- Galería responsive con vista de cuadrícula
- Vista detallada de cada imagen con toda su metadata
- Categorías predefinidas con filtrado
- Buscador de texto simple
- **Scripts de automatización para agentes**:
  - Script de subida batch de imágenes
  - Integración con Cloudinary API
  - Actualización automática del JSON
  - Validación de metadata
- Almacenamiento en JSON local
- Hosting estático (GitHub Pages/Netlify)

### No Incluido (Futuro)
- Autenticación/usuarios múltiples
- Backend con base de datos real
- Edición manual vía UI web (solo scripts)
- Sistema de comentarios
- Compartir en redes sociales
- Analytics
- Interfaz web para agregar imágenes (no necesaria, todo vía scripts)

## Stack Tecnológico

### Frontend
- **HTML5/CSS3**: Estructura y estilos
- **JavaScript Vanilla**: Lógica de aplicación
- **Alpine.js** (opcional): Reactividad ligera para UI
- Sin build process - archivos estáticos directos

### Almacenamiento
- **Imágenes**: Cloudinary (10GB gratis) con API programática
  - Upload via Cloudinary API (Node.js SDK)
  - Transformaciones automáticas (thumbnails, optimización)
- **Metadata**: Archivo JSON local (`data/images.json`)
  - Actualizado automáticamente por scripts
  - Versionado en Git

### Automatización
- **Node.js Scripts**: Para operaciones batch
- **Cloudinary SDK**: Upload y gestión de imágenes
- **Playwright** (opcional): Para scraping de metadata si es necesario

### Hosting
- **GitHub Pages** o **Netlify** (gratis, SSL incluido)

## Estructura de Datos

### Imagen (JSON Schema)

```json
{
  "id": "unique-id-timestamp",
  "url": "https://cloudinary.com/...",
  "thumbnail": "https://cloudinary.com/.../thumb",
  "prompt": "Texto completo del prompt usado",
  "settings": {
    "steps": 30,
    "cfg_scale": 7.5,
    "sampler": "DPM++ 2M Karras",
    "size": "1024x1024",
    "seed": 123456789,
    "otros": "campos flexibles según modelo"
  },
  "model": "Stable Diffusion XL",
  "category": "Fotorealismo",
  "achievement": true,
  "notes": "Notas adicionales opcionales",
  "created_at": "2026-02-25T10:30:00Z"
}
```

### Categorías Predefinidas
- Anime
- Manga
- Dark Fantasy
- Fotorealismo
- RPG/Fantasy
- Surrealismo
- Otros

## Funcionalidades Detalladas

### 1. Galería Principal
- Vista de cuadrícula responsive (3-4 columnas en desktop, 1-2 en mobile)
- Lazy loading de imágenes
- Hover effect mostrando título/categoría
- Click abre vista detallada

### 2. Vista Detallada
- Modal o página dedicada
- Imagen en tamaño completo
- Metadata organizada en secciones:
  - **Prompt**: Texto completo, copiable
  - **Settings**: Lista de configuraciones
  - **Modelo**: Nombre del modelo usado
  - **Logro**: Badge visual (⭐ si es logro)
  - **Categoría**: Tag visual
  - **Fecha**: Timestamp de creación
- Botón "Cerrar" o navegación back

### 3. Filtros y Búsqueda
- **Barra de búsqueda**: Busca en prompt, modelo, notas
- **Filtro por categoría**: Botones o dropdown
- **Filtro por logro**: Toggle "Solo logros"
- Resultados actualizan en tiempo real

### 4. Scripts de Automatización

#### Script: `upload-images.js`
Sube imágenes en batch a Cloudinary y actualiza el JSON.

**Input**: Carpeta con imágenes + archivos .txt con metadata
```bash
node scripts/upload-images.js ./new-images
```

**Estructura de carpeta** (súper simple):
```
/new-images/
├── dragon001.png
├── dragon001.txt          # Metadata de dragon001.png
├── cyberpunk-city.jpg
├── cyberpunk-city.txt     # Metadata de cyberpunk-city.jpg
└── portrait.png           # Sin .txt = usa defaults
```

**Formato del .txt** (flexible, formato libre):
```txt
Prompt: A majestic dragon flying over mountains at sunset
Model: Stable Diffusion XL
Category: Dark Fantasy
Achievement: yes
Steps: 30
CFG Scale: 7.5
Sampler: DPM++ 2M Karras
Seed: 123456789
Notes: Primera vez que logro las alas correctamente
```

O simplemente texto libre (el script intenta parsearlo):
```txt
Stable Diffusion XL
Dark Fantasy
A majestic dragon flying over mountains
Achievement
```

**Proceso**:
1. Escanea carpeta buscando imágenes (.png, .jpg, .jpeg, .webp)
2. Para cada imagen:
   - Calcula hash MD5 para detectar duplicados
   - Si es duplicado, pregunta: actualizar metadata o skip
   - Copia original a `/backup` (seguridad)
   - Comprime si >2MB (WebP, 85% quality)
3. Busca archivo .txt con el mismo nombre
4. Parsea el .txt extrayendo metadata (formato flexible)
5. Sube imagen a Cloudinary via API
6. Genera thumbnails automáticamente (Cloudinary transformations)
7. Actualiza `data/images.json` con nueva entrada
8. Muestra resumen: imágenes subidas, duplicados, uso de Cloudinary
9. Opcionalmente hace commit automático a Git

**Campos reconocidos** (case-insensitive):
- `prompt` o `description`: Texto del prompt
- `model`: Modelo usado
- `category`: Categoría (Anime, Manga, Dark Fantasy, Fotorealismo, RPG/Fantasy, Surrealismo, Otros)
- `achievement` o `logro`: yes/no/true/false
- `steps`, `cfg_scale`, `sampler`, `seed`, `size`: Settings técnicos
- `notes` o `notas`: Notas adicionales
- Cualquier otro campo se guarda en `settings.otros`

**Defaults si falta metadata**:
- category: "Otros"
- achievement: false
- prompt: "Sin descripción"
- model: "Desconocido"

#### Script: `validate-data.js`
Valida integridad del JSON y URLs de Cloudinary.

```bash
node scripts/validate-data.js
```

#### Script: `generate-thumbnails.js`
Regenera thumbnails de imágenes existentes.

```bash
node scripts/generate-thumbnails.js
```

## Arquitectura de Archivos

```
/
├── index.html              # Página principal (galería)
├── detail.html             # Vista detallada (opcional, puede ser modal)
├── css/
│   ├── main.css           # Estilos principales
│   └── responsive.css     # Media queries
├── js/
│   ├── app.js             # Lógica principal
│   ├── gallery.js         # Gestión de galería
│   └── search.js          # Búsqueda y filtros
├── data/
│   └── images.json        # Base de datos de imágenes
├── scripts/               # Scripts de automatización para agentes
│   ├── upload-images.js   # Subida batch a Cloudinary
│   ├── validate-data.js   # Validación de integridad
│   ├── generate-thumbnails.js  # Regenerar thumbnails
│   └── utils/
│       ├── cloudinary.js  # Helpers de Cloudinary API
│       ├── json-manager.js # Gestión del JSON
│       ├── image-hash.js  # Detección de duplicados
│       └── compressor.js  # Compresión de imágenes
├── backup/                # Backup local de imágenes originales (no en Git)
├── .env.example           # Template de variables de entorno
├── .gitignore
├── package.json           # Dependencias Node.js
└── README.md              # Documentación de uso y scripts
```

## Fases de Implementación

### Fase 1: Scripts de Automatización
- Setup del proyecto Node.js (package.json, dependencias)
- Utilidades base:
  - Detección de duplicados por hash
  - Compresión automática de imágenes
  - Backup automático
  - Parser flexible de .txt
- Script de subida a Cloudinary con todas las features
- Gestión automática del JSON
- Script de validación
- Documentación de uso para agentes

### Fase 2: Estructura Base Frontend
- HTML estructura de galería
- CSS básico y responsive
- Carga de datos desde JSON
- Vista detallada de imágenes

### Fase 3: Funcionalidad Core
- Sistema de filtros por categoría
- Buscador de texto
- Lazy loading de imágenes
- Optimizaciones de performance

### Fase 4: Polish y Deploy
- Estilos finales y animaciones
- Deploy a GitHub Pages/Netlify
- Documentación completa
- Testing end-to-end

## Criterios de Éxito

### Fase 1 (Scripts)
- [ ] Script detecta duplicados correctamente por hash
- [ ] Script comprime imágenes >2MB automáticamente
- [ ] Script crea backup de originales en `/backup`
- [ ] Script parsea .txt con formato flexible
- [ ] Script sube imágenes a Cloudinary correctamente
- [ ] Script actualiza `images.json` automáticamente
- [ ] Script muestra resumen de uso de Cloudinary
- [ ] Validación detecta errores en metadata

### Fase 2-4 (Frontend)
- [ ] Galería muestra todas las imágenes del JSON correctamente
- [ ] Vista detallada muestra toda la metadata
- [ ] Filtros por categoría funcionan
- [ ] Búsqueda encuentra imágenes por texto
- [ ] Orden de imágenes configurable (fecha, alfabético)
- [ ] Lazy loading de imágenes funciona
- [ ] Responsive en mobile y desktop
- [ ] Deploy funcional y accesible públicamente
- [ ] Documentación clara para que agentes usen los scripts

## Decisiones Técnicas Pendientes

1. ¿Usar Alpine.js o JavaScript vanilla puro para el frontend?
2. ¿Modal o página separada para vista detallada?
3. ¿Auto-commit a Git desde el script o manual?
4. ¿Mover imágenes procesadas a carpeta `/processed` o dejarlas?

## Puntos Ciegos y Consideraciones

### ✅ Resueltos en el Diseño

#### 1. Duplicados
- **Problema**: Subir la misma imagen dos veces
- **Solución implementada**: El script calculará hash MD5 de cada imagen y verificará contra `images.json` antes de subir
- **Comportamiento**: Si detecta duplicado, pregunta si quieres actualizar metadata o skip

#### 2. Formato de Settings Flexible
- **Problema**: Cada modelo tiene settings diferentes
- **Solución implementada**: Campo `settings` es objeto JSON flexible que acepta cualquier key-value
- **Comportamiento**: El parser del .txt guarda todo lo que no reconoce en `settings.otros`

#### 3. Compresión Automática
- **Problema**: Límites de Cloudinary (10GB gratis)
- **Solución implementada**: El script comprime imágenes >2MB automáticamente antes de subir
- **Comportamiento**: Mantiene calidad visual pero reduce tamaño (WebP format, 85% quality)

#### 4. Backup Automático
- **Problema**: Si Cloudinary falla, pierdes las imágenes
- **Solución implementada**: El script copia imágenes originales a `/backup` antes de procesar
- **Comportamiento**: Carpeta `/backup` se mantiene local (no se sube a Git por .gitignore)

#### 5. Orden de Imágenes
- **Problema**: ¿Cómo se ordenan en la galería?
- **Solución implementada**: Por defecto por fecha descendente (más recientes primero)
- **Comportamiento**: Frontend permite cambiar orden (fecha, alfabético, categoría)

### ⚠️ Para Estar Atentos (Futuro)

#### 6. Edición de Metadata Existente
- **Problema**: Cambiar prompt de imagen ya subida
- **Solución temporal**: Editar `data/images.json` manualmente
- **Futuro**: Script `update-metadata.js` o UI web de edición (Fase 5)

#### 7. Límites de Cloudinary
- **Problema**: Plan gratuito tiene límites (10GB, 25 créditos/mes)
- **Monitoreo**: El script muestra uso actual de Cloudinary después de cada upload
- **Futuro**: Si alcanzas límite, migrar a alternativa (ImgBB, GitHub LFS, o self-hosted)

#### 8. Performance con Muchas Imágenes (1000+)
- **Problema**: Cargar todo el JSON puede ser lento
- **Solución temporal**: Lazy loading de imágenes en frontend (Fase 3)
- **Futuro**: Paginación del JSON o migrar a base de datos real (Fase 5)

#### 9. Imágenes Privadas
- **Problema**: ¿Algunas imágenes privadas?
- **Solución temporal**: Todas públicas por ahora
- **Futuro**: Campo `private: true` en metadata + autenticación (Fase 5)

## Notas

- Proyecto personal, prioridad en simplicidad sobre escalabilidad
- Sin autenticación necesaria inicialmente
- **Mantenimiento 100% automatizado vía scripts** - sin UI de administración
- Agentes pueden ejecutar scripts con Playwright o directamente con Node.js
- Posibilidad de migrar a backend real en el futuro si crece
- Cloudinary API key debe estar en `.env` (no commitear)

---

**Próximo Paso**: Revisar y finalizar especificación → `/map` para analizar estructura → `/plan 1` para primera fase
