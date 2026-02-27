me # Milestone: Modal Consistency & Duplicate Cleanup

**Status**: ✅ COMPLETED  
**Priority**: High  
**Created**: 2026-02-27  
**Completed**: 2026-02-27

## Problem Statement

Multiple critical issues with the gallery and modal:

1. **Duplicates**: Images uploaded as variants are appearing BOTH as individual images AND as grouped variants
2. **Modal Inconsistency**: Modal layout is inconsistent across different images:
   - Sometimes appears small on the right with content below
   - Sometimes appears normal
   - Sometimes appears even smaller
3. **Responsive Issues**: Need to ensure consistent behavior across all screen sizes

## Root Causes

### 1. Duplicate Images
The upload script is creating entries for variant images in two ways:
- Individual entries (img-106, img-107, etc.)
- Grouped variant entries (variant-skull-castle, etc.)

This happens because the script processes ALL images in uploads/ folder, then ALSO creates variant groups.

### 2. Modal Inconsistency
Looking at the CSS:
- Modal uses horizontal layout (image left, details right)
- Details panel is fixed at 500px width (600px on large screens)
- Image container uses `flex: 1` to fill remaining space
- BUT: Different image aspect ratios cause different layouts

The issue is likely:
- Portrait images (9:16) push the layout
- Landscape images (16:9) behave differently
- Square images (1:1) behave differently
- No consistent max-height on image container

## Solution Design

### Phase 1: Fix Upload Script (Prevent Future Duplicates)
**Goal**: Modify upload script to NOT create individual entries for variant images

Changes needed in `scripts/upload-local.js`:
1. When processing images, check if .txt file contains `variant_group` field
2. If yes, skip creating individual entry
3. Only add to variants array for grouping
4. This way variants ONLY appear in groups, never as individuals

### Phase 2: Clean Existing Duplicates
**Goal**: Remove duplicate individual entries from images.json

Process:
1. Identify all images that are part of variant groups
2. Remove their individual entries from images.json
3. Keep only the grouped variant entries
4. Update image numbering if needed (or leave gaps)

Affected groups (12 total):
- cosmic-ring-sun (6 variants)
- cathedral-leviathan (5 variants)
- glass-desert-nomads (5 variants)
- hand-labyrinth (6 variants)
- anglerfish-sky (6 variants)
- dead-god-scavengers (6 variants)
- shattered-moon (6 variants)
- necromancer-mutation (5 variants)
- pre-rendered-knight (6 variants)
- skull-castle (6 variants)
- necromancer-graveyard (5 variants)
- neo-gothic-y2k (6 variants)

Total: 68 duplicate entries to remove

### Phase 3: Fix Modal Layout Consistency
**Goal**: Ensure modal looks identical regardless of image aspect ratio

CSS Changes needed in `css/main.css`:

```css
.modal__image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  padding: var(--spacing-xl);
  overflow: hidden;
  min-height: 0; /* Important for flex */
}

.modal__image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}
```

Key fixes:
- Add `min-height: 0` to image container (flex bug fix)
- Ensure image never exceeds container bounds
- Consistent padding on all sides
- Center alignment always

### Phase 4: Improve Responsive Behavior
**Goal**: Better mobile/tablet experience

Changes in `css/responsive.css`:

1. **Tablet (768px - 1023px)**:
   - Reduce details panel to 350px
   - Ensure image still has room

2. **Mobile (<768px)**:
   - Stack vertically (already done)
   - Image container: max-height 60vh (more room for image)
   - Details panel: remaining space with scroll

3. **Small Mobile (<480px)**:
   - Image container: max-height 50vh
   - Larger touch targets for variant dots

## Implementation Plan

### Task 1: Fix Upload Script
**File**: `scripts/upload-local.js`
**Estimated**: 30 min

- [x] Add check for variant_group in metadata
- [x] Skip individual entry creation for variants
- [x] Test with new variant upload
- [x] Verify only group entry is created

### Task 2: Clean Duplicate Entries
**File**: `data/images.json`
**Estimated**: 45 min

- [x] Create backup of images.json
- [x] Identify all variant image IDs
- [x] Remove individual entries for variants
- [x] Verify variant groups still intact
- [x] Test gallery loads correctly
- [x] Commit changes

### Task 3: Fix Modal CSS
**Files**: `css/main.css`, `css/responsive.css`
**Estimated**: 30 min

- [x] Add min-height: 0 to image container
- [x] Test with portrait images (9:16)
- [x] Test with landscape images (16:9)
- [x] Test with square images (1:1)
- [x] Verify consistent layout
- [x] Test variant switching

### Task 4: Improve Responsive
**File**: `css/responsive.css`
**Estimated**: 30 min

- [x] Adjust tablet breakpoint
- [x] Improve mobile layout
- [x] Test on different screen sizes
- [x] Verify touch targets
- [x] Test variant dots on mobile

### Task 5: Testing & Validation
**Estimated**: 30 min

- [x] Test all 12 variant groups
- [x] Verify no duplicates in gallery
- [x] Test modal with different aspect ratios
- [x] Test responsive on mobile/tablet
- [x] Test variant switching
- [x] Deploy and verify on GitHub Pages

## Success Criteria

1. **No Duplicates**: Each variant image appears ONLY in its group, never as individual
2. **Consistent Modal**: Modal looks identical regardless of image aspect ratio
3. **Responsive**: Works perfectly on desktop, tablet, and mobile
4. **Variant Switching**: Dots work smoothly, modal updates correctly
5. **Performance**: No degradation in load times

## Risks & Mitigation

**Risk**: Removing entries might break image references
**Mitigation**: Backup images.json before changes, test thoroughly

**Risk**: CSS changes might break on some browsers
**Mitigation**: Test on Chrome, Firefox, Safari, Edge

**Risk**: Mobile layout might be cramped
**Mitigation**: Adjust max-height values based on testing

## Timeline

**Total Estimated Time**: 2.5 hours

- Task 1: 30 min
- Task 2: 45 min
- Task 3: 30 min
- Task 4: 30 min
- Task 5: 30 min

## Notes

- Keep backup of images.json during cleanup
- Test each phase before moving to next
- User wants "super consistente" - this is critical
- Responsive is important - user specifically mentioned it
