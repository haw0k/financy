# Spec for Update Application Logo

branch: feat/update-application-logo

## Summary

Replace the current application logo with a new SVG logo provided at `/mnt/c/Users/root/Downloads/financy-logo.svg`. The new logo should be used consistently across all places where the current logo appears, including authentication pages, the dashboard header, and any favicon or metadata references.

## Functional Requirements

- Replace the existing logo asset with the new SVG file.
- Update all components and pages that render the current logo to use the new asset.
- Ensure the new logo renders correctly in both light and dark themes.
- Preserve existing logo dimensions and layout behavior (or adjust proportionally if the new asset has a different aspect ratio).
- Verify that the logo is displayed on the login and signup pages.
- Verify that the logo is displayed in the dashboard navigation/header.
- Verify that any SEO/social metadata referencing the logo points to the new asset.

## Possible Edge Cases

- The new SVG may have a different viewBox, aspect ratio, or internal styling that conflicts with the current CSS.
- The new SVG may contain inline `fill` or `stroke` colors that do not adapt to the current theme.
- The logo file may not be accessible from the repository path and may need to be copied into the project first.
- Favicon or PWA manifest references may use a different format (e.g., `.png`, `.ico`) and need separate handling.

## Acceptance Criteria

- [ ] The new logo is visible on the login page.
- [ ] The new logo is visible on the signup page.
- [ ] The new logo is visible in the dashboard header/navigation.
- [ ] The new logo renders correctly in light mode.
- [ ] The new logo renders correctly in dark mode.
- [ ] No broken image references or 404 errors related to the logo asset.
- [ ] All existing logo usages have been updated; no stale references to the old logo remain.

## Open Questions

- Should the old logo file be deleted from the repository, or should it be kept as a backup? Remove the old logo.
- Does the new SVG require color adjustments to match the application theme in both light and dark modes? No.
- Are there any non-web contexts (e.g., email templates, PWA manifest, social share images) that also reference the logo? Replace the logo in files in `/public` and `/app` image files.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Verify that the logo component renders the new SVG asset.
- Verify that the logo appears on the login page.
- Verify that the logo appears on the signup page.
- Verify that the logo appears in the dashboard navigation/header.
