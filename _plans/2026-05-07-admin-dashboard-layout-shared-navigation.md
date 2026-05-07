# Plan: feat: Admin Dashboard Layout with Shared Navigation

## Spec

Link: [Admin Dashboard Layout with Shared Navigation](_specs/2026-05-07-admin-dashboard-layout-shared-navigation.md)

## Current State

- **Admin layout** (`app/admin/layout.tsx`): bare centered container with auth/role check, no sidebar, no header, no mobile nav
- **Dashboard layout** (`app/dashboard/layout.tsx`): full shell — `DashboardShell` wrapping `DashboardNav` (sidebar) + `Header` + `main` content + `MobileNav` (drawer)
- **Navigation config** (`config/navigation.config.ts`): single `navItems` array with Overview, Transactions, Categories, Settings — shared by both `DashboardNav` and `MobileNav`
- **DashboardNav** and **MobileNav**: hardcode `navItems` from config; conditionally show an "Admin" link for approved admin users
- **Routes** (`config/routes.config.ts`): `admin: '/admin'` exists, but no `/admin/dashboard`, `/admin/settings`, or `/admin/categories` sub-routes
- **Page components**: `SettingsPage` and `CategoriesPage` are already shared components used by dashboard routes
- **No route groups**: all routes are flat under `app/`

## Design Decisions

- **Admin nav items**: separate `adminNavItems` array — Dashboard (`/admin/dashboard`), Categories (`/admin/categories`), Settings (`/admin/settings`)
- **Shared AppShell component**: client component using `usePathname()` to auto-select nav items based on path prefix (`/admin` vs `/dashboard`). Renders `DashboardShell` > flex container > `DashboardNav` + `Header` + `main` + `MobileNav`.
- **Route groups**:
  - `(app)` — colocalizes `dashboard/` and `admin/` under one shared layout that checks auth and renders `<AppShell>`
  - `(auth)` — isolates public auth pages (`login`, `sign-up`, etc.) from protected routes
- **`/admin` redirect**: `app/(app)/admin/page.tsx` uses server-side `redirect()` to `/admin/dashboard`
- **Admin role check**: remains in `app/(app)/admin/layout.tsx` as defense-in-depth (middleware already enforces it)
- **Dashboard layout**: the old `app/dashboard/layout.tsx` is removed — auth check moves to `(app)/layout.tsx`
- **DashboardNav / MobileNav flexibility**: add optional `items` prop; fall back to default `navItems` when omitted; suppress "Admin" link when custom items are provided

## Route Group Structure

```
app/
  layout.tsx                         ← root layout (ThemeProvider, SonnerToaster)
  (auth)/
    layout.tsx                       ← optional thin layout for auth pages
    auth/
      login/page.tsx
      sign-up/page.tsx
      admin/page.tsx
      pending/page.tsx
      callback/route.ts
      error/page.tsx
      sign-up-success/page.tsx
  (app)/
    layout.tsx                       ← auth check + <AppShell user={user}>{children}</AppShell>
    dashboard/
      page.tsx                       ← /dashboard (Overview)
      transactions/page.tsx
      categories/page.tsx
      settings/page.tsx
    admin/
      layout.tsx                     ← role + status check, returns {children}
      page.tsx                       ← redirect /admin → /admin/dashboard
      dashboard/page.tsx             ← pending-users table
      categories/page.tsx            ← shared CategoriesPage
      settings/page.tsx              ← shared SettingsPage
  page.tsx                           ← landing page
  robots.ts
  manifest.json
```

## Implementation Steps

### Phase 1 — Configuration changes

- [ ] Add `adminDashboard: '/admin/dashboard'`, `adminCategories: '/admin/categories'`, `adminSettings: '/admin/settings'` to `config/routes.config.ts`
- [ ] Add `adminNavItems` array (`Dashboard`, `Categories`, `Settings`) to `config/navigation.config.ts`
- [ ] Re-export `adminNavItems` from `config/index.ts`

### Phase 2 — Make navigation components accept custom items

- [ ] Update `DashboardNav`:
  - Add optional `items?: INavItem[]` prop
  - When `items` provided: use it for rendering links; suppress the conditional "Admin" link
  - When `items` omitted: fall back to default `navItems`; show "Admin" link for approved admins
- [ ] Update `MobileNav`: same changes as `DashboardNav`

### Phase 3 — Create shared AppShell component

- [ ] Create `components/layouts/AppShell.tsx` (client component):
  - Props: `user: User`, `children: ReactNode`
  - Uses `usePathname()` to detect `/admin` prefix → selects `adminNavItems` vs `navItems`
  - Renders the shell: `<DashboardShell>` > flex container > `<DashboardNav items={...}>` + `<Header user={user}>` + `<main>` + `<MobileNav items={...}>`
- [ ] Export `AppShell` from `components/layouts/index.ts`

### Phase 4 — Create route groups and move files

