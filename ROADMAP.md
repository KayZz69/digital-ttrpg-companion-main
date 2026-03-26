# Digital TTRPG Companion — Roadmap

> Last updated: 2026-03-27

## Vision

A complete client-side DnD 5e companion for character creation, management, combat tracking, dice rolling, and session journaling — all in the browser with localStorage persistence.

---

## Phase 1: Character Creation Rules Compliance (Current)

Bring the character creation wizard into full alignment with the chosen rules baseline.

- **CCR-001–005**: Rule baseline decision, creation rules registry, registry-driven spell logic, data model update, legacy migration
- **CCR-006–007**: Spell selection full enforcement, class change reconciliation
- **CCR-008–012**: Equipment rules, starting equipment rewrite, background/race/skills integration
- **CCR-013–014**: Wizard validation hardening, review step rule summary
- **CCR-015–016**: End-to-end test coverage, documentation and QA checklist

## Phase 2: Character Sheet & Management Polish

- Improve character sheet display post-creation
- Character edit flow refinement
- Leveling/progression integration with rules engine

## Phase 3: Combat & Mechanics

- Combat tracker improvements (initiative, HP, conditions)
- Attack/save/damage automation using `combatMathUtils`
- Concentration and spell slot tracking during combat

## Phase 4: Session Tools

- Journal improvements (session notes, timeline)
- NPC library enhancements
- Compendium search and filtering improvements

## Phase 5: Quality & Polish

- Comprehensive Vitest coverage across all flows
- Accessibility audit
- Mobile UX refinement
- PWA / offline support exploration

---

## Parking Lot

- Multi-system support beyond 5e
- Cloud sync / account system
- Party management / shared campaigns
- AI-assisted session prep
