# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-03-29

## Current Sprint: CCR-001 through CCR-005 — Rules Baseline & Core Schema

### Tasks
- [ ] CCR-001 — Rule baseline decision: select 2014/2024/hybrid, document in ARCHITECTURE.md
- [x] CCR-002 — Creation rules schema and registry: typed rules layer for spellcasting, cantrips, slots, equipment
- [x] CCR-003 — Registry-driven spell logic: slot generation and spell limits consume registry only
- [x] CCR-004 — Character data model update: support known-caster and prepared-caster semantics
- [ ] CCR-005 — Legacy character migration layer: normalize old `preparedSpells` records at load time

### Completed
- [x] CCR-002 — Creation rules schema and registry
- [x] CCR-003 — Registry-driven spell logic
- [x] CCR-004 — Character data model update

## Next Sprint Preview
- CCR-006, CCR-007: Spell selection full rule enforcement + class change reconciliation
- CCR-008–CCR-012: Equipment rules, starting equipment rewrite, background/race/skills steps

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
<!-- Populated by session end -->

### Maintenance
- [ ] Run all tests and report failures
- [ ] Code review: flag smells, duplication, anti-patterns
- [ ] Check for security issues (hardcoded secrets, unsafe inputs)
- [ ] Check for unused imports, dead code, stale TODOs
- [ ] Check localStorage key compatibility for soloquest_* keys
