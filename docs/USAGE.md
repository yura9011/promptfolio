# Guía de Uso - Galería de Imágenes IA

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Workflow Completo](#workflow-completo)
3. [Formato de Metadata](#formato-de-metadata)
4. [Comandos Disponibles](#comandos-disponibles)
5. [Troubleshooting](#troubleshooting)
6. [Uso con Agentes](#uso-con-agentes)

---

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Cloudinary

1. Crear cuenta gratuita en [Cloudinary](https://cloudinary.com/)
2. Ir al Dashboard y copiar las credenciales
3. Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

4. Editar `.env` con tus credenciales:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=ai-gallery
```

---

## Workflow Completo

### Paso 1: Preparar Imágenes

Crear una carpeta con tus imágenes:

```
/new-images/
  ├── dragon001.png
  ├── dragon001.txt
  ├── cyberpunk-city.jpg
  ├── cyberpunk-city.txt
  └── portrait.png
```

### Paso 2: Crear Archivos de Metadata

Para cada imagen, crear un archivo `.txt` con el mismo nombre:

**Ejemplo: dragon001.txt**
```txt
Prompt: A majestic dragon flying over mountains at sunset, epic fantasy art
Model: Stable Diffusion XL
Category: Dark Fantasy
Achievement: yes
Steps: 30
CFG Scale: 7.5
Sampler: DPM++ 2M Karras
Seed: 123456789
Notes: Primera versión exitosa después de varios intentos
```

### Paso 3: Subir Imágenes

```bash
npm run upload ./new-images
```

o directamente:

```bash
node scripts/upload-images.js ./new-images
```

### Paso 4: Validar Datos

```bash
npm run validate
```

---

## Formato de Metadata

### Formato Estructurado (Recomendado)

```txt
Prompt: [Tu prompt completo aquí]
Model: [Nombre del modelo]
Category: [Categoría]
Achievement: [yes/no]
Steps: [número]
CFG Scale: [número]
Sampler: [nombre del sampler]
Seed: [número]
Notes: [Notas adicionales]
```

### Formato Libre (También Funciona)

El parser es flexible y puede extraer información de texto libre:

```txt
Stable Diffusion XL
Dark Fantasy
Un dragón majestuoso volando sobre montañas
Achievement
```

### Categorías Válidas

- `Anime`
- `Manga`
- `Dark Fantasy`
- `Fotorealismo`
- `RPG/Fantasy`
- `Surrealismo`
- `Otros`

### Campos Reconocidos

**Campos principales**:
- `Prompt` / `Description` / `Desc`
- `Model` / `Modelo`
- `Category` / `Categoria` / `Categoría`
- `Achievement` / `Logro`
- `Notes` / `Notas`

**Settings técnicos**:
- `Steps`
- `CFG Scale` / `CFG_Scale` / `CFG`
- `Sampler`
- `Seed`
- `Size` / `Resolution`

Cualquier otro campo se guarda en `settings.otros`.

---

## Comandos Disponibles

### Upload de Imágenes

```bash
# Upload normal
npm run upload ./carpeta-imagenes

# Dry-run (testing sin subir)
npm run test ./carpeta-imagenes

# Con path completo
node scripts/upload-images.js D:/imagenes/nuevas
```

### Validar Datos

```bash
npm run validate
```

Valida:
- Campos requeridos presentes
- Formato de URLs correcto
- Categorías válidas
- Duplicados por hash
- Formato de fechas

---

## Troubleshooting

### Error: "Cloudinary not configured"

**Solución**: Verificar que el archivo `.env` existe y tiene las credenciales correctas.

```bash
# Verificar que .env existe
ls -la .env

# Verificar contenido (sin mostrar secrets)
cat .env | grep CLOUDINARY_CLOUD_NAME
```

### Error: "Directory not found"

**Solución**: Verificar que la ruta es correcta. Usar rutas absolutas si es necesario.

```bash
# Windows
node scripts/upload-images.js D:/imagenes/nuevas

# Linux/Mac
node scripts/upload-images.js /home/user/imagenes/nuevas
```

### Imágenes No Se Comprimen

**Causa**: Solo se comprimen imágenes >2MB.

**Solución**: Esto es normal. Imágenes pequeñas no necesitan compresión.

### Duplicados No Se Detectan

**Causa**: El hash MD5 se calcula del contenido del archivo. Si editaste la imagen, el hash cambia.

**Solución**: Esto es esperado. Cada versión editada es considerada una imagen nueva.

---

## Uso con Agentes

### Playwright Automation

Si usas Playwright para automatizar, puedes ejecutar el script así:

```javascript
// En tu script de Playwright
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function uploadImages(folderPath) {
  const { stdout, stderr } = await execPromise(
    `node scripts/upload-images.js ${folderPath}`
  );
  console.log(stdout);
  if (stderr) console.error(stderr);
}

// Uso
await uploadImages('./new-images');
```

### API Programática

También puedes importar las funciones directamente:

```javascript
import { uploadImage } from './scripts/utils/cloudinary.js';
import { addImageEntry } from './scripts/utils/json-manager.js';

// Upload manual
const result = await uploadImage('./image.png');
await addImageEntry({
  id: 'img-123',
  url: result.url,
  thumbnail: result.thumbnail,
  // ... más metadata
});
```

### Batch Processing

Para procesar muchas imágenes, puedes crear un script personalizado:

```javascript
import fs from 'fs/promises';
import path from 'path';

const folders = ['./batch1', './batch2', './batch3'];

for (const folder of folders) {
  console.log(`Processing ${folder}...`);
  await execPromise(`node scripts/upload-images.js ${folder}`);
}
```

---

## Tips y Mejores Prácticas

1. **Siempre hacer backup**: El script ya hace backup automático en `/backup`
2. **Usar dry-run primero**: Probar con `--dry-run` antes de subir
3. **Validar después de subir**: Ejecutar `npm run validate` después de cada upload
4. **Organizar por lotes**: Subir imágenes en lotes pequeños (10-20) para mejor control
5. **Nombrar archivos descriptivamente**: Usar nombres que identifiquen la imagen
6. **Mantener .txt actualizado**: Incluir toda la metadata disponible

---

## Límites y Consideraciones

### Cloudinary Free Tier

- **Storage**: 10 GB
- **Bandwidth**: 25 GB/mes
- **Transformaciones**: 25,000/mes

El script muestra el uso actual después de cada upload.

### Tamaño de Imágenes

- Imágenes >2MB se comprimen automáticamente
- Formato de compresión: WebP (85% quality)
- Backup de originales en `/backup`

### Performance

- El script procesa imágenes secuencialmente
- Para muchas imágenes (100+), puede tomar varios minutos
- Considera dividir en lotes más pequeños

---

¿Preguntas? Revisa el [README.md](../README.md) principal o abre un issue.
