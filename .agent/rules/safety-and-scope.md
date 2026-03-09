---
trigger: always_on
---

# Safety and scope

## Only touch what the task needs
- Do not modify config, dependency manifests, CI, deployment, or generated UI primitives unless the task explicitly requires it.
- If a change might break stored user data, route stability, or rules correctness across the app, stop and ask first.

## Respect persistence safety
- Treat localStorage keys and stored JSON shapes as user data contracts.
- Do not rename, delete, or reinterpret persisted fields without approval and migration notes.

## Safe terminal actions
- Default to read-only or safe commands such as listing files, running tests, linting, and builds.
- Ask before commands that install, delete, migrate, or otherwise make destructive environment changes.
