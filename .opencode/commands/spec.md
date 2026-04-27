---
name: spec
description: 'Create a feature spec and git branch. Usage: /spec <short feature description>'
---

You are helping to spin up a new feature spec for this application.
Always adhere to any rules or requirements set out in any AGENTS.md or CLAUDE.md files.

User input: $ARGUMENTS

## High level behavior

Turn the user's input into:

- A human friendly feature title in Title Case
- A safe git branch name not already taken
- A detailed markdown spec file under the `_specs/` directory

Then save the spec file to disk and print a short summary.

## Step 1. Check the current branch

Run `git status --porcelain` and check for uncommitted, unstaged, or untracked files.
If any exist — abort entirely. Tell the user to commit or stash changes. DO NOT CONTINUE.

Current git status:
!`git status --porcelain`

## Step 2. Parse the arguments

From `$ARGUMENTS`, extract:

1. `feature_type` — conventional commit prefix:
   `chore` | `docs` | `feat` | `fix` | `perf` | `refactor` | `test`;
   Infer from context if not explicitly stated.

2. `feature_title` — short, human readable, format: `<type>: <Title Case description>`
   Example: `refactor: Extract Shared Interfaces`

3. `feature_slug` — lowercase, kebab-case, only `a-z 0-9 -`, max 40 chars,
   do NOT include the type prefix in the slug
   Example: `extract-shared-interfaces`

4. `branch_name` — format: `<type>/<feature_slug>`
   Example: `refactor/extract-shared-interfaces`

## Step 3. Switch to a new Git branch

Switch to the new branch before creating any files.
If the branch name is already taken, append a number: e.g. `refactor/slug-01`.

Existing branches:
!`git branch --list`

Current date:
!`date +%Y-%m-%d`

## Step 4. Draft the spec content

Use the template below and save the spec to `_specs/<date>-<feature_slug>.md`.
Do not add technical implementation details such as code examples.

Template:
@\_specs/template.md

## Step 5. Update the index

Append a line to `_specs/_description.md`:

- [ ] <feature_type>: feature_title - { <date>-<feature_slug>.md }

## Step 6. Final output

After the file is saved, respond with exactly this format and nothing more:

Branch: <branch_name>
Spec file: \_specs/<date>-<feature_slug>.md
Title: <feature_type>: <feature_title>

Do not repeat the full spec in chat unless the user explicitly asks for it.
