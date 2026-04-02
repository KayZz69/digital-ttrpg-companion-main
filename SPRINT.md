# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-04-03

## Current Sprint: CCR-013 through CCR-014 — Wizard Validation Hardening, Review Step Rule Summary

### Tasks
- [x] CCR-013 — Wizard validation hardening: extract validation to testable utility, harden edge cases (whitespace names, NaN scores, expertise on non-proficient skills, package-mode without selection, saves mismatch)
- [x] CCR-014 — Review step rule summary: skills/proficiencies, saving throws, equipment list, background details, HP preview, validation checklist

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

### Maintenance (2026-04-03)
- [x] Run all tests and report failures — 594 tests pass (20 test files, +69 new from CCR-013/014), 0 failures
- [x] Run lint — 0 errors, 13 pre-existing warnings (shadcn fast-refresh, useEffect deps)
- [x] Run build — succeeds (4.13s)
- [x] Code review: flag smells, duplication, anti-patterns — 3 oversized page components (CharacterView 1007 lines, CombatTracker 893 lines, CombatParticipant 898 lines), duplicated character-loading pattern across 4 pages, business logic in page components (rest mechanics, concentration checks). No `any` types, no dead code, no stale TODOs.
- [x] Check for security issues (hardcoded secrets, unsafe inputs) — clean; one safe dangerouslySetInnerHTML in chart.tsx (internal CSS vars only)
- [x] Check for unused imports, dead code, stale TODOs — clean
- [x] Check localStorage key compatibility for soloquest_* keys — all references go through STORAGE_KEYS constant, no renames
