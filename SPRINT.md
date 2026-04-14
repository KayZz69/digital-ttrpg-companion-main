# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-04-14

## Current Sprint: Phase 3 — Combat & Mechanics

### Tasks
- [ ] CCR-024 — Death saving throws: add death save tracking (3 successes / 3 failures) to `Combatant` type and `CombatParticipant` UI; auto-trigger on player combatant reaching 0 HP; stabilize on 3 successes, death on 3 failures; reset on healing from 0; natural 20 heals 1 HP, natural 1 counts as two failures
- [ ] CCR-025 — Temporary HP: add `tempHP` field to `Combatant`; damage absorbs temp HP before regular HP; temp HP not restorable by healing; UI controls to grant/remove temp HP on combatant cards
- [ ] CCR-026 — Spell slot combat integration: surface spell slot tracking in `CombatParticipant` for player combatants; add "Cast Spell" action that decrements `spellSlots[level].current` and writes back to character localStorage; show slots remaining per level; auto-set concentration when casting a concentration spell
- [ ] CCR-027 — Targeted attack flow: build select-target → roll attack (using `rollAttack`/`checkHit` from `combatMathUtils`) → apply damage pipeline in CombatParticipant UI; resolve hit/miss against target AC; on hit, roll damage via `rollDamage` and apply to target HP; support advantage/disadvantage toggle
- [ ] CCR-028 — Saving throw automation: add "Force Save" action on combatants — select ability, set DC (auto-populate from caster's spell save DC via `calcSpellSaveDC`), target rolls via `rollSavingThrow`; display pass/fail result; stub for half-damage-on-save
- [ ] CCR-029 — Encounter persistence: implement localStorage read/write for `CombatEncounter` (type already defined in `combat.ts`); auto-save combat state on changes; restore active encounter on page reload; add encounter history list
- [ ] CCR-030 — Combat tracker test coverage: unit tests for death saves, temp HP, spell slot decrement, and encounter persistence logic; integration tests for targeted attack and saving throw flows; tests for `combatMathUtils` edge cases (crits, advantage, finesse)

### Completed Sprints

#### Phase 2: Character Sheet & Management Polish
- [x] CCR-017 — Character sheet component extraction
- [x] CCR-018 — Ability scores & modifiers display
- [x] CCR-019 — Inventory & equipment display
- [x] CCR-020 — Spell management on sheet
- [x] CCR-021 — Character edit flow
- [x] CCR-022 — Level-up progression
- [x] CCR-023 — Character sheet test coverage

#### Phase 1: Character Creation Rules Compliance
- [x] CCR-015 — End-to-end test coverage
- [x] CCR-016 — Documentation and QA checklist
- [x] CCR-014 — Review step rule summary
- [x] CCR-013 — Wizard validation hardening
- [x] CCR-012 — Skills step rule correction
- [x] CCR-011 — Race and origin application
- [x] CCR-010 — Background step and data integration
- [x] CCR-009 — Starting equipment step rewrite
- [x] CCR-008 — Equipment rules data
- [x] CCR-007 — Class change reconciliation
- [x] CCR-006 — Spell selection full rule enforcement
- [x] CCR-005 — Legacy character migration layer
- [x] CCR-004 — Character data model update
- [x] CCR-003 — Registry-driven spell logic
- [x] CCR-002 — Creation rules schema and registry
- [x] CCR-001 — Rule baseline decision (2024 PHB documented)

> End goal: Phase 4 (session tools / AI GM state handoff) is the target — character creation compliance feeds the structured state bundle that AI GMs consume at session start.

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
- Next sprint proposed — pending Kay approval.

### Last Run
- 2026-04-13: CCR-023 character sheet test coverage. Added 54 new tests across 7 new test files: component tests for HeaderInfo (8), StatsBlock (9), EffectsBar (7), SpellList (5), InventoryPanel (10); integration tests for EditCharacter edit flow (9); snapshot tests for CharacterView at levels 1, 2, 3 (3). All 816 tests pass (39 test files), 0 lint errors, build clean. PR #21.
- 2026-04-11: CCR-021 character edit flow + CCR-022 level-up progression. Rewrote EditCharacter as inline edit page (name, max HP, alignment, notes) with locked race/class/level fields. Enhanced LevelUpWizard with spell slot updates on level-up (preserves used slots, gains new ones), spell slot diff display, and ASI/feat stub at level 4. 24 new tests. All 762 tests pass (32 test files), 0 lint errors, build clean. PR #20.
- 2026-04-09: CCR-019 inventory & equipment display + CCR-020 spell management. Added armorClassUtils.ts with AC computation from equipped armor (parses compendium AC strings, handles light/medium/heavy + shield + unarmored). Enhanced InventoryPanel with AC display, equipped weapon summary, and weight bar. Refactored SpellsManager to group prepared/known spells by level with section headers; cantrips displayed in compact grid, leveled spells show slot availability per level. 13 new AC utility tests. All 738 tests pass (30 test files), 0 lint errors, build clean.
- 2026-04-08: CCR-017 component extraction + CCR-018 ability scores wiring. Extracted CharacterView.tsx (1007→~680 lines) into 5 focused components: HeaderInfo, StatsBlock, EffectsBar, SpellList, InventoryPanel. StatsBlock wires computed values: passive Perception, spell save DC, spell attack bonus via rules engine. All 725 tests pass, 0 lint errors, build clean. PR #18.

### Maintenance (2026-04-14)
- [x] Run all tests and report failures — 816 tests pass (39 test files), 0 failures
- [x] Run lint — 0 errors, 13 pre-existing warnings (shadcn fast-refresh, useEffect deps)
- [x] Run build — succeeds (4.31s)
- [x] Code review: no new smells, dead code, or stale TODOs in src/
- [x] Security check: no hardcoded secrets, no unsafe inputs — "secret/token" matches are all D&D game content
- [x] Phase 3 sprint proposed: CCR-024 through CCR-030 (7 tasks)

### Maintenance (2026-04-13)
- [x] Run all tests and report failures — 816 tests pass (39 test files), 0 failures
- [x] Run lint — 0 errors, 13 pre-existing warnings (shadcn fast-refresh, useEffect deps)
- [x] Run build — succeeds (3.93s)
- [x] Code review: all new test files follow existing patterns, mocks isolate sub-components
- [x] Check for unused imports, dead code — no issues found
