---
name: progression-system-designer
description: Designs and implements character advancement behavior for the Digital TTRPG Companion, including level-up flow, XP or milestone progression, HP growth, hit dice, ASI timing, subclass unlocks, and progression-related persisted fields. Use when working on roadmap character progression or any feature that changes how characters advance over time.
---

# Progression System Designer

Use this skill when a request changes how characters level, unlock features, or store advancement state.

## Priority files

- `src/types/character.ts`
- `src/utils/`
- `src/lib/characterCreationRules.ts`
- `src/data/classes.ts`
- `src/components/`
- `.claude/roadmap.md`
- `architecture.md`

## Workflow

1. Map the requested progression behavior to concrete level thresholds and data requirements.
2. Audit the current character type and localStorage implications before changing shape.
3. Keep progression math in utilities and rule validation in shared lib modules.
4. Add the minimum UI needed to expose the new progression flow.
5. Add tests for threshold transitions, invalid states, and backward-compatible defaults.
6. Document any new persisted field or migration expectation.

## Guardrails

- Do not hardcode level thresholds in multiple components.
- Keep subclass timing, ASI timing, and proficiency scaling centralized.
- Prefer additive data fields with safe defaults over breaking persisted shape changes.
- Ask first before changing canonical localStorage keys or making incompatible character JSON.
- Keep level-up flow resumable and understandable from stored state.

## Expected coverage

Test at least:
- Level boundary transitions such as 1 to 2, 3 to 4, and 4 to 5.
- ASI availability at the correct levels.
- HP and hit die progression rules.
- XP and milestone branching behavior if both are supported.
- Existing characters that lack the new progression fields.

## Common outputs

- `src/utils/progressionUtils.ts`
- Updates to class or subclass metadata in `src/data/classes.ts`
- New or updated level-up UI under `src/components/LevelUpWizard/`
- Character type additions with compatibility handling

## Before finishing

- Run `npm run lint`.
- Run targeted progression tests first, then `npm test`.
- Run `npm run build` because progression changes usually touch shared types and flows.
