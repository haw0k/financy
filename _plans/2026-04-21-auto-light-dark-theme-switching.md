# Plan: Auto Light/Dark Theme Switching

## Context

The application already uses `next-themes` v0.4.6 with `enableSystem` and `defaultTheme="system"`. However, there is no anti-flash mechanism (ThemeScript) in the document head, causing a visible flash of incorrect theme on initial page load. The goal is to detect system color mode, apply matching theme, and listen for real-time system preference changes.

## Implementation

### Critical Files

- `app/layout.tsx` - Add ThemeScript to prevent theme flash
- `components/layout/ThemeProvider.tsx` - Already uses next-themes (no changes needed)

### Changes

1. **Add ThemeScript to layout.tsx**
   - Import `ThemeScript` from `next-themes`
   - Add `<ThemeScript />` inside `<head>` before the body renders
   - This reads system preference before React hydration, preventing flash

The existing ThemeProvider configuration is already correct:

- `attribute="class"` - toggles `.dark` class on `<html>`
- `enableSystem` - listens for system preference
- `defaultTheme="system"` - uses system preference as default

### Verification

1. Run `pnpm dev` and verify no theme flash on load
2. Change OS system theme and verify app updates immediately
3. Run `pnpm build && pnpm start` and test theme transitions
4. Run `pnpm test` to ensure existing tests pass
