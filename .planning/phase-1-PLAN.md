# Fase 1: Scripts de Automatización - Plan de Implementación

**Fecha**: 2026-02-25  
**Objetivo**: Sistema completo de upload automatizado para agentes

---

<plan>
  <goal>
    Crear scripts Node.js que permitan a agentes subir imágenes en batch a Cloudinary con metadata flexible, 
    detección de duplicados, compresión automática y backup de seguridad.
  </goal>
  
  <prerequisites>
    <item>SPEC.md finalizado</item>
    <item>Cuenta de Cloudinary creada (o usar existente)</item>
    <item>Node.js instalado en el sistema</item>
  </prerequisites>
  
  <tasks>
    <task id="1">
      <description>Setup inicial del proyecto Node.js</description>
      <files>
        - package.json
        - .env.example
        - .gitignore
        - README.md
      </files>
      <changes>
        - Inicializar package.json con dependencias necesarias:
          * cloudinary (SDK oficial)
          * dotenv (variables de entorno)
          * sharp (compresión de imágenes)
          * crypto (hash MD5, built-in)
        - Crear .env.example con template de configuración
        - Actualizar .gitignore para excluir .env, node_modules, backup/
        - Crear README.md con instrucciones de setup
      </changes>
      <verification>
        - npm install ejecuta sin errores
        - .env.example contiene todas las variables necesarias
        - .gitignore excluye archivos sensibles
      </verification>
    </task>
    
    <task id="2">
      <description>Crear utilidades base (hash, compresión, parser)</description>
      <files>
        - scripts/utils/image-hash.js
        - scripts/utils/compressor.js
        - scripts/utils/metadata-parser.js
        - scripts/utils/json-manager.js
      </files>
      <changes>
        - image-hash.js: Función para calcular MD5 de imágenes
        - compressor.js: Comprimir imágenes >2MB a WebP 85% quality usando sharp
        - metadata-parser.js: Parser flexible de archivos .txt (key:value y texto libre)
        - json-manager.js: Funciones para leer/escribir/actualizar images.json de forma segura
      </changes>
      <verification>
        - Cada utilidad exporta funciones correctamente
        - Tests manuales con imágenes de ejemplo funcionan
        - Parser reconoce diferentes formatos de .txt
      </verification>
    </task>
    
    <task id="3">
      <description>Implementar integración con Cloudinary API</description>
      <files>
        - scripts/utils/cloudinary.js
      </files>
      <changes>
        - Configurar cliente de Cloudinary con credenciales de .env
        - Función uploadImage(): sube imagen y retorna URL + thumbnail
        - Función getUsageStats(): obtiene uso actual de la cuenta
        - Manejo de errores y reintentos
        - Configurar transformaciones automáticas (thumbnails 300x300)
      </changes>
      <verification>
        - Upload de imagen de prueba funciona
        - Retorna URLs correctas (imagen + thumbnail)
        - getUsageStats() muestra uso actual
      </verification>
    </task>
    
    <task id="4">
      <description>Crear script principal upload-images.js</description>
      <files>
        - scripts/upload-images.js
      </files>
      <changes>
        - Parsear argumentos de línea de comandos (carpeta source)
        - Escanear carpeta buscando imágenes (.png, .jpg, .jpeg, .webp)
        - Para cada imagen:
          1. Calcular hash MD5
          2. Verificar duplicados en images.json
          3. Si duplicado, preguntar: actualizar/skip/cancelar
          4. Copiar original a /backup
          5. Comprimir si >2MB
          6. Buscar y parsear archivo .txt
          7. Subir a Cloudinary
          8. Actualizar images.json
        - Mostrar resumen final:
          * Imágenes subidas
          * Duplicados encontrados
          * Espacio ahorrado por compresión
          * Uso actual de Cloudinary
        - Opción --auto-commit para commit automático a Git
      </changes>
      <verification>
        - Script procesa carpeta de prueba correctamente
        - Detecta duplicados
        - Comprime imágenes grandes
        - Actualiza JSON correctamente
        - Muestra resumen completo
      </verification>
    </task>
    
    <task id="5">
      <description>Crear script de validación validate-data.js</description>
      <files>
        - scripts/validate-data.js
      </files>
      <changes>
        - Leer images.json
        - Validar estructura de cada entrada:
          * Campos requeridos presentes
          * URLs de Cloudinary accesibles (HTTP HEAD request)
          * Categorías válidas
          * Formato de fecha correcto
        - Detectar entradas duplicadas por hash
        - Reportar errores encontrados
        - Opción --fix para intentar reparar automáticamente
      </changes>
      <verification>
        - Detecta errores en JSON corrupto
        - Valida URLs correctamente
        - Reporta problemas claramente
      </verification>
    </task>
    
    <task id="6">
      <description>Crear estructura de datos inicial y documentación</description>
      <files>
        - data/images.json
        - data/.gitkeep
        - backup/.gitkeep
        - README.md (actualizar)
        - docs/USAGE.md
      </files>
      <changes>
        - Crear data/images.json vacío con estructura inicial: []
        - Crear carpetas data/ y backup/ con .gitkeep
        - Actualizar README.md con:
          * Descripción del proyecto
          * Instrucciones de instalación
          * Configuración de Cloudinary
          * Ejemplos de uso
        - Crear docs/USAGE.md con:
          * Workflow completo para agentes
          * Formato de archivos .txt
          * Ejemplos de comandos
          * Troubleshooting común
      </changes>
      <verification>
        - Estructura de carpetas creada
        - Documentación clara y completa
        - Ejemplos funcionan correctamente
      </verification>
    </task>
  </tasks>
  
  <success_criteria>
    <criterion>Script upload-images.js procesa carpeta de imágenes correctamente</criterion>
    <criterion>Detección de duplicados funciona por hash MD5</criterion>
    <criterion>Compresión automática reduce tamaño de imágenes >2MB</criterion>
    <criterion>Backup automático guarda originales en /backup</criterion>
    <criterion>Parser de .txt maneja formatos flexibles</criterion>
    <criterion>Integración con Cloudinary sube imágenes y genera thumbnails</criterion>
    <criterion>images.json se actualiza correctamente con metadata</criterion>
    <criterion>Script de validación detecta errores en datos</criterion>
    <criterion>Documentación permite a agentes usar el sistema fácilmente</criterion>
    <criterion>Resumen muestra uso actual de Cloudinary</criterion>
  </success_criteria>
</plan>

---

## Orden de Ejecución

**Wave 1** (sin dependencias):
- Task 1: Setup inicial

**Wave 2** (depende de Task 1):
- Task 2: Utilidades base
- Task 3: Integración Cloudinary

**Wave 3** (depende de Tasks 2 y 3):
- Task 4: Script principal upload-images.js
- Task 5: Script de validación

**Wave 4** (depende de todo):
- Task 6: Documentación final

---

## Notas de Implementación

- Usar async/await para operaciones asíncronas
- Manejar errores gracefully (no crashear el script)
- Logging claro y colorido (usar chalk o similar)
- Progress bars para operaciones largas (usar cli-progress)
- Validar inputs antes de procesar
- Permitir modo dry-run (--dry-run) para testing
