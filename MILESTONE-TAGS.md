# Milestone: Sistema de Tags y Búsqueda

## Objetivo
Implementar un sistema de tags automático que extraiga keywords de los prompts y permita búsqueda/filtrado rápido de imágenes.

## Tareas

### Fase 1: Extracción de Tags
- [ ] Crear script `scripts/extract-tags.js` que:
  - Lee todos los prompts del `data/images.json`
  - Extrae keywords relevantes (sustantivos, adjetivos clave)
  - Filtra palabras comunes (stop words)
  - Genera lista de tags por imagen
  - Actualiza el JSON agregando campo `tags: []`

- [ ] Ejecutar script sobre las 99 imágenes existentes
- [ ] Modificar `upload-local.js` para extraer tags automáticamente al subir nuevas imágenes

### Fase 2: UI de Búsqueda
- [ ] Agregar barra de búsqueda minimalista arriba de la galería:
  - Fondo negro, input simple
  - Placeholder: "🔍 Buscar por tags o palabras..."
  - Sin header, solo el input flotante

- [ ] Implementar filtrado en tiempo real:
  - Buscar en tags
  - Buscar en prompt
  - Buscar en modelo
  - Buscar en categoría

### Fase 3: Tags Visuales
- [ ] Mostrar tags populares como chips clickeables arriba:
  - Top 20 tags más usados
  - Click en tag = filtrar por ese tag
  - Estilo: `#fantasy #dragon #1970s #dark`

- [ ] Agregar tags en el modal de cada imagen:
  - Mostrar todos los tags de la imagen
  - Clickeables para filtrar
  - Estilo consistente con el diseño minimalista

### Fase 4: Optimización
- [ ] Índice de búsqueda para performance
- [ ] Búsqueda fuzzy (tolerancia a typos)
- [ ] Combinación de múltiples tags (AND/OR)

## Estructura de Datos

```json
{
  "id": "img-001",
  "url": "images/img-001.png",
  "prompt": "1970s dark cosmic fantasy...",
  "model": "Z-Image-Turbo",
  "category": "Otros",
  "tags": [
    "1970s",
    "dark",
    "cosmic",
    "fantasy",
    "biomechanical",
    "sun",
    "vintage"
  ],
  ...
}
```

## Criterios de Éxito
- ✅ Tags extraídos automáticamente de todos los prompts
- ✅ Búsqueda funciona en <100ms
- ✅ UI minimalista sin romper el diseño actual
- ✅ Tags clickeables en modal y en barra superior
- ✅ Nuevas imágenes obtienen tags automáticamente

## Notas Técnicas
- Usar librerías ligeras para NLP (o regex simple)
- Mantener el diseño minimalista (fondo negro, sin chrome)
- No agregar dependencias pesadas
- Tags en español e inglés
