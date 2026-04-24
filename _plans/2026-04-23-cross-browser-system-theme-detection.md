# Plan: Cross-Browser System Theme Detection

## Context

The application uses `next-themes` with `enableSystem` and `defaultTheme="system"` for automatic system theme detection. Chrome works correctly, but Firefox fails to detect OS dark mode — users with dark mode in OS see light theme in the application.

The root cause was that `ThemeProvider` from next-themes reads saved theme from localStorage and uses it even when the user previously selected a different theme. Additionally, the initial theme class wasn't set before React hydration.

## Implementation

### Critical Files

- `app/layout.tsx` — Add inline script for cross-browser theme detection
- `components/layout/Header.tsx` — Remove theme persistence on toggle

### Changes

1. **Add inline script to `app/layout.tsx`**
   - Script runs before React hydration
   - Reads `prefers-color-scheme` using `window.matchMedia`
   - Sets `.dark` class on `<html>` element
   - Sets `colorScheme` style property

2. **Update `Header.tsx` toggle button**
   - When user toggles theme, remove `theme` key from localStorage
   - This ensures next page load uses system preference

### Result

- First load (no localStorage) → theme from OS
- Toggle theme → changes immediately but not saved
- Reload → back to OS theme

## Verification

1. Clear localStorage (`localStorage.clear()`)
2. Open page with dark OS theme → should show dark
3. Click toggle → shows light/dark based on current state
4. Reload page → returns to OS theme
