# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-03-31

## Current Sprint: CCR-006 through CCR-007 — Spell Enforcement & Class Reconciliation

### Tasks
- [x] CCR-006 — Spell selection full rule enforcement: cantrip/known/prepared counts enforced at step level, spell level validation, under-selection blocking
- [x] CCR-007 — Class change reconciliation: registry-driven spell trimming, equipment reset, descriptive change summaries

### Completed
- [x] CCR-001 — Rule baseline decision (2024 PHB documented)
- [x] CCR-002 — Creation rules schema and registry
- [x] CCR-003 — Registry-driven spell logic
- [x] CCR-004 — Character data model update
- [x] CCR-005 — Legacy character migration layer
- [x] CCR-006 — Spell selection full rule enforcement
- [x] CCR-007 — Class change reconciliation

## Next Sprint Preview
- CCR-008–CCR-012: Equipment rules, starting equipment rewrite, background/race/skills steps

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
- Sprint CCR-006/007 is complete. Next sprint: CCR-008–012 (equipment rules, starting equipment rewrite, background/race/skills integration).

### Maintenance (2026-03-31)
- [x] Run all tests and report failures — 376 tests pass, 0 failures
- [x] Code review: flag smells, duplication, anti-patterns — no critical issues; pre-existing warnings only (shadcn fast-refresh, useEffect deps in DnD5eCharacterForm/CharacterList/SessionJournal)
- [x] Check for security issues (hardcoded secrets, unsafe inputs) — clean; one acceptable dangerouslySetInnerHTML in shadcn chart.tsx
- [x] Check for unused imports, dead code, stale TODOs — migrateStoredData stub is scaffolding; no actionable dead code
- [x] Check localStorage key compatibility for soloquest_* keys — all references go through STORAGE_KEYS constant, no renames
