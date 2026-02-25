#  Quick Start - Promptfolio

Guía rápida para poner tu galería online en 5 minutos.

---

##  Deploy Rápido (3 comandos)

```bash
# 1. Conectar con GitHub
git remote add origin https://github.com/yura9011/promptfolio.git
git branch -M main

# 2. Subir todo
git push -u origin main

# 3. Activar GitHub Pages
# Ve a: https://github.com/yura9011/promptfolio/settings/pages
# Selecciona: Source → GitHub Actions
```

**Tu sitio estará en**: https://yura9011.github.io/promptfolio/

---

##  Subir Tu Primera Imagen

### Paso 1: Configurar Cloudinary

```bash
# Copiar template
cp .env.example .env

# Editar con tus credenciales
code .env
```

Obtén tus credenciales en: https://console.cloudinary.com/

### Paso 2: Preparar Imágenes

```
/new-images/
  ├── mi-imagen.png
  └── mi-imagen.txt
```

**mi-imagen.txt**:
```txt
Prompt: Tu prompt aquí
Model: Stable Diffusion XL
Category: Dark Fantasy
Achievement: yes
```

### Paso 3: Upload

```bash
npm install
npm run upload ./new-images
```

### Paso 4: Publicar

```bash
git add data/images.json
git commit -m "Add new images"
git push
```

¡Listo! Tu imagen aparecerá en 1-2 minutos.

---

##  Personalizar

### Cambiar Título

Edita `index.html` línea 32:
```html
<h1 class="header__title"> Tu Título</h1>
```

### Cambiar Colores

Edita `css/main.css` líneas 3-10:
```css
:root {
  --color-primary: #6366f1;  /* Tu color aquí */
}
```

### Agregar Categoría

1. Edita `index.html` línea 40 (agregar botón)
2. Edita `scripts/utils/metadata-parser.js` línea 95 (agregar al parser)

---

##  Más Info

- **Deploy completo**: Ver [DEPLOY.md](DEPLOY.md)
- **Todos los comandos**: Ver [COMMANDS.md](COMMANDS.md)
- **Documentación**: Ver [README.md](README.md)

---

##  Ayuda Rápida

**¿No se ven las imágenes?**
- Verifica URLs en `data/images.json`
- Revisa consola del navegador (F12)

**¿Cambios no se reflejan?**
- Espera 1-2 minutos
- Haz hard refresh: Ctrl+Shift+R

**¿Error al subir?**
- Verifica `.env` configurado
- Ejecuta `npm install` primero

---

¡Disfruta tu galería! 
