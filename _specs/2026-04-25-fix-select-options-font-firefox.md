# Spec for Fix Select Options Font in Firefox

branch: fix/select-options-font-firefox

## Summary

Fix inconsistent font rendering for `<select>` options across browsers. In Firefox, select options display with Times New Roman instead of the application's Geist Mono font. In Chrome, options correctly render with Geist Mono.

## Functional Requirements

- Select dropdown options should use consistent font across all browsers (Firefox, Chrome, Safari)
- Target font should match the application's typography system (Geist Mono)
- Font consistency applies to all `<select>` and `<option>` elements throughout the application

## Possible Edge Cases

- Native select elements styled with custom CSS might be affected differently than browser defaults
- Any third-party form components that render as select/dropdown
- Focus states and hover states for options
- Placeholder option (e.g., "Select type (optional)")

## Acceptance Criteria

- In Firefox, select options render with Geist Mono font
- In Chrome, select options continue to render with Geist Mono font (no regression)
- Consistent behavior across all supported browsers

## Open Questions

- Should we use CSS `font-family` override specifically for select/option, or a global fix? Let's try a global fix.
- Are there any other browser-specific styling inconsistencies that should be addressed? No

## Testing Guidelines

- Test select components in Firefox and Chrome
- Verify select dropdown options display correct font in each browser
- Check all pages containing select elements: categories form, transaction form
