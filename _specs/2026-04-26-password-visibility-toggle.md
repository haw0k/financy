# Spec for Password Visibility Toggle

branch: feat/password-visibility-toggle

## Summary

Add a toggle button with an eye icon to the Password and Repeat Password input fields on the Login and Signup pages, allowing users to show or hide the entered password text.

## Functional Requirements

- Each password input field (Password and Repeat Password) must include a clickable icon button inside the field
- The icon should toggle between an "eye" (show password) and "eye-off" (hide password) state
- Default state: password hidden (eye-off icon, `type="password"`)
- Clicking the toggle switches between `type="password"` and `type="text"`
- The toggle button must be visually positioned inside the input field (typically at the right edge)
- Must work on both Login and Signup pages
- Must work for both the Password field and the Repeat Password field on Signup
- The toggle must be accessible via keyboard (focusable, activatable with Enter/Space)
- The toggle should have an `aria-label` to describe its action (e.g., "Show password" / "Hide password")

## Possible Edge Cases

- Toggling visibility should not reset or clear the input value
- The input should maintain its focus state after toggling
- Autofill behavior should not be affected by the toggle
- The toggle icon must be distinguishable in all theme variants (light/dark mode)
- Screen readers must be able to identify the current state (password visible or hidden)
- Copy-pasting should work normally regardless of visibility state
- The eye icon position should not overlap with other input adornments (e.g., validation icons, if any)

## Acceptance Criteria

- Login page: Password field has working visibility toggle
- Signup page: Password field has working visibility toggle
- Signup page: Repeat Password field has working visibility toggle
- Toggling one field does not affect the other
- Each toggle correctly reflects the current visibility state of its own field
- All existing functionality (form validation, submission) continues to work

## Open Questions

- Should the toggle also be added to other password fields in the app (e.g., settings/change password) in the future? Yes.
- Is there an existing UI component library being used for the input fields, or should the toggle be custom-built? Create custom UI component PasswordField in components/ui with barrel file.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Toggle changes input type from password to text and back
- Eye/eye-off icons swap correctly on toggle
- Toggle is accessible via keyboard
- Both fields on signup page work independently
