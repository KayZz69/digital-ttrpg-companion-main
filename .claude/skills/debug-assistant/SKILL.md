---
name: debug-assistant
description: Methodically debugs regressions, errors, and unexpected behavior in the Digital TTRPG Companion using a reproduce-isolate-hypothesize-fix-verify loop. Use when the user reports a bug, broken flow, bad calculation, or failing test.
---

# Debug Assistant

Do not guess. Work through the bug in a disciplined loop.

## Debugging loop

1. Reproduce
2. Isolate
3. Hypothesize
4. Fix
5. Verify

## 1. Reproduce

- Capture the exact route, component, action, and stored data state involved.
- Compare expected behavior with actual behavior.
- If persistence is involved, inspect the relevant localStorage key and data shape.
- If the report mentions a calculation bug, identify the exact character, spell, or combat inputs needed to trigger it.

## 2. Isolate

- Read the responsible code before changing anything.
- Trace ownership:
  - UI/render issue -> `src/pages/` or `src/components/`
  - Rules issue -> `src/lib/`
  - Math or progression issue -> `src/utils/`
  - Static data issue -> `src/data/`
- Check nearby tests for the intended behavior.
- Use git diff or recent changes when the regression is likely recent.

## 3. Hypothesize

- Form at least two plausible root causes when the bug is not obvious.
- State why each could explain the observed behavior.
- Prefer the smallest explanation consistent with the evidence.

## 4. Fix

- Implement the minimal change that resolves the root cause.
- Do not bundle in unrelated cleanup or refactors.
- Add a short comment only if the fix guards a non-obvious rule or edge case.

## 5. Verify

- Re-run the failing scenario.
- Run the most relevant tests first.
- Add a regression test when practical, especially for utils and rules logic.
- Check adjacent behavior to avoid breaking combat, progression, or persistence flows.

## Common bug buckets in this repo

### Persistence bugs
- Stored JSON shape does not match current type expectations.
- Local edits mutate shared state and re-save corrupted data.
- Missing fallback when a localStorage key is absent or stale.

### Rules and math bugs
- Spellcasting math uses the wrong ability modifier.
- Weapon proficiency checks confuse simple vs martial categories.
- Level-up ASI logic allows invalid selections or ignores defensive guards.
- Combat calculations mix display formatting with numeric logic.

### React bugs
- Derived state goes stale after edits.
- `useEffect` dependencies are incomplete.
- Route params change but stale data is still shown.
- Form defaults do not rehydrate when editing an existing character.

## Useful commands

```bash
npm test
npx vitest run src/utils/combatMathUtils.test.ts
npx vitest run src/utils/progressionUtils.test.ts
npm run lint
npm run build
```

## What not to do

- Do not patch symptoms without understanding the root cause.
- Do not rewrite multiple subsystems to fix a localized bug.
- Do not change storage keys or persisted shapes as a shortcut.
