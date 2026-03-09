---
name: mechanics-engine-builder
description: Builds and updates rules-heavy mechanics for the Digital TTRPG Companion, especially pure utilities, derived character math, and combat or progression calculations that must stay out of route components. Use when implementing roadmap mechanics engine work such as leveling, attack math, saving throws, spell limits, concentration logic, feat effects, or other reusable rules behavior.
---

# Mechanics Engine Builder

Use this skill for roadmap work that deepens game automation without scattering logic across pages.

## Source of truth

Start with `architecture.md` and `.claude/roadmap.md`.

Honor these boundaries:
- Put reusable mechanics in `src/utils/` when they are pure calculations.
- Put shared rules selection and validation in `src/lib/`.
- Keep route pages and feature components focused on orchestration and rendering.
- Treat persisted data shapes as stable unless the user explicitly approves a migration-risking change.

## Workflow

1. Identify the mechanic being added and the exact game rule it must encode.
2. Find the nearest existing helper in `src/utils/` or `src/lib/` and extend that pattern before creating a new module.
3. Define or update types before writing the implementation.
4. Implement the core math as small pure functions first.
5. Add a thin integration layer for components only after the core behavior is testable.
6. Add or update focused Vitest coverage for happy paths, edge cases, and rule boundaries.
7. Update docs when a subsystem contract or rules baseline changes.

## Design rules

- Prefer deterministic functions with explicit inputs and outputs.
- Keep dice rolling separate from interpretation logic when possible.
- Avoid hidden coupling to localStorage, component state, or page-level objects.
- Return structured results when the UI needs both totals and explanations.
- Encode assumptions in types or tests rather than JSX comments.

## Good fit examples

- Add `progressionUtils.ts` for proficiency bonus, XP, ASI, and hit die scaling.
- Add `combatMathUtils.ts` for attack rolls, critical hits, save DCs, and concentration checks.
- Centralize feat or subclass passive modifiers into reusable helpers.
- Add spell preparation or slot recovery calculations that multiple components need.

## Review checklist

- Is the rule logic centralized once?
- Can the same function be tested without rendering React?
- Are persisted types still compatible?
- Does the UI consume the helper instead of re-deriving numbers inline?

## Before finishing

- Run `npm run lint`.
- Run targeted Vitest commands for touched mechanics.
- Run `npm test` when the change affects shared rules or utilities.
- Run `npm run build` if the new mechanic changes shared types or app-wide flows.
