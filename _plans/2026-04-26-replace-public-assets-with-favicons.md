# Plan: Generate Icons from SVG Source

branch: chore/replace-public-assets-with-favicons

## Context

The previous archive `~/tmp/favicon-for-app.zip` contained placeholder icons. The user has a new source SVG (`~/tmp/favicon-5.svg`) with the correct brand color (#00A541). We need to generate all icon files from this source: favicon.ico, apple-icon.png, icon.svg, and PWA manifest PNGs (192x192, 512x512). ImageMagick (`convert`) is available.

## Current Files to Replace

All generated from `~/tmp/favicon-5.svg`:

| File                      | Size                 | Format               |
| ------------------------- | -------------------- | -------------------- |
| `app/favicon.ico`         | Multi-res (16,32,48) | .ico                 |
| `app/apple-icon.png`      | 180×180              | .png                 |
| `app/icon.svg`            | source copy          | .svg                 |
| `public/icon-192x192.png` | 192×192              | .png                 |
| `public/icon-512x512.png` | 512×512              | .png                 |
| `app/manifest.json`       | —                    | update `icons` array |

## Tool

ImageMagick 6 (`convert`) with `-background none -density 256`.

### Commands

```bash
# favicon.ico (16, 32, 48)
convert -background none -density 256 favicon-5.svg -define icon:auto-resize=16,32,48 app/favicon.ico

# apple-icon 180x180
convert -background none -density 256 -resize 180x180 favicon-5.svg app/apple-icon.png

# PWA icons
convert -background none -density 256 -resize 192x192 favicon-5.svg public/icon-192x192.png
convert -background none -density 256 -resize 512x512 favicon-5.svg public/icon-512x512.png

# icon.svg — just copy the source
cp favicon-5.svg app/icon.svg
```

## Changes

1. Generate `app/favicon.ico` (multi-res 16,32,48)
2. Generate `app/apple-icon.png` (180×180)
3. Copy source SVG to `app/icon.svg`
4. Generate `public/icon-192x192.png` and `public/icon-512x512.png`
5. Delete `public/icon1.png` (from old archive, replaced by PWA icons)
6. Update `app/manifest.json` — add `icons` array referencing the new PNGs
7. Update `_specs` and `_plans` checklists to mark complete

## Verification

1. `pnpm dev` → browser tab shows new favicon
2. DevTools Network tab: all icon URLs return 200
3. `pnpm lint && pnpm build`
