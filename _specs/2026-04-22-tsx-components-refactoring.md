# Spec for tsx-components-refactoring

branch: feature/tsx-components-refactoring

## Summary

Refactor all TSX component files in the components/ directory to follow a consistent export pattern using named exports with FC typing and consistent interface naming conventions.

## Functional Requirements

- Convert all function component exports from `export function ComponentName()` to `export const ComponentName: FC<IComponentName> = () => {}` format
- Define an interface for each component with the prefix `I` followed by the component name (e.g., `ICategoriesTable`, `IHeader`)
- Import `FC` type from React using the `import { type FC }` syntax
- Ensure all components have proper TypeScript interfaces defining their props
- Maintain all existing functionality while standardizing the component structure

## Possible Edge Cases

- Components with no props should use an empty interface `IComponentName {}`
- Components using external types (e.g., User from Supabase) should include those in the interface
- Components that are already properly typed should remain unchanged
- Pages (non-component files) that are default exports should not be affected

## Acceptance Criteria

- All components in components/layout/ follow the `export const Name: FC = () => {}` for a component without props and `export const Name: FC<IName></IName> = ({...}) => {}` for a component with props patterns
- All components in components/pages/ follow this patterns (excluding default page exports)
- Every component with props has an associated interface matching the pattern `I<ComponentName>`
- FC is imported as a type: `import { type FC } from 'react'`
- No `function ComponentName()` declarations remain as exports
- All existing functionality continues to work after refactoring

## Open Questions

- Should ThemeProvider.tsx be refactored the same way, or kept as a thin wrapper? No. You can use it as example for the refactoring.
- Should index.ts barrel files be updated to reflect interface exports? No, the component names mustn't be changed during the refactoring.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Verify all components export using named export pattern
- Verify all components have corresponding interfaces
- Verify FC is imported correctly in all files
- Verify refactored components maintain original functionality
