# Plan: feat: Custom Select Component

## Spec

Link: [Custom Select Component](_specs/2026-06-29-custom-select-component.md)

## Current State

The application uses the shadcn/ui Select primitive from `lib/shadcn/Select.tsx`. The original shadcn/ui component currently serves as both the library source and the component consumed by application code. There is no project-specific Select wrapper, so any custom behavior or styling risks being lost when the shadcn/ui source is regenerated or updated.

## Implementation Steps

### Phase 1 — Audit and Preserve the Primitive

- [ ] Read the current `lib/shadcn/Select.tsx` source and confirm its exact contents.
- [ ] Verify that the shadcn/ui Select source has not been modified from the original generated code; restore it if needed.

### Phase 2 — Create the Custom Select Wrapper

- [ ] Add a new `components/ui/Select.tsx` file that re-exports and extends the shadcn/ui Select primitive.
- [ ] Ensure the custom component preserves the same public API, sub-components, type safety, and accessibility behavior as the underlying primitive.
- [ ] Apply project-specific styling, defaults, or behavior only inside the new component.

### Phase 3 — Validate and Test

- [ ] Add or update tests under `tests/` to cover rendering, selection, value change handling, and keyboard accessibility.
- [ ] Run `pnpm check`, `pnpm type-check`, and `pnpm test:run` and address any failures.
- [ ] Confirm that `lib/shadcn/Select.tsx` has no unintended diff after the change.

## Risks & Notes

- Future shadcn/ui updates should be safe to apply to `lib/shadcn/Select.tsx` without affecting the custom wrapper.
- Both import paths (`@/lib/shadcn/Select` and `@/components/ui/Select`) may coexist temporarily during migration.
- The custom component must not degrade keyboard navigation or screen-reader behavior.

## Definition of Done

- [ ] `lib/shadcn/Select.tsx` remains in its original state.
- [ ] `components/ui/Select.tsx` exists and provides a working, composable custom Select.
- [ ] `pnpm check` passes.
- [ ] `pnpm type-check` passes.
- [ ] Tests for the new component pass.
