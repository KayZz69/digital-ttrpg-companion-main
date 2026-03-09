---
name: storage-migration-guard
description: Safely evolves localStorage-backed data in the Digital TTRPG Companion, including schema changes, import or export validation, defaulting strategies, backward compatibility, and migration notes. Use when a request touches persisted JSON shapes, canonical storage keys, data import or export, or any feature that risks breaking existing saved characters, NPCs, or journal data.
---

# Storage Migration Guard

Use this skill whenever a change can affect saved user data.

## Canonical risk areas

- `soloquest_characters`
- `soloquest_npcs`
- `soloquest_journal`
- any new localStorage key introduced for roadmap work

## Workflow

1. Identify the exact persisted shape today by reading the relevant type, storage helper, and load path.
2. Decide whether the change is additive, coercive, or breaking.
3. Prefer additive defaults and runtime normalization over breaking replacements.
4. Update read paths to accept old data before writing new data.
5. Add tests that cover legacy input and normalized output.
6. Document the migration expectation in repo docs when the storage contract changes.

## Guardrails

- Ask first before changing canonical storage keys.
- Ask first before making incompatible JSON shape changes.
- Never assume all local data is well-formed.
- Validate imports before merging them into storage.
- Keep migration logic centralized instead of duplicating fallback logic across components.

## What good changes look like

- A new persisted field with safe defaulting on load.
- Import validation that rejects malformed content with a clear error path.
- Runtime normalization function that upgrades older records in memory before save.
- Tests proving older stored objects still render and save correctly.

## What to avoid

- Writing migration logic inline inside page components.
- Requiring every caller to remember optional fallback rules.
- Silent data drops without documentation.

## Before finishing

- Run `npm run lint`.
- Run targeted storage or utility tests, then `npm test`.
- Run `npm run build` if shared types, import/export UI, or app initialization changed.
- Summarize compatibility impact clearly.
