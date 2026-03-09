---
name: git-workflow
description: Manages branching, commits, pushes, and conflict resolution using safe Git practices and conventional commit messages. Use when the user asks to commit, push, branch, inspect diffs, or handle merge conflicts.
---

# Git Workflow

Use safe, reviewable Git operations.

## Before committing

1. Review `git status`.
2. Stage only files relevant to the task.
3. Run the appropriate verification commands for the change:
   - `npm run lint`
   - `npm test` when logic or tests changed
   - `npm run build` when routing, shared types, or app-wide composition changed
4. Review the staged diff before committing.
5. Never commit secrets, local credentials, or build artifacts unless the repo explicitly tracks them.

## Commit format

Use conventional commits:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `test:`
- `style:`
- `chore:`

Add a scope when it clarifies the area:

```text
fix(combat): correct concentration save DC calculation
feat(character-wizard): add equipment package summary
docs(agent): add local skill guidance
```

For non-trivial commits, include a body that explains why the change was made.

## Branch naming

- Feature work: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- Docs or maintenance: `chore/<short-description>`

## Conflict handling

1. Identify conflicted files with `git status`.
2. Read both sides of the conflict.
3. Preserve user changes unless the resolution clearly supersedes them.
4. Re-run relevant verification after resolving.

## Hard rules

- Never force push to `main`.
- Never use destructive Git recovery commands unless the user explicitly asks.
- Do not amend an existing commit unless the user asked for it.
- If unrelated changes are present in the worktree, leave them alone.
