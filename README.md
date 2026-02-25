# Promptfolio

Galería minimalista para documentar imágenes generadas por IA con sus prompts completos y metadata técnica.

**Demo**: https://yura9011.github.io/promptfolio/

## Características

- Galería full-screen estilo masonry (Pinterest)
- Panel lateral con detalles completos de cada imagen
- Almacenamiento 100% gratuito en GitHub Pages
- Sistema de upload automatizado con numeración secuencial
- Detección de duplicados por hash MD5
- Compresión automática de imágenes >2MB
- Backup automático de originales
- Soporte para prompts XML complejos

## Stack Técnico

- HTML/CSS/JavaScript vanilla (sin frameworks)
- GitHub Pages para hosting
- JSON para metadata
- Node.js para scripts de automatización

## Instalación

```bash
git clone https://github.com/yura9011/promptfolio.git
cd promptfolio
npm install
```

## Uso

### 1. Preparar imágenes

Dejá tus imágenes y archivos .txt en la carpeta `uploads/`:

```
uploads/
  ├── mi-imagen.png
  ├── mi-imagen.txt
  ├── otra-imagen.jpg
  └── otra-imagen.txt
```

### 2. Formato del archivo .txt

El script detecta automáticamente el formato. Soporta:

**Formato con MODEL/DIMENSIONS/SEED al final:**
```txt
Tu prompt completo aquí (puede ser XML o texto)

MODEL
Z-Image-Turbo

DIMENSIONS
1024 × 1024

SEED
868423990

STEPS
9

SAMPLER
res_multistep

SCHEDULER
simple
```

**Formato key:value:**
```txt
prompt: A majestic dragon flying over mountains
model: Stable Diffusion XL
category: Dark Fantasy
achievement: yes
steps: 30
cfg_scale: 7.5
sampler: DPM++ 2M Karras
```

**Categorías disponibles:**
- Anime
- Manga
- Dark Fantasy
- Fotorealismo
- RPG/Fantasy
- Surrealismo
- Otros

### 3. Subir imágenes

```bash
npm run upload
```

El script automáticamente:
- Calcula hash MD5 para detectar duplicados
- Renombra a formato secuencial (img-001.png, img-002.png, etc.)
- Comprime si pesa >2MB (manteniendo calidad)
- Copia a `images/`
- Actualiza `data/images.json`
- Hace backup en `backup/`

### 4. Deploy

```bash
git add .
git commit -m "Add new images"
git push
```

GitHub Pages actualiza automáticamente en ~1 minuto.

## Scripts Disponibles

```bash
npm run upload              # Procesar imágenes de uploads/
npm run validate            # Validar data/images.json
```

## Estructura del Proyecto

```
/
├── index.html              # Galería web
├── css/
│   ├── main.css           # Estilos principales
│   └── responsive.css     # Media queries
├── js/
│   ├── app.js             # Entry point
│   ├── gallery.js         # Grid masonry
│   └── modal.js           # Panel lateral
├── images/                 # Imágenes (img-001.png, img-002.png...)
├── data/
│   └── images.json        # Metadata
├── uploads/                # Carpeta temporal para nuevas imágenes
├── backup/                 # Backup de originales (no en Git)
└── scripts/
    ├── upload-local.js    # Script principal
    └── utils/             # Utilidades (hash, parser, compressor)
```

## Límites

- GitHub Pages: 1GB de repositorio total
- Recomendado: comprimir imágenes a <500KB cada una
- Con compresión, podés tener ~2000 imágenes

## Licencia

MIT
