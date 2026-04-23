# Plan: Cross-Browser System Theme Detection

## Context

The application uses `next-themes` with `enableSystem` and `defaultTheme="system"` for automatic system theme detection. Chrome works correctly, but Firefox fails to detect OS dark mode — users with dark mode in OS see light theme in the application.

The root cause is that **ThemeScript is missing from `app/layout.tsx`**. This script is essential for:
- Reading system preference before React hydration
- Preventing theme flash
- Ensuring consistent behavior across browsers

Current layout.tsx does NOT include ThemeScript, relying only on the client-side ThemeProvider which fails in Firefox.

## Implementation

### Critical Files

- `app/layout.tsx` — Add ThemeScript for cross-browser SSR theme detection
- `components/layout/ThemeProvider.tsx` — Already correct, no changes needed

### Changes

1. **Add ThemeScript to `app/layout.tsx`**
   - Import `ThemeScript` from `next-themes`
   - Add `<ThemeScript />` inside `<head>` tag
   - Place it before any other scripts for earliest possible execution
   - This enables next-themes to read `prefers-color-scheme` before hydration

2. **Update ThemeProvider props in `app/layout.tsx`**
   - Remove `disableTransitionOnChange` prop — it can interfere with theme detection
   - Add `enableColorScheme={true}` for browsers to respect theme

Note: `components/layout/ThemeProvider.tsx` is a thin wrapper and needs no changes.

## Verification

1. `pnpm dev` — Start dev server
2. Test in Firefox with OS dark mode — theme should automatically be dark
3. Test in Firefox with OS light mode — theme should automatically be light
4. Test in Chrome to confirm it still works
5. Test switching OS theme while app is open in both browsers
6. Verify no theme flash on page load
7. `pnpm test` — Run existing tests