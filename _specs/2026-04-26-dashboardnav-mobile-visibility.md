# Spec for Fix DashboardNav Visibility On Mobile Breakpoint

branch: fix/dashboardnav-mobile-visibility

## Summary

At screen widths of 767px and below, the DashboardNav component is hidden from view, making it impossible for users to navigate the application. This spec covers making DashboardNav accessible on mobile viewports so users can navigate without needing a larger screen.

## Functional Requirements

- DashboardNav must remain visible and functional at screen widths of 767px and below
- Use a responsive pattern (e.g., hamburger menu / bottom navigation / collapsible sidebar) that fits mobile viewports without cluttering the layout
- Navigation links must be tappable with adequate touch targets (minimum 44x44px)
- The mobile navigation must not overlap or obstruct page content when closed
- Preserve all existing navigation items; do not hide or remove any links on mobile

## Possible Edge Cases

- Very narrow screens (320px width, e.g., older phones)
- Landscape orientation on mobile devices
- Screen widths between 768px and the current breakpoint where DashboardNav switches between mobile and desktop layouts
- DashboardNav contains long label text that may overflow on small screens
- Page content underneath should not shift or jump when the mobile menu opens/closes
- Active/current page indicator should still work in mobile mode

## Acceptance Criteria

- [ ] Opening the mobile menu is intuitive (e.g., a hamburger icon or bottom nav bar is visible at ≤767px)
- [ ] All navigation links from DashboardNav are reachable via the mobile UI
- [ ] The mobile navigation closes after selecting a link
- [ ] Tapping outside the navigation closes it
- [ ] No visual regressions on desktop (≥768px) viewports

## Open Questions

- Should we use a slide-in drawer, a bottom navigation bar, or a dropdown/hamburger menu? a slide-in drawer
- Should the mobile nav auto-hide on scroll for more screen real estate? yes
- Does the current DashboardNav component already have any responsive markup or CSS classes that we should extend? Check it.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- DashboardNav renders on mobile viewport widths (≤767px)
- All navigation links are accessible from the mobile menu
- Tapping a navigation link navigates to the correct route and closes the menu
