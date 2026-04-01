# Digital TTRPG Companion — Roadmap

> Last updated: 2026-04-01

## Vision

A persistent mechanical state layer for AI Game Masters. AI GMs lose character state across sessions — stats, HP, inventory, active effects, dice outcomes get pushed out of context. This companion lives outside the AI's context window and provides structured state at session start.

**MVP:** A JSON-exportable character state bundle (stats, HP, inventory, active effects, session log) that an AI GM can be given at the start of each session. Character creation feeds this state; the roadmap is oriented around what the AI GM needs to read and reference, not just what a character sheet displays.

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

> **Note:** This phase contains the highest-value deliverables for the AI GM use case — session export, structured JSON handoff, and the state bundle that makes character data consumable outside the app.

- Journal improvements (session notes, timeline)
- NPC library enhancements
- Compendium search and filtering improvements
- Structured JSON export of character state for AI GM consumption
- Session start bundle: stats, HP, inventory, active effects, session log summary

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
