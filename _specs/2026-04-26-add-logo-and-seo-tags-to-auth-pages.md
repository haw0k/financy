# Spec for Add Logo and SEO Tags to Login and Signup Pages

branch: feat/add-logo-and-seo-tags-to-auth-pages

## Summary

Add the app logo (icon.svg), the "Financy" app title, and page-specific SEO metadata (title, description) to the Login and Signup pages. Currently both pages have no branding and rely on the root layout's generic metadata.

## Functional Requirements

- Login page must display the app logo (from `/icon.svg`) and "Financy" title above the login form
- Signup page must display the app logo and "Financy" title above the signup form
- The logo should be visually prominent (larger than the nav icon), placed above the form title
- Login page must have its own SEO metadata: `<title>` "Login — Financy", `<meta name="description">` describing the login page
- Signup page must have its own SEO metadata: `<title>` "Sign Up — Financy", `<meta name="description">` describing the signup page
- The current root layout metadata should remain as the default fallback
- The SEO metadata must be set at the route segment level using Next.js `metadata` export

## Possible Edge Cases

- Both pages are `'use client'` components, so metadata cannot be exported from them directly — must use the route page files (`app/auth/login/page.tsx`, `app/auth/sign-up/page.tsx`) or add a wrapper
- The route segments (`app/auth/login/page.tsx`) currently are thin re-exports of client components — they need to be restructured to support metadata export
- Logo size should be responsive (smaller on mobile, larger on desktop)
- The logo and title should respect the current theme (light/dark mode) — the SVG uses hardcoded #00A541 green, should display correctly on both themes

## Acceptance Criteria

- Login page shows the logo and "Financy" heading above the form
- Signup page shows the logo and "Financy" heading above the form
- Login page `<title>` is "Login — Financy"
- Signup page `<title>` is "Sign Up — Financy"
- Both pages have appropriate `<meta name="description">` tags
- The logo is the app's icon.svg rendered at a larger size (e.g., 48x48 or 64x64)
- All existing form functionality continues to work

## Open Questions

- Should the page.tsx files be restructured to server components with inline metadata, or should a metadata export be added differently? Add inline metadata to page.tsx.
- Should the logo link back to the home page (/) or be non-interactive? be non-interactive

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Login page renders the logo image
- Signup page renders the logo image
- Page title contains the correct text on each page
