# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-03-30

## Current Sprint: CCR-001 through CCR-005 — Rules Baseline & Core Schema

### Tasks
- [x] CCR-001 — Rule baseline decision: select 2014/2024/hybrid, document in ARCHITECTURE.md
- [x] CCR-002 — Creation rules schema and registry: typed rules layer for spellcasting, cantrips, slots, equipment
- [x] CCR-003 — Registry-driven spell logic: slot generation and spell limits consume registry only
- [x] CCR-004 — Character data model update: support known-caster and prepared-caster semantics
- [x] CCR-005 — Legacy character migration layer: normalize old `preparedSpells` records at load time

### Completed
- [x] CCR-001 — Rule baseline decision (2024 PHB documented)
- [x] CCR-002 — Creation rules schema and registry
- [x] CCR-003 — Registry-driven spell logic
- [x] CCR-004 — Character data model update
- [x] CCR-005 — Legacy character migration layer

## Next Sprint Preview
- CCR-006, CCR-007: Spell selection full rule enforcement + class change reconciliation
- CCR-008–CCR-012: Equipment rules, starting equipment rewrite, background/race/skills steps

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
- Sprint CCR-001–005 is complete. Next sprint: CCR-006/007 (spell selection enforcement + class change reconciliation).

### Maintenance (2026-03-30)
- [x] Run all tests and report failures — 337 tests pass, 0 failures
- [x] Code review: flag smells, duplication, anti-patterns — no critical issues; noted all-or-nothing array validation in storage.ts as a future improvement
- [x] Check for security issues (hardcoded secrets, unsafe inputs) — clean; one acceptable dangerouslySetInnerHTML in shadcn chart.tsx
- [x] Check for unused imports, dead code, stale TODOs — migrateStoredData stub is scaffolding; no actionable dead code
- [x] Check localStorage key compatibility for soloquest_* keys — all references go through STORAGE_KEYS constant, no renames
