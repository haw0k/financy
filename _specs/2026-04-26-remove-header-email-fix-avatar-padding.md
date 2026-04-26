# Spec for Remove Email From Header And Adjust Avatar Spacing

branch: refactor/remove-header-email-fix-avatar-padding

## Summary

The Header component currently displays the user's email in the left section and the avatar/dropdown in the right section. The email is not needed in the header, and the right padding between the user avatar dropdown and the container edge needs to be 16px to match the design.

## Functional Requirements

- Remove the user email display from the Header component
- Set the right padding of the Header's right section (where the avatar DropdownMenu sits) to exactly 16px from the container edge
- The Header should otherwise remain unchanged — theme toggle button and user DropdownMenu stay in place
- The DropdownMenu alignment (`align="end"`) should remain correct after the padding change

## Possible Edge Cases

- The Header is used in the dashboard layout which is server-side; no other pages use Header directly
- Very narrow viewports may need verification that the avatar doesn't overflow

## Acceptance Criteria

- [ ] User email is no longer visible in the Header
- [ ] The distance from the avatar DropdownMenu to the right edge of the page is 16px
- [ ] Theme toggle and DropdownMenu continue to work correctly
- [ ] No visual regressions on mobile or desktop

## Open Questions

- None

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Header renders without the user email text
- The avatar DropdownMenu container maintains correct right spacing
