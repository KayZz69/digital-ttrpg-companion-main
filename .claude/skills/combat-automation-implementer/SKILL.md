---
name: combat-automation-implementer
description: Implements combat automation for the Digital TTRPG Companion, including attack and damage rolls, saving throws, concentration checks, condition effects, initiative side effects, and structured combat state updates. Use when building roadmap combat math and combat tracker behavior that should be driven by shared utilities instead of ad hoc page logic.
---

# Combat Automation Implementer

Use this skill for combat features that combine rules math, participant state, and tracker UI behavior.

## Primary boundaries

- Put combat calculations in `src/utils/`.
- Put shared combat rules or condition interpretation in `src/lib/` if it is reusable beyond one page.
- Keep `src/pages/CombatTracker.tsx` focused on state orchestration and rendering.
- Update `src/types/combat.ts` before relying on new combat state.

## Workflow

1. Identify whether the change is calculation-only, state-shape, or UI-driven.
2. Model the combat event explicitly: attack roll, damage resolution, save, concentration check, duration tick, or condition application.
3. Implement the underlying pure helpers first.
4. Wire those helpers into combat state transitions with minimal page logic.
5. Add tests around math, edge cases, and state transitions.
6. Verify manual flow in the combat tracker for turn order and visible feedback.

## Rules

- Keep critical-hit, advantage, disadvantage, proficiency, and DC math centralized.
- Treat condition automation as data plus interpretation, not scattered conditionals.
- Prefer structured roll results over raw numbers when the UI needs labels or auditability.
- Avoid mutating combat participants in place if the surrounding state model uses immutable updates.

## High-value test cases

- Attack roll hit or miss near AC boundaries.
- Natural 20 critical-hit behavior.
- Saving throws with and without proficiency.
- Concentration DC calculation after damage.
- Condition duration decrement at start or end of turn.
- Exhaustion stacking and cumulative effects.

## Typical output

- `src/utils/combatMathUtils.ts`
- `src/types/combat.ts`
- updates to combat participant components and tracker controls
- focused tests for calculations and reducer-like state changes

## Before finishing

- Run `npm run lint`.
- Run targeted combat tests, then `npm test`.
- Run `npm run build` if types or combat UI surface changed.
