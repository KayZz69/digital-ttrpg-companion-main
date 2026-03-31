# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-04-01

## Current Sprint: CCR-008 through CCR-012 — Equipment Rules & Step Integration

### Tasks
- [x] CCR-008 — Equipment rules foundation: registry-driven equipment rules with structured package items, item ID references, budget validation
- [x] CCR-009 — Starting equipment rewrite: StartingEquipmentStep uses registry for package resolution, maintains gold-buy mode
- [x] CCR-010 — Background integration: enhanced background data (tool proficiencies, languages, descriptions), background registry module, improved BackgroundStep UI
- [x] CCR-011 — Race integration: race registry module with trait/language/speed helpers, full trait descriptions in RaceSelectionStep
- [x] CCR-012 — Skills step integration: skills registry module with class skill rules, skill descriptions, validation helpers, enhanced SkillsStep UI

### Completed
- [x] CCR-001 — Rule baseline decision (2024 PHB documented)
- [x] CCR-002 — Creation rules schema and registry
- [x] CCR-003 — Registry-driven spell logic
- [x] CCR-004 — Character data model update
- [x] CCR-005 — Legacy character migration layer
- [x] CCR-006 — Spell selection full rule enforcement
- [x] CCR-007 — Class change reconciliation
- [x] CCR-008 — Equipment rules foundation
- [x] CCR-009 — Starting equipment rewrite
- [x] CCR-010 — Background integration
- [x] CCR-011 — Race integration
- [x] CCR-012 — Skills step integration

## Next Sprint Preview
- CCR-013–CCR-014: Wizard validation hardening, review step rule summary

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
- Sprint CCR-008–012 is complete. Next sprint: CCR-013–014 (wizard validation hardening, review step rule summary).

### Maintenance (2026-04-01)
- [x] Run all tests and report failures — 453 tests pass, 0 failures (77 new tests added)
- [x] Code review: flag smells, duplication, anti-patterns — no critical issues; pre-existing warnings only (shadcn fast-refresh, useEffect deps in CharacterList/SessionJournal)
- [x] Check for security issues (hardcoded secrets, unsafe inputs) — clean; no new vulnerabilities
- [x] Check for unused imports, dead code, stale TODOs — clean; migrateStoredData stub remains intentional scaffolding
- [x] Check localStorage key compatibility for soloquest_* keys — all references go through STORAGE_KEYS constant, no renames
