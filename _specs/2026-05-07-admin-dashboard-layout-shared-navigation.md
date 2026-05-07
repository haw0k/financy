# Spec for Admin Dashboard Layout with Shared Navigation

branch: feat/admin-dashboard-layout-shared-navigation

## Summary

Replace the current bare admin layout at `/admin` with the same shell layout used by the non-admin dashboard: a fixed sidebar navigation (`DashboardNav`), a top header (`Header`), a mobile drawer (`MobileNav`), and a scrolling main content area. The admin navigation replaces the "Overview" item with "Registrations" (linking to the existing pending users page). The "Settings" page in the admin area should be identical to the Settings page already available to non-admin users.

## Functional Requirements

- Admin area (`/admin`) uses the same layout shell as the dashboard area (`/dashboard`): sidebar, header, and mobile nav
- Admin navigation sidebar contains two items: "Registrations" and "Settings"
- "Registrations" navigates to the existing pending user approval page (current `/admin` content)
- "Settings" renders the same `SettingsPage` component used at `/dashboard/settings`
- The header shows the app logo, user email, theme toggle, and logout button — identical to the dashboard header
- Mobile navigation mirrors the admin sidebar items (Registrations, Settings)
- Middleware protection and role checks remain unchanged for `/admin/*` routes
- The existing "Admin" link in the dashboard nav (visible to approved admins) continues to point to the admin area

## Possible Edge Cases

- Admin navigates directly to `/admin/settings` — route must exist and render the shared SettingsPage
- Admin navigates to `/admin` or `/admin/registrations` — both should show the pending users table
- Non-admin users must still be redirected away from `/admin/*` by middleware
- Mobile viewport: admin navigation must work correctly in the mobile drawer
- Deep-linking to a non-existent admin sub-route should show a not-found state

## Acceptance Criteria

- Visiting `/admin` shows the full layout (header + sidebar + content) with the pending users table
- Admin sidebar shows "Registrations" and "Settings" as the only navigation items
- Clicking "Registrations" in the sidebar navigates to the pending users page
- Clicking "Settings" in the sidebar navigates to the shared Settings page
- The Settings page at `/admin/settings` is visually and functionally identical to `/dashboard/settings`
- On mobile, the hamburger menu opens a drawer with "Registrations" and "Settings"
- All existing admin functionality (approve, reject, role checks) continues to work
- The admin area layout matches the dashboard layout visually (same spacing, same header, same sidebar styling)

## Open Questions

- Should the admin sidebar also include "Transactions" and "Categories" items? (Current assumption: no, only Registrations and Settings) Еhe admin sidebar should includes the "Categories" item.
- Should the admin header avatar display the same user info as the dashboard header? (Current assumption: yes) Yes.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Admin layout renders sidebar with Registrations and Settings navigation items
- Admin layout renders the Header component
- Registrations navigation item is highlighted when on `/admin` or `/admin/registrations`
- Settings navigation item is highlighted when on `/admin/settings`
- Admin settings page renders the shared SettingsPage component
