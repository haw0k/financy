# Plan: Replace Public Assets with App Favicons

branch: chore/replace-public-assets-with-favicons

## Context

The `public/` directory contains 9 unused placeholder files that were never referenced. The archive `~/tmp/favicon-for-app.zip` provides real favicon and app icon assets. Next.js auto-detects icon files (`favicon.ico`, `icon.*`, `apple-icon.*`) only when placed in `app/`, not `public/`. The `manifest.json` must be explicitly referenced via metadata config.

## Findings from Context7

- `favicon.ico` → auto-detected only when placed at `app/favicon.ico`
- `icon.*`, `apple-icon.*` → auto-detected when placed in `app/**/*`
- `manifest.json` → NOT auto-detected, must be linked via `metadata.manifest`
- `public/` files are not auto-detected for icons/metadata

## Changes

### 1. Delete all files from `public/`

Remove: `apple-icon.png`, `icon-dark-32x32.png`, `icon-light-32x32.png`, `icon.svg`, `placeholder-logo.png`, `placeholder-logo.svg`, `placeholder-user.jpg`, `placeholder.jpg`, `placeholder.svg`.

### 2. Extract archive assets to correct locations

| Archive file | Destination | Reasoning |
|---|---|---|
| `favicon.ico` | `app/favicon.ico` | Auto-detected by Next.js (must be app/ top-level) |
| `apple-icon.png` | `app/apple-icon.png` | Auto-detected by Next.js |
| `icon0.svg` | `app/icon.svg` (renamed) | Auto-detected as app icon; renamed per Next.js convention |
| `icon1.png` | `public/icon1.png` | Served as static asset |
| `manifest.json` | `public/manifest.json` | Served from public, referenced via metadata |

### 3. Update `app/layout.tsx`

Add `manifest` field to the existing `metadata` export:
```ts
export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Track your income and expenses with ease',
  manifest: '/manifest.json',
};
```

## Files Modified

- [app/layout.tsx](app/layout.tsx) — add `manifest` to metadata
- `public/*` — delete 9 files, add `icon1.png` and `manifest.json`
- `app/favicon.ico` — new
- `app/apple-icon.png` — new
- `app/icon.svg` — new (renamed from `icon0.svg`)

## Verification

1. Clear `public/` and place files as described
2. `pnpm dev` → check browser tab shows favicon, no 404s in DevTools Network tab for `/favicon.ico`, `/apple-icon.png`, `/icon.svg`
3. `pnpm lint && pnpm build`
