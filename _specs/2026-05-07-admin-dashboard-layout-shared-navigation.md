# Spec for Admin Dashboard Layout with Shared Navigation

branch: feat/admin-dashboard-layout-shared-navigation

## Summary

Replace the current bare admin layout at `/admin` with the same shell layout used by the non-admin dashboard: a fixed sidebar navigation, a top header, a mobile drawer, and a scrolling main content area. The pending-users table moves to `/admin/dashboard` (labeled "Dashboard" in nav), and `/admin` redirects there. The "Settings" and "Categories" pages are identical to those already available to non-admin users. The file tree is organized with Next.js Route Groups: `(app)` for protected routes and `(auth)` for public auth pages.

## Functional Requirements

- Admin area (`/admin`) redirects to `/admin/dashboard`
- Admin navigation sidebar contains three items: "Dashboard", "Categories", "Settings"
- "Dashboard" (`/admin/dashboard`) renders the pending-user approval table
- "Categories" (`/admin/categories`) renders the same `CategoriesPage` component used at `/dashboard/categories`
- "Settings" (`/admin/settings`) renders the same `SettingsPage` component used at `/dashboard/settings`
- The admin shell layout (sidebar, header, mobile nav) is structurally identical to the dashboard shell — both use a shared `AppShell` component
- The header shows the app logo, user email, theme toggle, and logout button — same as the dashboard header
- Mobile navigation mirrors the admin sidebar items (Dashboard, Categories, Settings)
- Middleware protection and role checks remain unchanged for `/admin/*` routes
- The existing "Admin" link in the dashboard nav (visible to approved admins) continues to point to `/admin`
- Project uses `(app)` route group for protected routes and `(auth)` route group for public auth pages

## Possible Edge Cases

- Admin navigates to `/admin` → redirects to `/admin/dashboard`
- Admin navigates directly to `/admin/settings` or `/admin/categories` — routes work and render shared page components
- Non-admin users must still be redirected away from `/admin/*` by middleware
- Mobile viewport: admin navigation must work correctly in the mobile drawer
- Deep-linking to a non-existent admin sub-route should show a not-found state
- Route group restructuring must not break existing `/dashboard/*` or `/auth/*` routes

## Acceptance Criteria

- Visiting `/admin` redirects to `/admin/dashboard`
- `/admin/dashboard` shows the full layout (header + sidebar + content) with the pending users table
- Admin sidebar shows "Dashboard", "Categories", and "Settings" as navigation items
- "Dashboard" nav item is highlighted when on `/admin/dashboard`
- "Categories" nav item is highlighted when on `/admin/categories`
- "Settings" nav item is highlighted when on `/admin/settings`
- The Settings page at `/admin/settings` is visually and functionally identical to `/dashboard/settings`
- The Categories page at `/admin/categories` is visually and functionally identical to `/dashboard/categories`
- On mobile, the hamburger menu opens a drawer with "Dashboard", "Categories", "Settings"
- All existing admin functionality (approve, reject, role checks) continues to work
- The admin area layout matches the dashboard layout visually (same spacing, same header, same sidebar styling)

## Open Questions

- Should the admin header avatar display the same user info as the dashboard header? Yes.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Admin layout renders sidebar with Dashboard, Categories, and Settings navigation items
- Admin layout renders the Header component
- Dashboard navigation item is highlighted when on `/admin/dashboard`
- Categories navigation item is highlighted when on `/admin/categories`
- Settings navigation item is highlighted when on `/admin/settings`
- `/admin` redirects to `/admin/dashboard`
- Admin settings page renders the shared SettingsPage component
- Admin categories page renders the shared CategoriesPage component
