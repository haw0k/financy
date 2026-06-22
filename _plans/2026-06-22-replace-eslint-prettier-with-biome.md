# Plan: chore: Replace ESLint and Prettier with Biome

## Spec

Link: [Replace ESLint and Prettier with Biome](_specs/2026-06-22-replace-eslint-prettier-with-biome.md)

## Current State

The project currently uses ESLint with `eslint-config-next/core-web-vitals` and several TypeScript ESLint plugins for linting, plus Prettier for formatting. Style rules are configured in `.prettierrc.json` and `eslint.config.mjs`. The `package.json` defines scripts such as `lint`, `lint:fix`, `format:check`, and `format:fix` that delegate to these tools. This setup requires maintaining two separate tools and configurations.

## Implementation Steps

### Phase 1 — Toolchain Replacement

- [ ] Remove ESLint, Prettier, and their related plugins and config files from the project.
- [ ] Install `@biomejs/biome` as a dev dependency.
- [ ] Create `biome.json` with formatter and linter rules matching the existing style (line width, quotes, semicolons, trailing commas, line endings, import organization).
- [ ] Update `package.json` scripts to use Biome for lint and format commands.
- [ ] Update the pre-deploy check command to use the updated scripts.

### Phase 2 — Codebase Migration

- [ ] Run Biome formatting across the entire codebase and review changes.
- [ ] Run Biome linting across the entire codebase.
- [ ] Add Biome ignore comments or `biome.json` overrides only where strictly necessary.
- [ ] Verify all tests pass after formatting changes.

### Phase 3 — Documentation and Cleanup

- [ ] Update `CLAUDE.md` to reference Biome instead of ESLint/Prettier.
- [ ] Remove any VS Code settings or editor config files tied to ESLint/Prettier if present.
- [ ] Update `.vscode/settings.json` to recommend the Biome extension as the default formatter and enable format-on-save.
- [ ] Add `.vscode/extensions.json` with a recommendation for the Biome extension so VS Code prompts users to install it when opening the project.
- [ ] Verify CI workflows use the new scripts.

## Risks & Notes

- Biome may not have exact equivalents for every existing ESLint rule, especially project-specific naming conventions. Some rules may need to be enforced through conventions or alternative tooling.
- Import ordering behavior may differ slightly from the previous `import/order` rule and should be reviewed manually.
- The initial formatting pass may touch many files; it should be kept as a separate commit for clarity.

## Definition of Done

- [ ] `pnpm lint` passes using Biome only.
- [ ] `pnpm format:check` passes using Biome only.
- [ ] `pnpm type-check` passes.
- [ ] `pnpm test:run` passes.
- [ ] No ESLint or Prettier config files remain in the repository.
- [ ] `.vscode/extensions.json` recommends the Biome extension.
- [ ] `.vscode/settings.json` configures Biome as the default formatter with format-on-save.
- [ ] `CLAUDE.md` and `package.json` reflect the Biome-based workflow.
