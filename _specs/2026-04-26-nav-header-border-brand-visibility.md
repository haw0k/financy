# Spec for Fix DashboardNav Border, Brand Visibility, and Mobile Logo Position

branch: fix/nav-header-border-brand-visibility

## Summary

The DashboardNav right border creates an unnecessary visual line between the sidebar and the Header. The green "Financy" brand text is hidden on screens ≤1023px but should always be visible. On mobile (≤767px), the full DashboardNav is replaced by MobileNav, but the brand logo and app name are missing next to the hamburger button — they need to be added with 16px spacing.

## Functional Requirements

- Remove the right border from DashboardNav (the vertical line between the sidebar and the Header)
- The "Financy" brand text must remain visible at all screen widths (remove the `lg:` breakpoint hiding it)
- On mobile (≤767px), the MobileNav hamburger button must be followed by the Financy logo and app name link with exactly 16px gap between them

## Possible Edge Cases

- Removing the border may affect visual separation on desktop — consider if a lighter subtle border or shadow is needed, or if the border removal is total
- The brand text in MobileNav should match the styling of the text in DashboardNav (color, font size, weight)
- The logo link should navigate to `/dashboard` like in DashboardNav
- Ensure the mobile brand link is not overlapped by the fixed hamburger on very narrow screens (320px)

## Acceptance Criteria

- [ ] No right border on DashboardNav (no visual line between sidebar and Header)
- [ ] "Financy" text is visible at all breakpoints, including ≤1023px
- [ ] On mobile (≤767px), MobileNav shows: [hamburger] — 16px — [icon + "Financy" text link]
- [ ] Tapping the logo link on mobile navigates to `/dashboard`
- [ ] No visual regressions on desktop (≥768px)

## Open Questions

- Should the Header's bottom border remain, or should we also remove it for a cleaner look? The Header's bottom border remains.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- DashboardNav has no right border class
- "Financy" brand text is visible across all breakpoints
- MobileNav displays the logo + brand link on mobile viewports
