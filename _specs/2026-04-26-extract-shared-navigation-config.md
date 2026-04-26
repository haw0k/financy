# Spec for Extract Shared Navigation Config

branch: refactor/extract-shared-navigation-config

## Summary

The `navItems` array is duplicated in both `DashboardNav.tsx` and `MobileNav.tsx`. This leads to duplicated code and the risk of the two lists drifting apart. The data should be extracted to a single shared location so both components import from the same source.

## Functional Requirements

- Create a single source of truth for navigation items in `config/navigation.ts`
- Both `DashboardNav` and `MobileNav` must import from this shared config
- The exported data must include href, label, and icon for each nav item
- All existing functionality must remain unchanged after the refactor

## Possible Edge Cases

- The icon import path must work correctly from the `config/` directory
- TypeScript types must be consistent between the config and the consuming components
- Lazy loading or dynamic imports should not be affected

## Acceptance Criteria

- [ ] `config/navigation.ts` exists with the nav items array
- [ ] `DashboardNav.tsx` imports nav items from `@/config/navigation` instead of defining them locally
- [ ] `MobileNav.tsx` imports nav items from `@/config/navigation` instead of defining them locally
- [ ] TypeScript, lint, and build all pass

## Open Questions

- None

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Navigation config exports the correct number of items
- Each nav item has the required properties (href, label, icon)
- Both DashboardNav and MobileNav render all navigation links
