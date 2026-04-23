# Spec for Extract Shared Interfaces from Layout Components

branch: feature/extract-shared-interfaces-layout

## Summary

Analyze TypeScript interfaces in `./components/layout/*.tsx` files, identify interfaces shared by 2+ components, and consolidate duplicate interfaces into a centralized `./interfaces` directory with a barrel file.

## Functional Requirements

- Scan all files in `./components/layout/*.tsx` for TypeScript interface definitions
- Identify interfaces used by 2 or more components (shared interfaces)
- Identify interfaces with duplicate or overlapping structures and consolidate into a single interface
- Create an `./interfaces` directory if it doesn't already exist
- Create interface files (e.g., `interfaces/layout.ts`) for consolidated interfaces
- Create an `interfaces/index.ts` barrel file that re-exports all layout-related interfaces
- Update import statements in layout components to use the new centralized interfaces

## Possible Edge Cases

- Interfaces with the same structure but different names need deduplication
- Interfaces with optional properties that differ may need to be merged
- Some interfaces may be component-specific and should remain inline

## Acceptance Criteria

- All shared interfaces from layout components are accessible from `interfaces/index.ts`
- No duplicate interface structures exist
- Component files import from centralized interfaces
- No breaking changes to existing functionality
- TypeScript compiles without errors

## Open Questions

- How to handle interfaces that are similar but have slight differences in required vs optional fields? You can use `extends`, `Partial` syntax or make a different interfaces - you decide.

## Testing Guidelines

- Run `pnpm type-check` to verify no type errors
- Verify all layout components still render correctly