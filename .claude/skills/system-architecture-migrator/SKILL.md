---
name: system-architecture-migrator
description: Refactors the Digital TTRPG Companion toward a multi-system architecture with clear system-agnostic core boundaries, system-specific modules, registries, and gradual migration steps. Use when working on roadmap plugin architecture, abstract character models, system registries, lazy-loaded game systems, or extraction of DnD-specific logic into system modules.
---

# System Architecture Migrator

Use this skill for phased architectural changes that prepare the app for Dragonbane, Cyberpunk Red, and future systems without breaking the current DnD flow.

## Source of truth

Start with `architecture.md` and `.claude/roadmap.md`.

## Migration principles

- Prefer staged refactors over big-bang rewrites.
- Preserve the current DnD user flow while extracting abstractions.
- Separate system-agnostic shell concerns from system-specific rules and data.
- Move contracts before implementations: types, interfaces, registries, then features.

## Workflow

1. Identify which concerns are truly shared across systems and which are DnD-specific.
2. Define or refine the shared contracts in `src/types/` or a new `src/systems/` boundary.
3. Introduce adapters or registries that allow DnD to be the first implementation.
4. Migrate one vertical slice at a time rather than all pages at once.
5. Keep compatibility shims where needed until all callers move over.
6. Update architecture docs when boundaries or module ownership change.

## Good first targets

- system metadata registry
- shared character shell type plus system-specific extension points
- system-specific compendium loaders
- per-system page or panel composition
- shared dice and journal features that should remain cross-system

## Risks to manage

- over-generalizing too early
- leaking DnD assumptions into shared interfaces
- breaking persisted DnD data without a migration path
- introducing route churn before the underlying architecture is ready

## Deliverable bar

- The extracted boundary is explicit.
- DnD still works through the new abstraction.
- The next system has a clear insertion point.
- Docs explain the new ownership model.

## Before finishing

- Run `npm run lint`.
- Run `npm test` when shared utilities, adapters, or rules contracts move.
- Run `npm run build` because architecture work usually affects shared types and module graphs.
