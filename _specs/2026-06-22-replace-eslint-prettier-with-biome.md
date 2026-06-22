# Spec for Replace ESLint and Prettier with Biome

branch: chore/replace-eslint-prettier-with-biome

## Summary

Replace the existing ESLint and Prettier toolchain with Biome to unify linting, formatting, and import organization under a single, faster tool. This includes removing ESLint configuration and Prettier configuration files, installing Biome, configuring its rules to match the project's existing code style, and updating all npm scripts and CI steps accordingly.

## Functional Requirements

- Remove `eslint`, `eslint-config-next`, `@typescript-eslint/*`, and related ESLint plugins from dependencies.
- Remove `.prettierrc.json`, `.prettierignore`, and any Prettier-related npm scripts.
- Install `@biomejs/biome` as a dev dependency.
- Create `biome.json` (or `biome.jsonc`) that preserves the current code style:
  - 100 character line width
  - Single quotes
  - Semicolons
  - Trailing commas (ES5 style)
  - LF line endings
  - Import ordering equivalent to the current `import/order` ESLint rule
  - Hungarian notation rules preserved where applicable
- Update `package.json` scripts:
  - `pnpm lint` runs Biome lint
  - `pnpm lint:fix` runs Biome lint with `--write`
  - `pnpm format:check` runs Biome format check
  - `pnpm format:fix` runs Biome format with `--write`
  - Keep `pnpm type-check` unchanged
- Update the pre-deploy check command to use the new lint/format scripts.
- Update `CLAUDE.md` and any developer documentation to reference Biome instead of ESLint/Prettier.
- Run Biome format/lint across the codebase and commit the resulting changes in the implementation branch.

## Possible Edge Cases

- Biome may not support every custom ESLint rule currently in use (e.g., specific `import/order` behavior or project-specific naming-convention rules).
- Existing files that intentionally violate formatting rules may need explicit ignore comments or `biome.json` overrides.
- Editor integrations and VS Code settings may need updates to use Biome instead of ESLint/Prettier.
- CI workflows that reference `pnpm lint` or `pnpm format:check` must be verified after the switch.

## Acceptance Criteria

- `pnpm lint` passes without ESLint being installed.
- `pnpm format:check` passes without Prettier being installed.
- `pnpm type-check` still passes.
- `pnpm test:run` still passes.
- No `eslint.config.*`, `.eslintrc*`, `.prettierrc*`, or `.prettierignore` files remain in the repository.
- The repository uses a single `biome.json` configuration file.
- Code style remains visually consistent with the previous ESLint/Prettier setup.

## Open Questions

- Should Biome's import organization completely replace the current `import/order` rule, or should import order remain manual? Try to migrate `import/order` rule from ESLint to biome. Requirements for the source code should stay the same.
- Are there any custom ESLint rules (e.g., from `eslint-config-next/core-web-vitals`) that need equivalent Biome rules or explicit ignore overrides? Try to migrate a rule like `eslint-config-next/core-web-vitals` from ESLint to biome.
- Should the migration be applied to the entire codebase in one commit, or split into a setup commit and a formatting commit? Split.

## Testing Guidelines

Create or update a test file in the `./tests` folder only if Biome configuration itself needs validation. Otherwise, rely on existing tests and add a simple check that the Biome configuration file is present and parseable.

- Verify that `biome.json` is valid JSON and contains the required formatting rules.
- Verify that running `pnpm lint` and `pnpm format:check` exits with code 0 after migration.
