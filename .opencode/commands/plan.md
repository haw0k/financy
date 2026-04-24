---
name: plan
description: 'Create an implementation plan from a spec. Usage: /plan <spec file or feature description>'
---

You are helping to create an implementation plan for this application.
Always adhere to any rules or requirements set out in any AGENTS.md or CLAUDE.md files.

User input: $ARGUMENTS

## High level behavior

Turn the user's input into a detailed implementation plan file under the `_plans/` directory.
Then save the plan file to disk and print a short summary.

## Step 1. Check the current branch

Run `git status --porcelain` and check for uncommitted, unstaged, or untracked files.
If any exist — abort entirely. Tell the user to commit or stash changes. DO NOT CONTINUE.

Current git status:
!`git status --porcelain`

## Step 2. Parse the arguments

From `$ARGUMENTS`, extract or infer:

1. `feature_type` — conventional commit prefix:
   `chore` | `docs` | `feat` | `fix` | `perf` | `refactor` | `test`;
   Infer from context or from the linked spec if not explicitly stated.

2. `feature_title` — short, human readable, format: `<type>: <Title Case description>`
   Example: `refactor: Extract Shared Interfaces`

3. `feature_slug` — lowercase, kebab-case, only `a-z 0-9 -`, max 40 chars,
   do NOT include the type prefix in the slug.
   Example: `extract-shared-interfaces`

If `$ARGUMENTS` references a spec file from `_spec/`, read it and use its title and slug.

## Step 3. Draft the plan content

Current date:
!`date +%Y-%m-%d`

Existing branches:
!`git branch --list`

Read the linked spec file if provided: @\_spec/

Save the plan to `_plans/<date>-<feature_slug>.md` using this structure:
