---
description: Create an implementation plan from a spec or feature description
argument-hint: Spec file or feature description
allowed-tools: Read, Write, Glob, Bash(git status:*), Bash(git branch:*), Bash(date:*)
---

You are helping to create an implementation plan for this application.
Always adhere to any rules or requirements set out in any CLAUDE.md files when responding.

User input: $ARGUMENTS

## High level behavior

Turn the user input above into a detailed implementation plan file under the `_plans/` directory.
Then save the plan file to disk and print a short summary of what you did.

## Step 1. Check the current branch

Check the current Git branch, and abort this entire process if there are any uncommitted, unstaged, or untracked files in the working directory. Tell the user to commit or stash changes before proceeding, and DO NOT GO ANY FURTHER.

## Step 2. Parse the arguments

From `$ARGUMENTS`, extract or infer:

1. `feature_type` — conventional commit prefix:
   `chore` | `docs` | `feat` | `fix` | `perf` | `refactor` | `test`;
   Infer from context or from the linked spec if not explicitly stated.

2. `feature_title`
   - A short, human readable title in Title Case.
   - Example: "Extract Shared Interfaces"

3. `feature_slug`
   - Rules:
     - Lowercase, kebab-case, only `a-z`, `0-9` and `-`
     - Replace spaces and punctuation with `-`
     - Collapse multiple `-` into one
     - Trim `-` from start and end
     - Maximum length 40 characters
     - Do NOT include the type prefix in the slug
   - Example: `extract-shared-interfaces`

If `$ARGUMENTS` references a spec file from `_spec/`, read it and use its title and slug.

## Step 3. Draft the plan content

Get today's date by running `date +%Y-%m-%d`.

Save the plan to `_plans/<date>-<feature_slug>.md` using this structure:

```markdown
# Plan: <feature_type>: <feature_title>

## Spec

Link: [<feature_title>](_spec/<date>-<feature_slug>.md) (if exists)

## Current State

Brief description of the current state of the codebase relevant to this plan.

## Implementation Steps

### Phase 1 — <phase title>

- [ ] Step 1
- [ ] Step 2

### Phase 2 — <phase title>

- [ ] Step 3

## Risks & Notes

- ...

## Definition of Done

- [ ] ...
```

Do not add technical implementation details such as code examples.

## Step 4. Update the index

Append a line to `_plans/_description.md` (create the file if it doesn't exist):

- [ ] <feature_type>: feature_title - { <date>-<feature_slug>.md }

## Step 5. Final output to the user

After the file is saved, respond to the user with a short summary in this exact format:

Plan file: \_plans/<date>-<feature_slug>.md
Title: <feature_type>: <feature_title>

Do not repeat the full plan in the chat output unless the user explicitly asks to see it.

## Step 6. After plan implementation

Launch the command
`pnpm run format:fix`
