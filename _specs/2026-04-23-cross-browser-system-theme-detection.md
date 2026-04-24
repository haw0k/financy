# Spec: Cross-Browser System Theme Detection

## Context

The application uses `next-themes` with `enableSystem` and `defaultTheme="system"` for automatic system theme detection. Chrome correctly detects OS dark/light mode preference and applies the matching theme. Firefox does not — when the OS is set to dark mode, Firefox renders the light theme in the application.

The root cause is that `next-themes` relies on CSS `prefers-color-scheme` media query, which Firefox handles differently from Chrome in certain configurations. Additionally, the existing ThemeScript may not be properly initialized before React hydration in Firefox.

## Goal

Ensure system theme detection works consistently across Chrome, Firefox, and other modern browsers. Users on any browser should see the theme that matches their OS preference without manual selection.

## Implementation

### Critical Files

- `app/layout.tsx` - ThemeScript initialization (already present, needs fixes)
- `components/layout/ThemeProvider.tsx` - next-themes configuration

### Changes

1. **Verify ThemeScript placement and configuration**
   - Confirm ThemeScript is placed before any script tags in the document head
   - Ensure `nonce` attribute is passed to ThemeScript if CSP is configured

2. **Add explicit system theme detection fallback**
   - Implement a media query check that works across browsers using `window.matchMedia`
   - Add a synchronous check during script initialization that reads `prefers-color-scheme` before hydration
   - Ensure the data-theme attribute is set correctly on the HTML element

3. **Update ThemeProvider with browser-compatible settings**
   - Review `disableTransitionOnChange` setting for cross-browser compatibility
   - Add `storageKey` to ensure theme preference persists correctly across browsers
   - Verify `value` mapping for theme colors handles all browser cases

4. **Add CSS fallback for browsers that don't execute ThemeScript**
   - Include a CSS media query fallback that sets the initial theme class based on `prefers-color-scheme`
   - This ensures correct theme display even if JavaScript hasn't executed yet

### Verification

1. Test in Firefox with OS dark mode — theme should automatically be dark
2. Test in Firefox with OS light mode — theme should automatically be light
3. Test switching OS theme while app is open in both Chrome and Firefox
4. Verify no theme flash on page load in both browsers
5. Run `pnpm build && pnpm start` and verify theme works in production build
6. Run `pnpm test` to ensure existing tests pass
