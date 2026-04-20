# Commit Message Convention

Format
- Header: `type: subject`
- Body: Optional, multiple paragraphs separated by blank lines
- Footer: Optional, references to issues or breaking changes

Rules
- Subject should be in the present tense and imperative mood (e.g. "add", "fix").
- Limit header to ~72 characters when possible.
- Scope is optional and should be a concise, lowercase, hyphen-separated value.
- Types describe the change category and follow a fixed set of values (see below).
- If a change closes an issue, reference it in the footer (e.g. `Closes #123`).

Types
- chore:    changes to the build process or auxiliary tooling and libraries
- ci:       changes related to CI configuration and scripts
- docs:     documentation only changes
- feat:     a new feature
- fix:      a bug fix
- refactor: a code change that neither fixes a bug nor adds a feature
- revert:   revert a previous commit
- style:    changes that do not affect the meaning of code (white-space, formatting, etc)
- test:     adding missing tests or correcting existing tests

Examples
- feat: add OAuth login flow
- fix: correct token refresh flow
- docs: update README with commit conventions
- style: fix trailing whitespace in some files
- refactor: simplify date parsing logic
- test: add unit tests for token validation
- chore: bump linting tool versions
- ci: run tests on push to main

Guidance
- Use commitlint or a similar tool to enforce this convention in CI.
- When multiple changes are needed, consider grouping related changes under the same type and scope.
