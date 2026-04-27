# Plan: Extract Site Config

Spec: `_specs/2026-04-27-extract-site-config.md`
Branch: `refactor/extract-site-config`

## Context

The project name `'Financy'`, accent color `'#00A541'`, and logo text styles (`fontSize: 26px`, `fontWeight: 700`) are hardcoded in ~25 places across `app/` and `components/`. This duplication and scattering makes rebranding or theme changes risky and tedious. Follow the existing config pattern (`env.config.ts`, `routes.config.ts`) to centralize them.

## Design Decisions

- **`siteConfig` with `as const`**: Match the existing pattern in `env.config.ts` and `routes.config.ts`
- **Include logo styles**: `logoFontSize` and `logoFontWeight` in the config — repeated in 3 nav components (Header, DashboardNav, MobileNav)
- **Description**: Use a generic description `'Personal finance tracker'` for the site, and keep page-specific descriptions as-is but reference `siteConfig.name` via template literals
- **Page titles**: Use template literals: `` `${pageTitle} — ${siteConfig.name}` ``

## Changes

### 1. Create `config/site.config.ts`

```ts
export const siteConfig = {
  name: 'Financy',
  description: 'Personal finance tracker',
  accentColor: '#00A541',
  logoFontSize: '26px',
  logoFontWeight: 700,
} as const;
```

### 2. Update `config/index.ts`

Add: `export { siteConfig } from './site.config';`

### 3. Update page metadata (`app/`)

Replace string literal titles with template literals using `siteConfig.name`:

| File | Current | New |
|---|---|---|
| `app/layout.tsx:14` | `'Finance Tracker'` | `siteConfig.name` |
| `app/page.tsx:5` | `'Financy — Track Your Finances'` | `` `${siteConfig.name} — Track Your Finances` `` |
| `app/dashboard/page.tsx:5` | `'Dashboard — Financy'` | `` `Dashboard — ${siteConfig.name}` `` |
| `app/dashboard/transactions/page.tsx:5` | `'Transactions — Financy'` | `` `Transactions — ${siteConfig.name}` `` |
| `app/dashboard/categories/page.tsx:5` | `'Categories — Financy'` | `` `Categories — ${siteConfig.name}` `` |
| `app/dashboard/settings/page.tsx:5` | `'Settings — Financy'` | `` `Settings — ${siteConfig.name}` `` |
| `app/auth/login/page.tsx:5-6` | `'Login — Financy'` / `'Sign in to your Financy account'` | `` `Login — ${siteConfig.name}` `` / `` `Sign in to your ${siteConfig.name} account` `` |
| `app/auth/sign-up/page.tsx:5-6` | `'Sign Up — Financy'` / `'Create a new Financy account'` | `` `Sign Up — ${siteConfig.name}` `` / `` `Create a new ${siteConfig.name} account` `` |
| `app/auth/sign-up-success/page.tsx:5` | `'Check Your Email — Financy'` | `` `Check Your Email — ${siteConfig.name}` `` |
| `app/auth/error/page.tsx:5` | `'Error — Financy'` | `` `Error — ${siteConfig.name}` `` |

### 4. Update components (`components/`)

| File | Line(s) | Current | New |
|---|---|---|---|
| `DashboardNav.tsx` | 20, 29, 31 | `alt="Financy"`, `color: '#00A541'`, `fontSize: '26px'`, `fontWeight: 700`, `Financy` text | `alt={siteConfig.name}`, `color: siteConfig.accentColor`, `fontSize: siteConfig.logoFontSize`, `fontWeight: siteConfig.logoFontWeight`, `{siteConfig.name}` |
| `Header.tsx` | 56, 64, 66 | same pattern | same replacements |
| `MobileNav.tsx` | 37, 45, 47 | same pattern | same replacements |
| `LoginPage.tsx` | 44, 45, 46 | `alt="Financy"`, `color: '#00A541'`, `Financy` heading | same replacements |
| `SignUpPage.tsx` | 73, 74, 75 | `alt="Financy"`, `color: '#00A541'`, `Financy` heading | same replacements |
| `SettingsPage.tsx` | 55 | `'Financy v1.0'` | `` `${siteConfig.name} v1.0` `` |

### 5. Logo text style refactor

The `style={{ color: '#00A541', fontSize: '26px', fontWeight: 700 }}` pattern repeats in 3 nav files and 2 auth pages. After extracting to `siteConfig`, all 5 files will reference `siteConfig.accentColor`, `siteConfig.logoFontSize`, `siteConfig.logoFontWeight`.

### 6. Version extraction

Add `version: '1.0'` to `siteConfig` and use `{siteConfig.version}` in SettingsPage instead of hardcoded `v1.0`.

## Files Modified

- `config/site.config.ts` (new)
- `config/index.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/transactions/page.tsx`
- `app/dashboard/categories/page.tsx`
- `app/dashboard/settings/page.tsx`
- `app/auth/login/page.tsx`
- `app/auth/sign-up/page.tsx`
- `app/auth/sign-up-success/page.tsx`
- `app/auth/error/page.tsx`
- `components/layouts/DashboardNav.tsx`
- `components/layouts/Header.tsx`
- `components/layouts/MobileNav.tsx`
- `components/pages/auth/LoginPage.tsx`
- `components/pages/auth/SignUpPage.tsx`
- `components/pages/dashboard/SettingsPage.tsx`

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
- All page titles render correctly with `siteConfig.name`
- All logo texts and accent colors display properly
- No hardcoded `'Financy'` or `'#00A541'` remain in `app/` or `components/`
