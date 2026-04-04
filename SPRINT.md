# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-04-02

## Current Sprint: CCR-013 through CCR-014 — Wizard Validation Hardening & Review Step Rule Summary

### Tasks
- [x] CCR-013 — Wizard validation hardening: extract `getStepError` into `src/lib/wizardValidation.ts`, delegate equipment validation to `validateEquipmentStep` (enforces package selection), expose `validateAllSteps` for per-step status
- [x] CCR-014 — Review step rule summary: add validation status indicators, hit points card, saving throws card, skills/expertise card, background details card, equipment inventory list, spell list with names and levels

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
- [x] CCR-013 — Wizard validation hardening
- [x] CCR-014 — Review step rule summary

## Next Sprint Preview
- CCR-015–CCR-016: End-to-end test coverage, documentation and QA checklist

> End goal: Phase 4 (session tools / AI GM state handoff) is the target — character creation compliance feeds the structured state bundle that AI GMs consume at session start.

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
- Sprint CCR-013–014 is complete. Next sprint: CCR-015–016 (end-to-end test coverage, documentation and QA checklist).

### Maintenance (2026-04-02)
- [x] Run all tests and report failures — 574 tests pass (50 new CCR-013-014 coverage), 1 pre-existing timeout in StartingEquipmentStep gold-buy render
- [x] Code review: flag smells, duplication, anti-patterns — no critical issues; pre-existing warnings only (shadcn fast-refresh, useEffect deps, large components)
- [x] Check for security issues (hardcoded secrets, unsafe inputs) — clean
- [x] Check for unused imports, dead code, stale TODOs — clean (1 minor: CardDescription import in CombatTracker.tsx may be unused)
- [x] Check localStorage key compatibility for soloquest_* keys — all references go through STORAGE_KEYS constant, no renames
