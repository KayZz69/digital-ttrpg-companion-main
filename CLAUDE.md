# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Hard Rules

ALWAYS:
- Read `architecture.md` before changing routes, persistence behavior, or subsystem boundaries.
- Run `npm run lint` after code changes.
- Run `npm test` when changing utilities, hooks, rules code, or any behavior with existing coverage.
- Run `npm run build` after changes that affect routing, shared types, page composition, or exported components.
- Follow existing patterns in nearby files before introducing new abstractions.
- Keep rules, progression, and combat logic in `src/lib/` or `src/utils/`, not embedded in page components.
- Update docs in the same change when behavior, localStorage shape, or workflow expectations change.

NEVER:
- Change localStorage keys or persisted JSON shapes without approval and migration notes.
- Modify config, CI, deployment files, or dependency versions without explicit approval.
- Treat shadcn primitives in `src/components/ui/` as free-form design files. Edit them intentionally and minimally.
- Use `any` where a concrete type or narrow union is practical.
- Leave debugging `console.log` calls in committed code.
- Delete tests without approval.

ASK FIRST:
- Before changing route structure, navigation semantics, or URL contracts.
- Before altering shared 5e data baselines in `src/data/`.
- Before changing character creation step order or rules assumptions.
- Before introducing new dependencies or removing existing ones.
- Before making a breaking change to a public prop contract used across multiple pages/components.

## Project Overview

Digital TTRPG Companion is a React + TypeScript SPA for DnD 5e character management, combat tracking, dice rolling, NPC storage, compendium browsing, and session journaling. Persistence is localStorage only.

Canonical architecture details, routes, storage keys, and mechanics boundaries live in `architecture.md`.

## Commands

```bash
npm run dev
npm run build
npm run build:dev
npm run lint
npm test
npm run test:watch
```

Targeted test examples:

```bash
npx vitest run src/utils/diceUtils.test.ts
npx vitest run src/utils/progressionUtils.test.ts
```

## Architecture

### Routing
- `/` -> character creation wizard
- `/characters` -> character list
- `/character/:id` -> character sheet view
- `/character/:id/edit` -> character edit flow
- `/character/:id/journal` -> session journal
- `/character/:id/combat` -> combat tracker
- `/dice` -> dice roller
- `/npc-library` -> NPC library
- `/compendium` -> spells and equipment browser

### Persistence
Current browser storage keys:
- `soloquest_characters`
- `soloquest_npcs`
- `soloquest_journal`

Changing a key name or stored JSON shape is a breaking change for existing local data.

### Rules and Mechanics Boundaries
- `src/lib/dndRules.ts` handles spell slots, prepared and known limits, and cantrip caps.
- `src/lib/characterCreationRules.ts` handles race ability score bonus parsing and application.
- `src/lib/dndCompendium.ts` contains selectors and compendium helpers.
- `src/utils/progressionUtils.ts` owns XP thresholds, HP gain, and ASI application.
- `src/utils/combatMathUtils.ts` owns attack, save, damage, and concentration math.

When behavior belongs to one of these domains, extend the owning module rather than duplicating logic in the UI.

## Working Patterns

- Match local formatting in each file.
- Prefer named exports for new components and helpers unless the file already uses a default export pattern.
- Keep route pages focused on composition and user interaction. Extract reusable or testable logic into hooks, utils, or lib modules.
- For data-heavy additions, update types first, then static data, then selectors/helpers, then UI.
- Preserve existing user data where possible. If a change risks invalidating stored state, document it and get approval first.

## Testing Expectations

- Utility and rules changes should usually ship with Vitest coverage.
- UI behavior tests should use Testing Library with jsdom, not browser-only assumptions.
- For bug fixes, prefer adding a regression test that would have failed before the change.
- After verification, report the exact commands run and whether they passed.

## Skills

Local skills live in `.claude/skills/`. Check them before starting specialized work:

- `component-builder`
- `debug-assistant`
- `code-review`
- `git-workflow`
- `changelog-generator`
- `feature-test-writer`
- `rules-content-author`
