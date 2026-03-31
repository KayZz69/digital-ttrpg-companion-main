# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-04-01

## Current Sprint: CCR-008 through CCR-010 — Equipment Rules & Background Enrichment

### Tasks
- [x] CCR-008 — Equipment rules engine: rewrite equipment.ts from stub to structured EquipmentPackageItem data for all 12 classes, add BackgroundEquipmentRule for all 13 backgrounds
- [x] CCR-009 — Starting equipment adapter wiring: dndCompendium uses registry as primary source, registry-sourced gold budget in StartingEquipmentStep
- [x] CCR-010 — Background data enrichment: descriptions, tools, languages, equipment, and startingGoldGP for all 13 backgrounds; BackgroundStep UI shows new fields

### Up Next
- CCR-011 — Race step language display and skill/language integration
- CCR-012 — Skills step consolidation (background vs class skill deduplication)

### Completed
- [x] CCR-001 — Rule baseline decision (2024 PHB documented)
- [x] CCR-002 — Creation rules schema and registry
- [x] CCR-003 — Registry-driven spell logic
- [x] CCR-004 — Character data model update
- [x] CCR-005 — Legacy character migration layer
- [x] CCR-006 — Spell selection full rule enforcement
- [x] CCR-007 — Class change reconciliation
- [x] CCR-008 — Equipment rules engine
- [x] CCR-009 — Starting equipment adapter wiring
- [x] CCR-010 — Background data enrichment

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
- CCR-011: Add language display to RaceSelectionStep; ensure race languages are visible during character creation.
- CCR-012: Skills step consolidation — deduplicate background-granted vs class-selected skills, prevent double-proficiency conflicts.

### Maintenance (2026-04-01)
- [x] Run all tests and report failures — 384 tests pass, 0 failures
- [x] Code review: flag smells, duplication, anti-patterns — equipment data duplicated between rules/equipment.ts and data/startingEquipment.ts (legacy fallback); no critical issues
- [x] Check for security issues (hardcoded secrets, unsafe inputs) — clean
- [x] Check localStorage key compatibility for soloquest_* keys — all references go through STORAGE_KEYS constant, no renames
