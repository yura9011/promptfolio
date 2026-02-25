#  Comandos Rápidos - Promptfolio

Referencia rápida de todos los comandos disponibles.

---

##  Deploy

```bash
# Primera vez - Conectar repositorio
git remote add origin https://github.com/yura9011/promptfolio.git
git branch -M main
git push -u origin main

# Actualizaciones posteriores
git add .
git commit -m "Descripción del cambio"
git push
```

---

##  Upload de Imágenes

```bash
# Instalar dependencias (primera vez)
npm install

# Upload normal
npm run upload ./carpeta-imagenes

# Dry-run (testing sin subir)
npm run test ./carpeta-imagenes

# Con path absoluto
node scripts/upload-images.js D:/imagenes/nuevas
```

---

##  Validación

```bash
# Validar datos del JSON
npm run validate
```

---

##  Desarrollo Local

```bash
# Servidor local simple (Python)
python -m http.server 8000

# O con Node.js (si tienes http-server instalado)
npx http-server -p 8000

# Luego abrir: http://localhost:8000
```

---

##  Estructura de Carpetas

```bash
# Crear carpeta para nuevas imágenes
mkdir new-images

# Ver estructura del proyecto
tree -L 2 -I 'node_modules|.git'
```

---

##  Personalización

```bash
# Editar colores
code css/main.css

# Editar título
code index.html

# Editar categorías
code index.html
code scripts/utils/metadata-parser.js
```

---

##  Debug

```bash
# Ver logs de Git
git log --oneline

# Ver estado de Git
git status

# Ver diferencias
git diff

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Ver archivos ignorados
git status --ignored
```

---

## 🧹 Limpieza

```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar archivos de test
rm -rf test-images
rm create-test-images.js

# Limpiar backups antiguos
rm -rf backup/*
```

---

##  Estadísticas

```bash
# Contar imágenes en JSON
cat data/images.json | grep '"id"' | wc -l

# Ver tamaño de carpetas
du -sh backup/ data/ scripts/

# Ver últimas imágenes agregadas
cat data/images.json | grep '"created_at"' | tail -5
```

---

##  Cloudinary

```bash
# Verificar configuración
cat .env | grep CLOUDINARY

# Copiar template de configuración
cp .env.example .env

# Editar configuración
code .env
```

---

##  NPM Scripts

```bash
npm run upload    # Upload de imágenes
npm run validate  # Validar datos
npm run test      # Dry-run upload
```

---

##  URLs Útiles

- **Repositorio**: https://github.com/yura9011/promptfolio
- **Sitio Web**: https://yura9011.github.io/promptfolio/
- **Cloudinary Dashboard**: https://console.cloudinary.com/
- **GitHub Actions**: https://github.com/yura9011/promptfolio/actions

---

##  Tips

```bash
# Alias útiles (agregar a .bashrc o .zshrc)
alias pf-upload='npm run upload'
alias pf-validate='npm run validate'
alias pf-push='git add . && git commit -m "Update gallery" && git push'

# Uso
pf-upload ./new-images
pf-validate
pf-push
```
