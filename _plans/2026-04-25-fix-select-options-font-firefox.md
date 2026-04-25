# Plan: Fix Select Options Font in Firefox

branch: fix/select-options-font-firefox

## Context

Select dropdown options render with Times New Roman in Firefox while Chrome shows Geist Mono correctly. This is a known browser-specific issue where `<option>` elements don't properly inherit font-family from parent `<select>` in Firefox.

## Implementation

### Step 1: Add CSS rule to globals.css

Added explicit font-family for `select` and `option` elements in `app/globals.css`:

```css
select,
option {
  font-family:
    'Geist',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
```

## Verification

1. Run `pnpm dev`
2. Open `/dashboard/categories` in Firefox
3. Verify select options use Geist font (not Times New Roman)
4. Check Chrome to ensure no regression
