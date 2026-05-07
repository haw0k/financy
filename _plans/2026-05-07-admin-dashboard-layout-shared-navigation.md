# Plan: feat: Admin Dashboard Layout with Shared Navigation

## Spec

Link: [Admin Dashboard Layout with Shared Navigation](_specs/2026-05-07-admin-dashboard-layout-shared-navigation.md)

## Current State

- **Admin layout** (`app/admin/layout.tsx`): bare centered container with auth/role check, no sidebar, no header, no mobile nav
- **Dashboard layout** (`app/dashboard/layout.tsx`): full shell — `DashboardShell` wrapping `DashboardNav` (sidebar) + `Header` + `main` content + `MobileNav` (drawer)
- **Navigation config** (`config/navigation.config.ts`): single `navItems` array with Overview, Transactions, Categories, Settings — shared by both `DashboardNav` and `MobileNav`
- **DashboardNav** and **MobileNav**: hardcode `navItems` from config; conditionally show an "Admin" link for approved admin users
- **Routes** (`config/routes.config.ts`): `admin: '/admin'` exists, but no `/admin/settings` or `/admin/categories` sub-routes
- **Page components**: `SettingsPage` and `CategoriesPage` are already shared components used by dashboard routes

## Design Decisions

- **Admin nav items**: separate `adminNavItems` array — Registrations, Categories, Settings (no Overview, no Transactions)
- **DashboardNav / MobileNav flexibility**: add optional `items` prop; when omitted, fall back to default `navItems`. When admin items are passed, skip the "Admin" link
- **Admin sub-routes**: `/admin` stays as Registrations page; add `/admin/settings` and `/admin/categories` as new route files reusing existing shared page components
- **Middleware**: existing `/admin/*` protection already covers all new admin sub-routes — no middleware changes needed

## Implementation Steps

### Phase 1 — Configuration changes

- [ ] Add `adminSettings: '/admin/settings'` and `adminCategories: '/admin/categories'` to `config/routes.config.ts`
- [ ] Add `adminNavItems` array (`Registrations`, `Categories`, `Settings`) to `config/navigation.config.ts`

### Phase 2 — Make navigation components accept custom items

- [ ] Update `DashboardNav` to accept optional `items` prop (defaults to `navItems`); hide "Admin" link when custom items are provided
- [ ] Update `MobileNav` to accept optional `items` prop (defaults to `navItems`); hide "Admin" link when custom items are provided

### Phase 3 — Admin layout restructure

- [ ] Rewrite `app/admin/layout.tsx`: adopt the same shell structure as `app/dashboard/layout.tsx` — `DashboardShell` > `DashboardNav` (with `adminNavItems`) + `Header` + `main` + `MobileNav` (with `adminNavItems`). Keep existing auth + role checks

### Phase 4 — Admin sub-route pages

- [ ] Create `app/admin/settings/page.tsx`: metadata + re-export shared `SettingsPage`
- [ ] Create `app/admin/categories/page.tsx`: metadata + re-export shared `CategoriesPage`

### Phase 5 — Verification

- [ ] Run `pnpm lint && pnpm build` to verify no regressions
- [ ] Manual check: visit `/admin`, `/admin/settings`, `/admin/categories` — layout matches dashboard

## Critical Files

| Action | Path                                  |
| ------ | ------------------------------------- |
| Modify | `config/routes.config.ts`             |
| Modify | `config/navigation.config.ts`         |
| Modify | `components/layouts/DashboardNav.tsx` |
| Modify | `components/layouts/MobileNav.tsx`    |
| Modify | `app/admin/layout.tsx`                |
| Create | `app/admin/settings/page.tsx`         |
| Create | `app/admin/categories/page.tsx`       |

## Risks & Notes

- `DashboardNav` and `MobileNav` use `useRole()` and conditionally render an "Admin" link — when custom `items` are passed (admin context), this link must be suppressed to avoid showing "Admin" inside the admin area
- The Settings page at `/admin/settings` will show the admin user's profile (role = admin) — this is expected behavior
- Ensure the middleware continues to protect all `/admin/*` sub-routes (already handled by `pathname.startsWith(routes.admin)`)

## Definition of Done

- [ ] Admin area renders with sidebar (Registrations, Categories, Settings), header, and mobile nav
- [ ] `/admin` shows the pending users table
- [ ] `/admin/settings` renders the shared Settings page
- [ ] `/admin/categories` renders the shared Categories page
- [ ] Navigation highlighting works correctly for all admin sub-routes
- [ ] Mobile drawer shows admin nav items and works correctly
- [ ] `pnpm lint && pnpm type-check && pnpm build` passes
