# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-04-01

## Current Sprint: CCR-008 through CCR-012 — Equipment Rules, Background/Race/Skills Integration

### Tasks
- [x] CCR-008 — Equipment rules data: multi-package class equipment, background equipment, gold-buy budgets
- [x] CCR-009 — Starting equipment step rewrite: package selection with validation, gold-buy budget enforcement
- [x] CCR-010 — Background step and data integration: tools, languages, equipment, feat grants, skill overlap warnings
- [x] CCR-011 — Race and origin application: review step shows final post-modifier ability scores, race features/languages
- [x] CCR-012 — Skills step rule correction: expertise gating by class/level, over-selection blocking, background skill exclusion

### Completed
- [x] CCR-001 — Rule baseline decision (2024 PHB documented)
- [x] CCR-002 — Creation rules schema and registry
- [x] CCR-003 — Registry-driven spell logic
- [x] CCR-004 — Character data model update
- [x] CCR-005 — Legacy character migration layer
- [x] CCR-006 — Spell selection full rule enforcement
- [x] CCR-007 — Class change reconciliation
- [x] CCR-008 — Equipment rules data
- [x] CCR-009 — Starting equipment step rewrite
- [x] CCR-010 — Background step and data integration
- [x] CCR-011 — Race and origin application
- [x] CCR-012 — Skills step rule correction

## Next Sprint Preview
- CCR-013–CCR-014: Wizard validation hardening, review step rule summary

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
- Sprint CCR-008–012 is complete. Next sprint: CCR-013–014 (wizard validation hardening, review step rule summary).

### Maintenance (2026-04-01)
- [x] Run all tests and report failures — 912 tests pass (includes new CCR-008-012 coverage), 0 failures
- [x] Code review: flag smells, duplication, anti-patterns — no critical issues; pre-existing warnings only (shadcn fast-refresh, useEffect deps)
- [x] Check for security issues (hardcoded secrets, unsafe inputs) — clean
- [x] Check for unused imports, dead code, stale TODOs — clean
- [x] Check localStorage key compatibility for soloquest_* keys — all references go through STORAGE_KEYS constant, no renames
