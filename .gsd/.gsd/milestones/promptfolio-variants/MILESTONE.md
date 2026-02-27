me d# Milestone: Prompt Variants Feature

**Status**: Complete  
**Priority**: High  
**Estimated Effort**: Medium (4-6 hours)

## Overview

Implement a system to show multiple platform variations of the same prompt in a single gallery card. Users can navigate between variants using dots/indicators below the image.

## Current Status

### Completed
- [x] Data structure designed and implemented
- [x] Metadata parser updated to extract variant_group and variant_index
- [x] Metadata parser fixed to separate metadata from prompt lines
- [x] Upload script modified to group variants
- [x] Gallery UI with dots navigation implemented
- [x] Modal updated to show all variants
- [x] CSS styling for dots and variant thumbnails
- [x] Test upload with 6 variants (cosmic-ring-sun) successful
- [x] Variants display correctly on live site
- [x] Deployed to production

## Problem Statement

Currently, each image is shown as a separate card even if it's the same prompt generated on different platforms (Midjourney, DALL-E, Stable Diffusion, etc.). This makes it hard to compare results and clutters the gallery.

## Goals

- Group images by prompt into variant collections
- Show variants in a single card with dot navigation
- Display all variants in the modal with their respective models
- Make the system dynamic (2-10 variants per group)
- Keep the minimal, clean design aesthetic

## Success Criteria

- [ ] Images with same `variant_group` are grouped together
- [ ] Gallery cards show dots for navigation between variants
- [ ] Clicking dots switches the displayed image smoothly
- [ ] Modal shows all variants with their models
- [ ] Upload script detects and groups variants automatically
- [ ] Existing images continue to work (backward compatible)

## Technical Approach

### 1. Data Structure

**New fields in .txt files:**
```txt
variant_group: dragon-sunset
variant_index: 1

Your prompt here...

MODEL
Midjourney
```

**JSON structure change:**
```json
{
  "id": "variant-dragon-sunset",
  "variant_group": "dragon-sunset",
  "prompt": "A dragon at sunset...",
  "variants": [
    {
      "id": "img-001",
      "url": "images/img-001.png",
      "model": "Midjourney",
      "settings": {...}
    },
    {
      "id": "img-002", 
      "url": "images/img-002.png",
      "model": "DALL-E 3",
      "settings": {...}
    }
  ],
  "created_at": "2026-02-25T10:00:00Z"
}
```

### 2. UI Changes

**Gallery Card:**
- Show first variant by default
- Add dots container below image
- Dots are clickable and show active state
- Smooth fade transition between variants

**Modal:**
- Show all variants in a grid or carousel
- Display model name for each variant
- Keep existing prompt/settings display

### 3. Upload Script Changes

- Parse `variant_group` and `variant_index` from .txt
- Group images by `variant_group` before adding to JSON
- Create variant collection structure
- Maintain backward compatibility (images without variant_group work as before)

### 4. Gallery.js Changes

- Detect if image is a variant collection
- Render dots for variant navigation
- Handle dot clicks to switch images
- Update lazy loading for variant images

### 5. Modal.js Changes

- Detect variant collections
- Show all variants with their models
- Allow navigation between variants in modal

## Implementation Plan

### Phase 1: Data Structure (1 hour)
- [ ] Update metadata parser to extract `variant_group` and `variant_index`
- [ ] Modify upload script to group variants
- [ ] Update JSON structure to support variants
- [ ] Test with sample variant group

### Phase 2: Gallery UI (2 hours)
- [ ] Add dots container to gallery cards
- [ ] Implement dot rendering (dynamic count)
- [ ] Add click handlers for variant switching
- [ ] Implement smooth fade transitions
- [ ] Style dots (minimal, black background)

### Phase 3: Modal Updates (1 hour)
- [ ] Detect and display variant collections
- [ ] Show all variants with model labels
- [ ] Update navigation for variants
- [ ] Test with multiple variants

### Phase 4: Testing & Polish (1 hour)
- [ ] Test with 2, 3, 5, 10 variants
- [ ] Verify backward compatibility
- [ ] Test infinite scroll with variants
- [ ] Polish animations and transitions
- [ ] Update README with variant instructions

## Files to Modify

- `scripts/utils/metadata-parser.js` - Parse variant fields
- `scripts/upload-local.js` - Group variants logic
- `data/images.json` - New structure
- `js/gallery.js` - Dots UI and switching
- `js/modal.js` - Variant display
- `css/main.css` - Dots styling
- `README.md` - Document variant feature

## Risks & Mitigations

**Risk**: Existing 105 images break with new structure  
**Mitigation**: Maintain backward compatibility, non-variant images work as before

**Risk**: Dots UI clutters minimal design  
**Mitigation**: Keep dots minimal, small, only show on hover

**Risk**: Complex grouping logic in upload script  
**Mitigation**: Start simple, iterate based on usage

## Open Questions

- [ ] Should dots show on hover only or always visible?
- [ ] Should modal show variants in grid or carousel?
- [ ] How to handle variants with different aspect ratios?
- [ ] Should we show variant count badge on card?

## Notes

- User wants max ~5 variants but system should be dynamic
- Only Z-Image has full metadata, other platforms may have minimal info
- Keep black background and minimal aesthetic
- User uploads in batches, variants may come in groups
