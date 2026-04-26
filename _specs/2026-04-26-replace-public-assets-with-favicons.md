# Spec for Replace Public Assets with App Favicons

branch: chore/replace-public-assets-with-favicons

## Summary

Replace all contents of the `public/` directory with the favicon and app icon assets from the `~/tmp/favicon-for-app.zip` archive. The archive contains SVG icons, PNG icons, a favicon.ico, and a manifest.json file.

## Functional Requirements

- Remove all existing files in the `public/` directory
- Extract the contents of `~/tmp/favicon-for-app.zip` into the `public/` directory
- Only the new assets should remain in `public/` after the operation
- The existing placeholder files (placeholder.jpg, placeholder.svg, placeholder-logo.png, placeholder-logo.svg, placeholder-user.jpg, icon-light-32x32.png, icon-dark-32x32.png, apple-icon.png, icon.svg) must be removed
- The archive contains: icon0.svg, icon1.png, favicon.ico, apple-icon.png, manifest.json

## Possible Edge Cases

- The archive may contain paths or subdirectories that need to be handled correctly
- File permissions of extracted files should match the existing public/ files
- If the extraction fails (corrupt archive), the original files should remain intact
- Git will track the deletions and additions — ensure no unintended files are included

## Acceptance Criteria

- `public/` contains only the files from the archive: icon0.svg, icon1.png, favicon.ico, apple-icon.png, manifest.json
- All previous placeholder files are removed
- The app builds and runs without errors after the replacement
- Favicon and icons are served correctly by Next.js

## Open Questions

- Does the manifest.json need to be referenced from app/layout.tsx metadata, or is Next.js convention sufficient? Please use Context7 mcp to decide - use best practices.
- Should any of the new icons be explicitly exported in metadata for the route segment config? Please use Context7 mcp to decide - use best practices.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- N/A — asset replacement has no testable logic
- Verify via `pnpm dev` that the app loads without 404s on favicon/apple-icon
