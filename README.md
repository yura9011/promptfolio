# 🎨 Galería de Imágenes IA

Galería visual personal para documentar y explorar imágenes generadas por IA, mostrando el proceso creativo detrás de cada imagen (prompts, configuraciones, modelo usado).

## ✨ Características

- 📸 Galería responsive con vista de cuadrícula
- 🔍 Búsqueda y filtros por categoría
- 🤖 Sistema de upload automatizado para agentes
- 🔄 Detección automática de duplicados
- 🗜️ Compresión automática de imágenes
- 💾 Backup automático de originales
- ☁️ Almacenamiento en Cloudinary

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd ai-image-gallery
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Cloudinary

1. Crear cuenta en [Cloudinary](https://cloudinary.com/) (gratis hasta 10GB)
2. Copiar credenciales desde el dashboard
3. Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

4. Editar `.env` con tus credenciales:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## 📤 Uso - Subir Imágenes

### Workflow Simple

1. Crear carpeta con tus imágenes:

```
/new-images/
  ├── dragon001.png
  ├── dragon001.txt
  ├── cyberpunk-city.jpg
  └── cyberpunk-city.txt
```

2. Crear archivo `.txt` para cada imagen con la metadata:

```txt
Prompt: A majestic dragon flying over mountains at sunset
Model: Stable Diffusion XL
Category: Dark Fantasy
Achievement: yes
Steps: 30
CFG Scale: 7.5
Sampler: DPM++ 2M Karras
Seed: 123456789
Notes: Primera versión exitosa
```

3. Ejecutar el script:

```bash
npm run upload ./new-images
```

o directamente:

```bash
node scripts/upload-images.js ./new-images
```

### Formato del archivo .txt

El parser es flexible y acepta varios formatos:

**Formato estructurado** (recomendado):
```txt
Prompt: Tu prompt aquí
Model: Stable Diffusion XL
Category: Fotorealismo
Achievement: yes
```

**Formato libre** (también funciona):
```txt
Stable Diffusion XL
Fotorealismo
Un paisaje cyberpunk con neón
Achievement
```

**Categorías disponibles**:
- Anime
- Manga
- Dark Fantasy
- Fotorealismo
- RPG/Fantasy
- Surrealismo
- Otros

## 🛠️ Scripts Disponibles

### Upload de imágenes
```bash
npm run upload ./carpeta-imagenes
```

### Validar datos
```bash
npm run validate
```

### Modo dry-run (testing)
```bash
npm run test ./carpeta-imagenes
```

## 📁 Estructura del Proyecto

```
/
├── index.html              # Galería web
├── css/                    # Estilos
├── js/                     # JavaScript frontend
├── data/
│   └── images.json        # Base de datos de imágenes
├── scripts/               # Scripts de automatización
│   ├── upload-images.js   # Script principal de upload
│   ├── validate-data.js   # Validación de datos
│   └── utils/             # Utilidades
├── backup/                # Backup local (no en Git)
└── docs/                  # Documentación adicional
```

## 🔧 Configuración Avanzada

Ver [docs/USAGE.md](docs/USAGE.md) para:
- Uso avanzado de scripts
- Troubleshooting
- Configuración de agentes
- Ejemplos completos

## 📝 Licencia

MIT
