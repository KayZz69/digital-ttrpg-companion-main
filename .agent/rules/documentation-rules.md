---
trigger: always_on
---

# Documentation rules

## Update docs with behavior changes
- Every new feature or breaking change must update at least one relevant doc file such as `README.md`, `architecture.md`, `AGENTS.md`, or `CLAUDE.md`.
- If you add or change a storage key, route, contributor workflow, or domain rule assumption, document it explicitly.

## Use architecture notes for subsystem changes
- When adding or changing a non-trivial subsystem, update `architecture.md` with the affected routes, data flow, storage implications, or owning modules.
- Keep architecture notes high level: what exists, where logic lives, and how the pieces interact.

## Explain non-obvious code
- If logic is tricky, add a short comment explaining why it is written that way.
- Prefer comments on constraints, defensive guards, and rules edge cases over comments that restate obvious code.
