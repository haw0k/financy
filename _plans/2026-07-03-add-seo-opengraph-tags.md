# Plan: feat: Add SEO and OpenGraph Tags

## Spec

Link: [Add SEO and OpenGraph Tags](_specs/2026-07-03-add-seo-opengraph-tags.md)

## Current State

The application already defines basic page metadata (`title` and `description`) on the root layout and on most page components. However, there is no centralized SEO helper, no OpenGraph or Twitter Card tags, no canonical URLs, and no site URL configuration. The `public/social-preview.png` asset exists but is not referenced anywhere in the application metadata.

## Implementation Steps

### Phase 1 — Site Configuration

- [ ] Add the site base URL and default social image path to the centralized site configuration.
- [ ] Define shared default metadata values such as title template, default description, and OpenGraph/Twitter defaults.

### Phase 2 — Shared Metadata Helper

- [ ] Create a reusable helper that builds a complete metadata object from Next.js `Metadata`.
- [ ] Ensure the helper merges page-specific overrides with shared defaults.
- [ ] Configure OpenGraph and Twitter Card tags to use `public/social-preview.png` with absolute URLs.
- [ ] Add canonical URL generation and language/robots defaults.

### Phase 3 — Page Metadata Updates

- [ ] Apply the shared helper to the root layout as the default metadata source.
- [ ] Update the home page with dedicated title, description, and OpenGraph metadata.
- [ ] Update authentication pages (login, sign-up, admin, error, pending, sign-up-success) with appropriate metadata and `noindex` robots directives.
- [ ] Update dashboard and admin pages to reuse shared defaults or explicitly skip social sharing metadata.
- [ ] Ensure each page can still provide custom titles and descriptions where needed.

### Phase 4 — Testing and Verification

- [ ] Add tests verifying that the home page renders OpenGraph and Twitter Card tags with the social preview image.
- [ ] Add tests verifying that the login page renders the correct title template and metadata.
- [ ] Add tests verifying that the signup page renders the correct title template and metadata.
- [ ] Add tests verifying that page-specific metadata overrides merge correctly with shared defaults.
- [ ] Run `pnpm check`, `pnpm type-check`, and `pnpm test:run` and fix any regressions.

## Risks & Notes

- The site URL must be configurable per environment without leaking secrets.
- Absolute URLs for OpenGraph images require a known base URL at build or request time.
- Auth pages should not be indexed by search engines, so `robots` directives must be set appropriately.
- Page-level metadata should merge with rather than fully replace shared metadata.

## Definition of Done

- [ ] A shared SEO/OpenGraph metadata helper is available in the codebase.
- [ ] `public/social-preview.png` is referenced as the default social preview image.
- [ ] Every public-facing page renders canonical, OpenGraph, and Twitter Card tags.
- [ ] Page titles follow a consistent template.
- [ ] Auth pages are marked as `noindex` where appropriate.
- [ ] Tests cover metadata rendering for the home page, login page, and signup page.
- [ ] `pnpm check`, `pnpm type-check`, and `pnpm test:run` pass.
