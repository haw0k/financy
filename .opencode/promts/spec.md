---
name: spec
description: "Create a feature spec and git branch. Usage: /spec <short feature description>"
---

You are helping to spin up a new feature spec for this application.
Always adhere to any rules or requirements set out in any AGENTS.md or CLAUDE.md files.

The user's feature description is the text they typed after `/spec` in the chat.

## High level behavior

Turn the user's input into:
- A human friendly feature title in Title Case
- A safe git branch name not already taken
- A detailed markdown spec file under the `_specs/` directory

Then save the spec file to disk and print a short summary.

## Step 1. Check the current branch

Check the current Git branch. If there are any uncommitted, unstaged,
or untracked files in the working directory — abort the entire process.
Tell the user to commit or stash changes before proceeding. DO NOT CONTINUE.

## Step 2. Parse the user's input

From the user's message, extract:

1. `feature_title`
   - Short, human readable title in Title Case
   - Example: "Card Component for Dashboard Stats"

2. `feature_slug`
   - Rules: lowercase, kebab-case, only `a-z 0-9 -`,
     replace spaces/punctuation with `-`, collapse multiple `-`,
     trim `-` from edges, max 40 characters
   - Example: `card-component-dashboard`

3. `branch_name`
   - Format: `feature/<feature_slug>`
   - Example: `feature/card-component`

If you cannot infer a sensible title and slug — ask the user to clarify instead of guessing.

## Step 3. Switch to a new Git branch

Switch to the new branch before creating any files.
If the branch name is already taken, append a number: e.g. `feature/card-component-01`.

## Step 4. Read the spec template

Read the file `_specs/template.md` to get the exact spec structure to follow.
Do not add technical implementation details such as code examples.
Save the resulting spec to `_specs/<feature_slug>.md`.

## Step 5. Final output

After the file is saved, respond with exactly this format and nothing more:

Branch: <branch_name>
Spec file: _specs/<feature_slug>.md
Title: <feature_title>

Do not repeat the full spec in chat unless the user explicitly asks for it.