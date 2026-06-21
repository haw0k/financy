# Spec for Polish Application Styling With Frontend-Design Plugin

branch: feat/frontend-design-styling

## Summary

Refine the application's visual appearance using the `frontend-design` plugin, focusing on the areas outlined in the Styling section of TODO.md. The goal is a more polished, consistent UI by improving button and card styles, typography, and color usage without changing functionality.

## Functional Requirements

- Improve button styles across auth and dashboard pages (primary/secondary states, hover/focus feedback, consistent sizing).
- Refine card component styles (spacing, shadows, borders, radius) used in dashboard and admin views.
- Review and adjust font choices and typographic hierarchy (headings, body text, labels).
- Audit and standardize color usage for light and dark themes, ensuring sufficient contrast.
- Apply changes through the `frontend-design` plugin workflow where applicable.
- Keep all existing layouts and interactions intact.

## Possible Edge Cases

- Dark/light theme differences causing color contrast regressions.
- Shadcn/ui base theme variables conflicting with custom overrides.
- Mobile breakpoints affecting spacing/sizing of restyled components.
- Focus-visible states must remain accessible after style changes.

## Acceptance Criteria

- All buttons, cards, and key surfaces visually align with the updated design direction.
- No functional regressions in auth, dashboard, admin, or settings flows.
- Theme switching continues to work correctly after color/font changes.
- Visual changes are consistent across major viewports.
- TODO.md Styling item can be marked complete.

## Open Questions

- Which specific `frontend-design` plugin presets or tokens should be used? Use Claude Code frontend-design@claude-plugins-official
- Should the changes be scoped to shadcn/ui variables, Tailwind config, or both? Both
- Are there any components that should be excluded from restyling? No

## Testing Guidelines

Create lightweight visual/regression tests where feasible:

- Snapshot or render tests for updated Button and Card variants in both themes.
- Smoke tests verifying navigation, auth forms, and dashboard still render without errors.
- Manual verification checklist for light/dark mode and responsive breakpoints.
