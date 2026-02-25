# 🚀 Guía de Deploy - Promptfolio

Esta guía te ayudará a deployar tu galería en GitHub Pages.

---

## 📋 Pre-requisitos

- Git instalado
- Cuenta de GitHub
- Repositorio creado: https://github.com/yura9011/promptfolio

---

## 🔧 Paso 1: Conectar el Repositorio Local

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# Conectar con el repositorio remoto
git remote add origin https://github.com/yura9011/promptfolio.git

# Renombrar la rama a 'main' (si es necesario)
git branch -M main

# Subir todo al repositorio
git push -u origin main
```

---

## ⚙️ Paso 2: Configurar GitHub Pages

1. Ve a tu repositorio: https://github.com/yura9011/promptfolio
2. Click en **Settings** (arriba a la derecha)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona:
   - **Source**: GitHub Actions
5. Guarda los cambios

---

## ✅ Paso 3: Verificar el Deploy

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás un workflow "Deploy to GitHub Pages" ejecutándose
3. Espera a que termine (toma ~1-2 minutos)
4. Tu sitio estará disponible en:
   
   **https://yura9011.github.io/promptfolio/**

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios y los subas a GitHub, se deployará automáticamente:

```bash
# Hacer cambios en tu código
# ...

# Commitear y pushear
git add .
git commit -m "Descripción de los cambios"
git push
```

El sitio se actualizará automáticamente en 1-2 minutos.

---

## 📤 Subir Nuevas Imágenes

### Opción 1: Usando el Script (Recomendado)

```bash
# 1. Preparar carpeta con imágenes y archivos .txt
# 2. Ejecutar script
node scripts/upload-images.js ./new-images

# 3. Commitear y pushear
git add data/images.json
git commit -m "Add new images"
git push
```

### Opción 2: Manual

1. Editar `data/images.json` directamente
2. Subir imágenes a Cloudinary
3. Agregar entradas al JSON
4. Commit y push

---

## 🎨 Personalización

### Cambiar Colores

Edita `css/main.css` y modifica las variables CSS:

```css
:root {
  --color-primary: #6366f1;    /* Color principal */
  --color-secondary: #8b5cf6;  /* Color secundario */
  --color-accent: #f59e0b;     /* Color de acento */
  /* ... */
}
```

### Cambiar Título

Edita `index.html`:

```html
<h1 class="header__title">🎨 Tu Título Aquí</h1>
<p class="header__subtitle">Tu descripción aquí</p>
```

---

## 🐛 Troubleshooting

### El sitio no se ve
- Espera 2-3 minutos después del primer deploy
- Verifica que GitHub Pages esté activado en Settings
- Revisa la pestaña Actions para ver si hay errores

### Las imágenes no cargan
- Verifica que las URLs en `data/images.json` sean correctas
- Asegúrate de que Cloudinary esté configurado correctamente
- Revisa la consola del navegador (F12) para ver errores

### Cambios no se reflejan
- Haz hard refresh: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
- Espera 1-2 minutos para que GitHub Pages actualice
- Verifica que el commit se haya pusheado correctamente

---

## 📝 Notas Importantes

1. **Cloudinary**: Asegúrate de tener configurado tu `.env` localmente para usar los scripts de upload
2. **Git**: No commitees el archivo `.env` (ya está en .gitignore)
3. **Imágenes**: El JSON con las URLs de Cloudinary SÍ se commitea
4. **Backup**: Las imágenes originales en `/backup` NO se suben a Git (están en .gitignore)

---

## 🎉 ¡Listo!

Tu galería estará disponible en:
**https://yura9011.github.io/promptfolio/**

Comparte el link y disfruta tu galería de imágenes IA! 🚀