- [ ] Create `app/(auth)/layout.tsx` — optional minimal layout for auth pages
- [ ] Move `app/auth/*` → `app/(auth)/auth/*`
- [ ] Create `app/(app)/layout.tsx` — server component:
  - Checks user exists via `supabase.auth.getUser()`, redirects to login if not
  - Renders `<AppShell user={user}>{children}</AppShell>`
- [ ] Move `app/dashboard/` → `app/(app)/dashboard/`
  - Remove `layout.tsx` after move (auth check + shell are now in `(app)/layout.tsx`)
- [ ] Move `app/admin/` → `app/(app)/admin/`

### Phase 5 — Admin section: redirect, dashboard route, and shared pages

- [ ] Replace `app/(app)/admin/page.tsx`: `redirect(routes.adminDashboard)` instead of re-exporting `AdminPage`
- [ ] Update `app/(app)/admin/layout.tsx`: keep role + status check, return `{children}` (no wrapper div — `AppShell` provides the shell)
- [ ] Create `app/(app)/admin/dashboard/page.tsx`: metadata + re-export `AdminPage`
- [ ] Create `app/(app)/admin/categories/page.tsx`: metadata + re-export shared `CategoriesPage`
- [ ] Create `app/(app)/admin/settings/page.tsx`: metadata + re-export shared `SettingsPage`

### Phase 6 — Verification

- [ ] Run `pnpm type-check && pnpm lint` — ensure no errors
- [ ] Run `pnpm build` — verify build succeeds
- [ ] Manual check:
  - `/admin` → redirects to `/admin/dashboard`
  - `/admin/dashboard` → full shell + pending users table
  - `/admin/categories` → full shell + shared categories page
  - `/admin/settings` → full shell + shared settings page
  - Nav highlighting works for all admin sub-routes
  - Mobile drawer shows correct items for admin
  - `/dashboard` and all dashboard sub-routes work as before
  - `/auth/*` pages are accessible without auth

## Critical Files

| Action  | Path                                        |
| ------- | ------------------------------------------- |
| Modify  | `config/routes.config.ts`                   |
| Modify  | `config/navigation.config.ts`               |
| Modify  | `config/index.ts`                           |
| Modify  | `components/layouts/DashboardNav.tsx`       |
| Modify  | `components/layouts/MobileNav.tsx`          |
| Create  | `components/layouts/AppShell.tsx`           |
| Modify  | `components/layouts/index.ts`               |
| Create  | `app/(auth)/layout.tsx`                     |
| Move    | `app/auth/*` → `app/(auth)/auth/*`          |
| Create  | `app/(app)/layout.tsx`                      |
| Move    | `app/dashboard/*` → `app/(app)/dashboard/*` |
| Delete  | `app/(app)/dashboard/layout.tsx`            |
| Move    | `app/admin/*` → `app/(app)/admin/*`         |
| Replace | `app/(app)/admin/page.tsx`                  |
| Replace | `app/(app)/admin/layout.tsx`                |
| Create  | `app/(app)/admin/dashboard/page.tsx`        |
| Create  | `app/(app)/admin/categories/page.tsx`       |
| Create  | `app/(app)/admin/settings/page.tsx`         |

## Files NOT Changed

- `lib/supabase/middleware.ts` — already protects `/admin/*` via `startsWith(routes.admin)`
- `proxy.ts` — matcher already covers `/admin/:path*` and `/dashboard/:path*`
- `components/pages/admin/AdminPage.tsx` — path-independent, fetches `/api/admin/pending-users`
- `components/pages/dashboard/*` — already layout-agnostic shared components
- API routes under `app/api/admin/*` — no path dependency
- `useRole` hook, `DashboardShell`, `Header` — no changes needed

## Risks & Notes

- **File moves**: Git will detect renames. Internal imports use `@/` aliases and stay valid.
- **`usePathname()` in AppShell**: returns resolved path (excludes route group segment), so `pathname.startsWith('/admin')` works correctly.
- **Dashboard layout removal**: the old `app/dashboard/layout.tsx` checks user exists and renders shell — both responsibilities move to `(app)/layout.tsx`. No logic is lost.
- **Admin layout defense-in-depth**: the server-side role check in `admin/layout.tsx` is preserved. It now returns `{children}` without a wrapper since `(app)/layout.tsx` provides the shell.

## Definition of Done

- [ ] Admin area renders with sidebar (Dashboard, Categories, Settings), header, and mobile nav
- [ ] `/admin` redirects to `/admin/dashboard`
- [ ] `/admin/dashboard` shows the pending users table
- [ ] `/admin/settings` renders the shared Settings page
- [ ] `/admin/categories` renders the shared Categories page
- [ ] Navigation highlighting works correctly for all admin sub-routes
- [ ] Mobile drawer shows admin nav items and works correctly
- [ ] All existing `/dashboard/*` routes continue to work
- [ ] All existing `/auth/*` routes continue to work
- [ ] `pnpm lint && pnpm type-check && pnpm build` passes
