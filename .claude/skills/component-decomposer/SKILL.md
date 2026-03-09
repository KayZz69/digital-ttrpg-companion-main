---
name: component-decomposer
description: Splits large React pages and components in the Digital TTRPG Companion into smaller, testable units without changing behavior, route semantics, or persistence expectations. Use when refactoring roadmap monoliths such as CharacterView, CombatTracker, or DiceRollerInterface, or when extracting panels, controls, and view-model boundaries from oversized files.
---

# Component Decomposer

Use this skill for maintainability refactors where the main goal is smaller components and clearer boundaries, not new product behavior.

## Target files

- large route components in `src/pages/`
- oversized feature components in `src/components/`
- tightly coupled render logic that should become panel or section components

## Workflow

1. Measure the current file's responsibilities before extracting anything.
2. Separate pure derived data from render-only subtrees.
3. Extract leaf sections first, then shared view-model helpers or hooks if needed.
4. Preserve existing props and behavior until tests or coverage prove a broader redesign is safe.
5. Add or update smoke tests around the extracted surface when behavior is non-trivial.

## Extraction rules

- Do not move domain logic into the new child component if it belongs in `src/utils/`, `src/lib/`, or a hook.
- Keep prop contracts explicit and narrow.
- Avoid creating a pile of one-off wrapper components with no ownership value.
- Preserve route structure and navigation semantics unless the user asks for navigation changes.

## Good decomposition seams

- Header or summary blocks
- stat panels
- forms or dialog content
- tabbed subviews
- reusable action bars
- repeated list row renderers

## Quality bar

- The parent file should become meaningfully easier to read.
- Extracted components should have a single obvious job.
- Shared types should not become looser just to make extraction easier.
- Existing user-visible behavior should remain stable.

## Before finishing

- Run `npm run lint`.
- Run relevant component tests or add them if the extracted behavior is non-trivial.
- Run `npm run build` for route-level decompositions or shared export changes.
