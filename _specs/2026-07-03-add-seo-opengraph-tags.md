# Spec for Add SEO and OpenGraph Tags

branch: feat/add-seo-opengraph-tags

## Summary

Add comprehensive SEO metadata to the application, including OpenGraph and Twitter Card tags. The existing `public/social-preview.png` image should be used as the social preview image across all public-facing pages.

## Functional Requirements

- Extend the central site configuration with SEO-relevant fields such as site URL, default title template, and default OpenGraph/Twitter metadata.
- Add canonical URLs, language, and robots metadata to all public pages.
- Add OpenGraph metadata including `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`, and `og:image` pointing to `public/social-preview.png`.
- Add Twitter Card metadata including `twitter:title`, `twitter:description`, and `twitter:image` pointing to `public/social-preview.png`.
- Ensure metadata is applied consistently across public routes: home page, authentication pages, and any marketing or landing pages.
- Allow individual pages to override shared defaults when necessary.
- Use absolute URLs for OpenGraph and Twitter images.

## Possible Edge Cases

- The site URL may differ between development, staging, and production environments.
- The social preview image path must resolve correctly when the application is deployed under a custom domain or subpath.
- Pages that already define metadata should merge with the shared defaults rather than replace them entirely.
- The OpenGraph image dimensions and aspect ratio should match the recommended 1200×630 pixels for optimal social sharing.
- Some pages may not need indexing (e.g., authentication or admin pages) and should expose appropriate `robots` directives.

## Acceptance Criteria

- [ ] A shared SEO/OpenGraph metadata helper is available in the codebase.
- [ ] The `public/social-preview.png` image is referenced as the default social preview image.
- [ ] Every public-facing page renders canonical, OpenGraph, and Twitter Card tags in the HTML `<head>`.
- [ ] Page titles follow a consistent template such as `Page Title | Site Name`.
- [ ] The home page has a dedicated title, description, and social preview metadata.
- [ ] Authentication pages have appropriate metadata without encouraging indexing.
- [ ] Admin and dashboard pages either reuse defaults or explicitly omit social sharing metadata.
- [ ] The generated metadata passes basic validation (title length, description length, absolute image URL).
- [ ] Tests verify that metadata is rendered correctly for at least the home page, login page, and signup page.

## Open Questions

- Should the site URL come from an environment variable or from `site.config.ts`? from an environment variable
- Should authentication pages be marked as `noindex`? Yes
- Do we need separate social preview images for specific pages, or is a single default image sufficient? a single default image is sufficient

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Verify that the home page renders OpenGraph and Twitter Card tags with the social preview image.
- Verify that the login page renders the correct title template and metadata.
- Verify that the signup page renders the correct title template and metadata.
- Verify that the metadata helper merges page-specific overrides with shared defaults.
