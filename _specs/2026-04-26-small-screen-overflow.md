# Spec for Fix Horizontal Scroll On Small Screens

branch: fix/small-screen-overflow

## Summary

At screen widths between 320px and 350px, certain elements in the layout or components overflow the viewport width, causing a horizontal scrollbar to appear. This spec covers identifying the overflowing elements and fixing them so the layout fits without horizontal scrolling on small screens.

## Functional Requirements

- No horizontal scrollbar should appear at screen widths of 320px and wider
- All page content must be fully visible without horizontal scrolling on screens from 320px up to 350px
- The layout should not break or overlap at these narrow widths
- Existing functionality must be preserved at all other breakpoints

## Possible Edge Cases

- The overflow could be caused by fixed/absolute positioned elements (e.g., MobileNav hamburger + logo container)
- The overflow could be caused by the Header or its contents
- Very narrow screens below 320px (wearable devices) are out of scope
- The overflow might only appear on specific pages (dashboard, transactions, categories, settings)

## Acceptance Criteria

- [ ] No horizontal scrollbar at 320px viewport width
- [ ] No horizontal scrollbar at 350px viewport width
- [ ] Content is not clipped or hidden at these widths
- [ ] No regressions at wider breakpoints

## Open Questions

- Which specific pages/routes are affected by the horizontal scroll? `/dashboard*`
- Is the overflow caused by a single element or component? The overflow caused by a content in `<main>` tag

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- The dashboard page renders without horizontal overflow at 320px width
- The dashboard page renders without horizontal overflow at 350px width
