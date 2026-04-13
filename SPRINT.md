# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-04-09

## Current Sprint: CCR-017 through CCR-023 — Character Sheet & Management Polish

### Tasks
- [x] CCR-017 — Character sheet component extraction: break monolithic character sheet page into focused section components (StatsBlock, InventoryPanel, SpellList, EffectsBar, HeaderInfo) with proper props/types
- [x] CCR-018 — Ability scores & modifiers display: wire ability scores, modifiers, saving throws, and proficiency bonus into StatsBlock using rules engine utilities; show computed values (passive Perception, etc.)
- [x] CCR-019 — Inventory & equipment display: render starting equipment from creation data, show armor class computation, weight/encumbrance summary, and equipped vs. carried state
- [x] CCR-020 — Spell management on sheet: display prepared/known spells by level, spell slot tracking, casting integration with class spell list from registry; cantrips separated
- [x] CCR-021 — Character edit flow: enable inline editing of character fields post-creation (name, HP, notes) with validation; prevent edits to locked fields (class, race) without full re-creation
- [x] CCR-022 — Level-up progression: implement level 2-3 progression flow using rules engine — HP increase (hit die roll or average), new class features, spell slot updates, ASI/feat stub at level 4
- [x] CCR-023 — Character sheet test coverage: component tests for each extracted section, integration test for edit flow, snapshot tests for sheet layout at levels 1-3

### Completed Sprints

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
- Sprint complete. Next sprint tasks to be pulled from ROADMAP.md.

### Last Run
- 2026-04-13: CCR-023 character sheet test coverage. Added 54 new tests across 7 new test files: component tests for HeaderInfo (8), StatsBlock (9), EffectsBar (7), SpellList (5), InventoryPanel (10); integration tests for EditCharacter edit flow (9); snapshot tests for CharacterView at levels 1, 2, 3 (3). All 816 tests pass (39 test files), 0 lint errors, build clean. PR #21.
- 2026-04-11: CCR-021 character edit flow + CCR-022 level-up progression. Rewrote EditCharacter as inline edit page (name, max HP, alignment, notes) with locked race/class/level fields. Enhanced LevelUpWizard with spell slot updates on level-up (preserves used slots, gains new ones), spell slot diff display, and ASI/feat stub at level 4. 24 new tests. All 762 tests pass (32 test files), 0 lint errors, build clean. PR #20.
- 2026-04-09: CCR-019 inventory & equipment display + CCR-020 spell management. Added armorClassUtils.ts with AC computation from equipped armor (parses compendium AC strings, handles light/medium/heavy + shield + unarmored). Enhanced InventoryPanel with AC display, equipped weapon summary, and weight bar. Refactored SpellsManager to group prepared/known spells by level with section headers; cantrips displayed in compact grid, leveled spells show slot availability per level. 13 new AC utility tests. All 738 tests pass (30 test files), 0 lint errors, build clean.
- 2026-04-08: CCR-017 component extraction + CCR-018 ability scores wiring. Extracted CharacterView.tsx (1007→~680 lines) into 5 focused components: HeaderInfo, StatsBlock, EffectsBar, SpellList, InventoryPanel. StatsBlock wires computed values: passive Perception, spell save DC, spell attack bonus via rules engine. All 725 tests pass, 0 lint errors, build clean. PR #18.

### Maintenance (2026-04-13)
- [x] Run all tests and report failures — 816 tests pass (39 test files), 0 failures
- [x] Run lint — 0 errors, 13 pre-existing warnings (shadcn fast-refresh, useEffect deps)
- [x] Run build — succeeds (3.93s)
- [x] Code review: all new test files follow existing patterns, mocks isolate sub-components
- [x] Check for unused imports, dead code — no issues found
