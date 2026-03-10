# Data Architecture

This directory contains the image metadata in a split JSON structure for better manageability.

## Structure

```
data/
├── images.json          # Source of truth (edit this)
├── index.json           # Generated index (do not edit)
├── variants/            # Generated variant groups (do not edit)
│   ├── domestic-interruption.json
│   ├── argentine-alt-girl.json
│   └── ... (one file per variant group)
└── singles/             # Generated single images (do not edit)
    ├── otros-1.json
    ├── otros-2.json
    └── fotorealismo.json
```

## Workflow

### Adding New Images

1. Add images to `uploads/` with `.txt` metadata files
2. Run: `npm run upload`
3. This updates `images.json` automatically
4. Run: `npm run build` to regenerate split files
5. Commit and push

### Manual Editing

1. Edit `images.json` directly
2. Run: `npm run build` to regenerate split files
3. Test the gallery locally
4. Commit and push

### Deployment

The `predeploy` script automatically runs `npm run build` before deployment, so split files are always up-to-date.

## File Sizes

- Each variant group file: < 200 lines
- Each singles file: < 500 lines
- Index file: < 200 lines

This makes files easy to edit manually and keeps Git diffs readable.

## Why Split?

The original `images.json` had 4000+ lines, making it:
- Impossible to edit manually
- Slow to parse
- Difficult to review in Git diffs
- Prone to merge conflicts

The split structure solves all these issues while maintaining backward compatibility.

## Backward Compatibility

The gallery uses `DataLoader` which reads from the split structure. If you need the monolithic JSON for other tools, `images.json` is still the source of truth.
