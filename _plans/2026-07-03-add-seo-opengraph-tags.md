# Plan: feat: Add SEO and OpenGraph Tags

## Spec

Link: [Add SEO and OpenGraph Tags](_specs/2026-07-03-add-seo-opengraph-tags.md)

## Current State

The application already defines basic page metadata (`title` and `description`) on the root layout and on most page components. However, there is no centralized SEO helper, no OpenGraph or Twitter Card tags, no canonical URLs, and no site URL configuration. The `public/social-preview.png` asset exists but is not referenced anywhere in the application metadata.

## Implementation Steps

### Phase 1 — Site Configuration

- [x] Add the site base URL and default social image path to the centralized site configuration.
- [x] Define shared default metadata values such as title template, default description, and OpenGraph/Twitter defaults.

### Phase 2 — Shared Metadata Helper

- [x] Create a reusable helper that builds a complete metadata object from Next.js `Metadata`.
- [x] Ensure the helper merges page-specific overrides with shared defaults.
- [x] Configure OpenGraph and Twitter Card tags to use `public/social-preview.png` with absolute URLs.
- [x] Add canonical URL generation and language/robots defaults.

### Phase 3 — Page Metadata Updates

- [x] Apply the shared helper to the root layout as the default metadata source.
- [x] Update the home page with dedicated title, description, and OpenGraph metadata.
- [x] Update authentication pages (login, sign-up, admin, error, pending, sign-up-success) with appropriate metadata and `noindex` robots directives.
- [x] Update dashboard and admin pages to reuse shared defaults or explicitly skip social sharing metadata.
- [x] Ensure each page can still provide custom titles and descriptions where needed.

### Phase 4 — Testing and Verification

- [x] Add tests verifying that the home page renders OpenGraph and Twitter Card tags with the social preview image.
- [x] Add tests verifying that the login page renders the correct title template and metadata.
- [x] Add tests verifying that the signup page renders the correct title template and metadata.
- [x] Add tests verifying that page-specific metadata overrides merge correctly with shared defaults.
- [x] Run `pnpm check`, `pnpm type-check`, and `pnpm test:run` and fix any regressions.

## Risks & Notes

- The site URL must be configurable per environment without leaking secrets.
- Absolute URLs for OpenGraph images require a known base URL at build or request time.
- Auth pages should not be indexed by search engines, so `robots` directives must be set appropriately.
- Page-level metadata should merge with rather than fully replace shared metadata.

## Definition of Done

- [x] A shared SEO/OpenGraph metadata helper is available in the codebase.
- [x] `public/social-preview.png` is referenced as the default social preview image.
- [x] Every public-facing page renders canonical, OpenGraph, and Twitter Card tags.
- [x] Page titles follow a consistent template.
- [x] Auth pages are marked as `noindex` where appropriate.
- [x] Tests cover metadata rendering for the home page, login page, and signup page.
- [x] `pnpm check`, `pnpm type-check`, and `pnpm test:run` pass.
