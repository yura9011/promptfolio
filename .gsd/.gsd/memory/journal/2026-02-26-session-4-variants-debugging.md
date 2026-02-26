# Session 4: Variants Feature Debugging

**Date**: 2026-02-26
**Status**: In Progress

## Context

User uploaded 6 test images for the "cosmic-ring-sun" prompt to test the variants feature (img-100 to img-105). However, the variant grouping didn't work correctly.

## Issues Found

1. The `variant_group` field in images.json is `null` instead of `"cosmic-ring-sun"`
2. The prompt field contains "variant_group: cosmic-ring-sun" instead of the actual prompt
3. Images are not grouped as variants in the JSON structure
4. The metadata parser didn't properly extract the variant_group field

## Root Cause

The .txt files likely used a format like:
```
variant_group: cosmic-ring-sun
```

But the parser expected either:
- A MODEL section format (with VARIANT_GROUP as a section header)
- Or key:value pairs with the actual prompt included

## Solution Needed

1. Fix the metadata parser to handle variant_group as a simple key:value pair
2. Re-process the 6 test images with corrected metadata
3. Provide user with correct .txt format for future uploads

## Correct .txt Format for Variants

```
1970s dark cosmic fantasy illustration, vintage paperback cover art...

MODEL
Grok

VARIANT_GROUP
cosmic-ring-sun

VARIANT_INDEX
1
```

Or simpler format:
```
variant_group: cosmic-ring-sun
variant_index: 1
model: Grok

1970s dark cosmic fantasy illustration, vintage paperback cover art...
```

## Next Steps

1. Update metadata parser to handle variant fields correctly
2. Create example .txt files for user
3. Re-upload the 6 test images with correct metadata
4. Test that variants display correctly on the site
