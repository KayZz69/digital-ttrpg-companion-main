# Digital TTRPG Companion — Active Sprint

> Source: extracted from [ROADMAP.md](./ROADMAP.md) and [character-creation-implementation-backlog.old.md](./character-creation-implementation-backlog.old.md)
> Last updated: 2026-03-27

## Current Sprint: CCR-001 through CCR-005 — Rules Baseline & Core Schema

### Tasks
- [ ] CCR-001 — Rule baseline decision: select 2014/2024/hybrid, document in ARCHITECTURE.md
- [x] CCR-002 — Creation rules schema and registry: typed rules layer for spellcasting, cantrips, slots, equipment
- [ ] CCR-003 — Registry-driven spell logic: slot generation and spell limits consume registry only
- [ ] CCR-004 — Character data model update: support known-caster and prepared-caster semantics
- [ ] CCR-005 — Legacy character migration layer: normalize old `preparedSpells` records at load time

### Completed
- [x] (moved here when finished)

## Next Sprint Preview
- CCR-006, CCR-007: Spell selection full rule enforcement + class change reconciliation
- CCR-008–CCR-012: Equipment rules, starting equipment rewrite, background/race/skills steps

## Nightly Handoff (Bulhkin)
<!-- Updated by agents at end of each session -->
### Tonight
- CCR-003: Registry-driven spell logic — character load/init consumes getRules() from spells.ts (replace direct dndRules.ts calls in character creation flow)
- CCR-004: CharacterData model update — support known-caster vs prepared-caster semantics in type system

### Maintenance
- [ ] Run all tests and report failures
- [ ] Code review: flag smells, duplication, anti-patterns
- [ ] Check for security issues (hardcoded secrets, unsafe inputs)
- [ ] Check for unused imports, dead code, stale TODOs
- [ ] Check localStorage key compatibility for soloquest_* keys
