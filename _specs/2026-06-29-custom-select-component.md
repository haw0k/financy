# Spec for Custom Select Component

branch: feat/custom-select-component

## Summary

Add a reusable custom Select UI component built on top of the existing shadcn/ui Select primitive located at `lib/shadcn/Select.tsx`. The original shadcn/ui Select source must remain unchanged so that future library updates can be applied cleanly. All project-specific behavior, styling, accessibility enhancements, or composition defaults should live in a new component placed under `components/ui/Select.tsx`.

## Functional Requirements

- Create a new custom Select component under `components/ui/Select.tsx` that is based on `lib/shadcn/Select.tsx`.
- Restore and preserve the original source code of `lib/shadcn/Select.tsx` exactly as it exists in the repository.
- The new custom component should expose the same composable public API as the shadcn/ui primitive so existing call sites can migrate without breaking composition patterns.
- Apply only project-specific customization, defaults, or behavior inside the new component; do not embed implementation logic in the original shadcn/ui file.
- Follow the repository’s naming, Hungarian notation, import order, and formatting conventions defined in `CLAUDE.md`.
- Add tests under `tests/` that validate the new component renders, composes, and behaves correctly.
- Run lint, format, and type checks after creation.

## Possible Edge Cases

- A future update to the shadcn/ui library could modify `lib/shadcn/Select.tsx`; the original file should stay replaceable without losing project customizations.
- Callers may still import from `lib/shadcn/Select` while others import from `components/ui/Select`; both should coexist safely during migration.
- The custom component must preserve the same type safety, ref forwarding, and accessibility behavior as the underlying primitive.
- Styling overrides in the custom component should not conflict with ThemeProvider or dark mode.

## Acceptance Criteria

- `lib/shadcn/Select.tsx` is identical to its original content before this feature (no unintended diff).
- `components/ui/Select.tsx` exists and exports a working custom Select component.
- The custom Select can be composed using the same sub-components as the shadcn/ui primitive.
- `pnpm check` passes without errors.
- `pnpm type-check` passes.
- Tests in `tests/` pass for the new component.

## Open Questions

- What project-specific behavior or styling is required beyond a thin wrapper around the shadcn/ui primitive? Use the same height as inputs and buttons
- Should existing usages of `lib/shadcn/Select` be migrated to `components/ui/Select` in this task or in a follow-up refactor? Create `components/ui/StyledSelect` and replace all `Select` to `StyledSelect`.

## Testing Guidelines

Create a test file(s) in the `tests/` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- The custom Select renders with a trigger, label, and selectable items.
- Selecting an item invokes the value change handler and updates the displayed value.
- The component remains keyboard accessible for opening, navigating, and selecting options.
