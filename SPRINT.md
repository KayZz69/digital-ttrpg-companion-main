# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-04-07

## Current Sprint: CCR-017 through CCR-023 — Character Sheet & Management Polish

### Tasks
- [ ] CCR-017 — Character sheet component extraction: break monolithic character sheet page into focused section components (StatsBlock, InventoryPanel, SpellList, EffectsBar, HeaderInfo) with proper props/types
- [ ] CCR-018 — Ability scores & modifiers display: wire ability scores, modifiers, saving throws, and proficiency bonus into StatsBlock using rules engine utilities; show computed values (passive Perception, etc.)
- [ ] CCR-019 — Inventory & equipment display: render starting equipment from creation data, show armor class computation, weight/encumbrance summary, and equipped vs. carried state
- [ ] CCR-020 — Spell management on sheet: display prepared/known spells by level, spell slot tracking, casting integration with class spell list from registry; cantrips separated
- [ ] CCR-021 — Character edit flow: enable inline editing of character fields post-creation (name, HP, notes) with validation; prevent edits to locked fields (class, race) without full re-creation
- [ ] CCR-022 — Level-up progression: implement level 2-3 progression flow using rules engine — HP increase (hit die roll or average), new class features, spell slot updates, ASI/feat stub at level 4
- [ ] CCR-023 — Character sheet test coverage: component tests for each extracted section, integration test for edit flow, snapshot tests for sheet layout at levels 1-3

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
- CCR-017: Extract character sheet into focused section components (StatsBlock, InventoryPanel, SpellList, EffectsBar, HeaderInfo)
- CCR-018: Wire ability scores, modifiers, and saving throws into StatsBlock
- Audit existing character sheet page to identify all extraction points and shared state

### Last Run
- 2026-04-05: Fixed 22 test failures from missing imports in ReviewStep.tsx and CharacterWizard.tsx (pre-existing from CCR-014 implementation). Added missing imports for isSpellcastingClass, getClassSavingThrowKeys, getRegistrySpellSelectionState, validateAllSteps, WizardStepKey, getAbilityModifier, BookOpen. Defined getCurrentEquipmentCostInGp function. Updated 4 ReviewStep tests for new validation checklist overlap. All 725 tests pass, 0 errors, build clean.

### Maintenance (2026-04-05)
- [x] Run all tests and report failures — 725 tests pass (29 test files), 0 failures (fixed 22 pre-existing failures)
- [x] Run lint — 0 errors, 13 pre-existing warnings (shadcn fast-refresh, useEffect deps)
- [x] Run build — succeeds (4.64s)
- [x] Code review: flag smells, duplication, anti-patterns — same 3 oversized page components. Fixed pre-existing missing import bugs in ReviewStep.tsx and CharacterWizard.tsx (undefined function references)
- [x] Check for security issues — clean; one safe dangerouslySetInnerHTML in chart.tsx
- [x] Check for unused imports, dead code, stale TODOs — clean
