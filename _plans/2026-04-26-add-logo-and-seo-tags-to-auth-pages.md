# Plan: Add Logo and SEO Tags to Login and Signup Pages

branch: feat/add-logo-and-seo-tags-to-auth-pages

## Context

Login and Signup pages currently have no app branding. Login shows "Finance Tracker" as `<h1>`, signup shows only "Sign up" as `CardTitle`. Both use root layout's generic metadata. Need to add the app logo (`/icon.svg`), "Financy" title, and page-specific `<title>` and `<meta description>`.

## Changes

### 1. `app/auth/login/page.tsx` — add metadata

Replace `export { default } from '@/components/pages/auth/LoginPage'` with a server component that exports metadata and renders the client component.

### 2. `app/auth/sign-up/page.tsx` — add metadata

Same pattern — export `metadata` with `title: 'Sign Up — Financy'` and description.

### 3. LoginPage — add logo + title

Replace `<h1>Finance Tracker</h1>` with logo (`/icon.svg`, 48×48 via `next/image`) + "Financy" heading.

### 4. SignUpPage — add logo + title

Add branding logo + "Financy" above or inside the Card, above the "Sign up" title.

## Files Modified

- `app/auth/login/page.tsx`
- `app/auth/sign-up/page.tsx`
- `components/pages/auth/LoginPage.tsx`
- `components/pages/auth/SignUpPage.tsx`

## Verification

1. `pnpm dev`, check `/auth/login` — logo + "Financy" visible, title is "Login — Financy"
2. Check `/auth/sign-up` — logo + "Financy" visible, title is "Sign Up — Financy"
3. Check `meta description` in page source
4. `pnpm lint && pnpm build`
