# Spec for Apply Shadcn Custom Theme

branch: feat/apply-shadcn-custom-theme

## Summary

Apply the custom shadcn theme from the external project at `/home/haw0k/shadcn/shadcn-custom-theme` to this project. The source project was generated via the shadcn create tool (https://ui.shadcn.com/create?preset=b1imILKXT6&pointer=true) with a custom olive/green-based color palette, radix-nova style, Tabler icons, and updated CSS variable definitions.

The goal is to port over the visual theme configuration (CSS variables, components.json settings, font configuration) without breaking existing functionality or page layout.

## Functional Requirements

- Update `app/globals.css` with the new CSS variable definitions from the source project's theme (light and dark mode), including the olive/green color palette, border radius scaling, and the `@theme inline` block
- Update `components.json` to reflect the new style (`radix-nova`), base color (`olive`), icon library (`tabler`), and any other relevant config changes
- Apply the new `@import "shadcn/tailwind.css"` directive in globals.css if required for the theme to render correctly
- Ensure all existing pages and components render correctly with the new theme colors
- Preserve existing shadcn component customizations (aliases pointing to `@/lib/shadcn`)
- Keep any project-specific CSS additions (e.g., the Firefox select/option font fix) that are not theme-related

## Possible Edge Cases

- The new theme may change CSS custom property names or remove some that existing components depend on
- The `radix-nova` style may introduce different component class names or styling approaches compared to `new-york`
- Dark mode contrast may differ from the current theme and could affect readability in certain components
- The Tabler icon library may have different icon names than Lucide icons currently used
- The `shadcn/tailwind.css` import may require additional dependencies or configuration
- Existing charts (Recharts) rely on `--chart-*` variables which may change appearance

## Acceptance Criteria

- `app/globals.css` is updated with the new theme variables (light and dark mode) from the source project
- `components.json` reflects the new style, base color, and icon library
- The application builds and runs without errors
- No visual regressions in existing pages: transaction list, categories, settings, dashboard overview
- Both light and dark mode render correctly with the new color palette
- All interactive elements (buttons, inputs, selects, dropdowns) are properly styled

## Open Questions

- Should we keep Lucide icons or migrate to Tabler icons as specified in the source config? Keep Lucide.
- Is the `shadcn/tailwind.css` import compatible with the current Tailwind CSS v4 / Next.js 16 setup? You decide - use contex7 to find the answer.
- Do we need to reinstall or update shadcn components after changing the style from `new-york` to `radix-nova`? You decide - use contex7 to find the answer.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Visual regression checks: verify that key CSS custom properties are defined after the theme is applied
- Verify that the application renders without console errors related to missing CSS variables
- Check that both `.dark` and `:root` theme blocks have all required CSS variables set
