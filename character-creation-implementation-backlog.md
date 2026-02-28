# Character Creation Remediation Backlog

Last updated: 2026-02-17  
Owner: Engineering

## Purpose

This backlog defines concrete, ticket-sized work to bring DnD character creation in line with the chosen rules baseline and improve automation for spells, spell slots, and starting equipment.

## Scope

- In scope: character creation flow, rules enforcement, data model updates, migration, and tests.
- Out of scope: combat subsystem redesign, non-creation character sheet redesign, and non-DnD systems.

## Execution Order

1. `CCR-001`
2. `CCR-002`, `CCR-003`, `CCR-004`, `CCR-005`
3. `CCR-006`, `CCR-007`
4. `CCR-008`, `CCR-009`, `CCR-010`, `CCR-011`, `CCR-012`
5. `CCR-013`, `CCR-014`
6. `CCR-015`, `CCR-016`

## Ticket Backlog

### CCR-001: Rule Baseline Decision
- Priority: `P0`
- Estimate: `0.5 day`
- Dependencies: none
- Acceptance criteria:
1. A single rules baseline is selected (`2014`, `2024`, or explicit hybrid).
2. `architecture.md` includes a "Character Creation Rules Baseline" section with clear boundaries.
3. A short deviation list is documented for intentional non-baseline behavior.

### CCR-002: Creation Rules Schema and Registry
- Priority: `P0`
- Estimate: `1 day`
- Dependencies: `CCR-001`
- Acceptance criteria:
1. A typed rules layer exists for class spellcasting mode, cantrip limits, leveled spell limits, slot progression, and starting equipment mode.
2. UI no longer depends on hardcoded spell and equipment progression tables.
3. Unit tests validate registry coverage for all supported classes.

### CCR-003: Registry Driven Spell Logic
- Priority: `P0`
- Estimate: `1 day`
- Dependencies: `CCR-002`
- Acceptance criteria:
1. Spell slot generation and spell-limit logic consume the registry only.
2. Cantrip limits are enforced independently from leveled spell limits.
3. Existing tests pass and new class-specific tests are added.

### CCR-004: Character Data Model Update for Spellcasting Semantics
- Priority: `P0`
- Estimate: `1 day`
- Dependencies: `CCR-002`
- Acceptance criteria:
1. Data model explicitly supports known-caster and prepared-caster semantics.
2. Existing saved characters load without runtime errors.
3. No new unsafe casts are introduced to bypass type safety.

### CCR-005: Legacy Character Migration Layer
- Priority: `P0`
- Estimate: `1 day`
- Dependencies: `CCR-004`
- Acceptance criteria:
1. Legacy records with only `preparedSpells` are normalized at load time.
2. Migration behavior is idempotent and tested.
3. No localStorage key name changes are introduced.

### CCR-006: Spell Selection Step Full Rule Enforcement
- Priority: `P0`
- Estimate: `1.5 days`
- Dependencies: `CCR-003`, `CCR-004`, `CCR-005`
- Acceptance criteria:
1. Spell step enforces class spell list, slot-gated leveled spells, cantrip caps, and known or prepared limits.
2. UI labels correctly reflect spell mode (`Known` vs `Prepared`).
3. Invalid selections are blocked with clear user feedback.

### CCR-007: Class Change Reconciliation
- Priority: `P0`
- Estimate: `1 day`
- Dependencies: `CCR-006`
- Acceptance criteria:
1. Changing class recalculates slots and removes or flags illegal spells.
2. User receives a summary of automatic adjustments.
3. Persisted character data contains no stale invalid spell entries.

### CCR-008: Equipment Rules Data (Class and Background Packages plus Gold Buy)
- Priority: `P1`
- Estimate: `1 day`
- Dependencies: `CCR-001`
- Acceptance criteria:
1. Structured starting-equipment data exists for supported classes and backgrounds.
2. Optional gold-buy mode is represented in data contracts.
3. Tests verify each class has at least one valid equipment path.

### CCR-009: Starting Equipment Step Rewrite
- Priority: `P1`
- Estimate: `1.5 days`
- Dependencies: `CCR-008`
- Acceptance criteria:
1. Default flow presents legal package choices instead of unrestricted compendium-only selection.
2. Gold-buy mode enforces budget constraints when chosen.
3. Output inventory exactly matches selected package or purchases.

### CCR-010: Background Step and Data Integration
- Priority: `P1`
- Estimate: `1.5 days`
- Dependencies: `CCR-001`
- Acceptance criteria:
1. Wizard includes background selection and persistence.
2. Background grants are auto-applied (skills, tools, languages, equipment, and feat if in baseline).
3. Overlaps with class picks are resolved with legal replacements.

### CCR-011: Race and Origin Application
- Priority: `P1`
- Estimate: `1.5 days`
- Dependencies: `CCR-001`
- Acceptance criteria:
1. Race or origin bonuses from data are applied to character state.
2. Choice-based bonuses and language picks are selectable and persisted.
3. Review step displays final post-modifier ability scores clearly.

### CCR-012: Skills Step Rule Correction
- Priority: `P1`
- Estimate: `1 day`
- Dependencies: `CCR-010`
- Acceptance criteria:
1. Expertise is available only when explicitly granted by class or background features.
2. Skill pick counts enforce both class and background constraints.
3. Invalid over-selection cannot be saved.

### CCR-013: Wizard Validation Hardening
- Priority: `P1`
- Estimate: `1 day`
- Dependencies: `CCR-006`, `CCR-009`, `CCR-010`, `CCR-011`, `CCR-012`
- Acceptance criteria:
1. Step-level validation enforces completion rules for each wizard step.
2. Final creation is blocked with actionable errors when any rule requirement is unresolved.
3. Happy-path creation succeeds for all currently supported classes.

### CCR-014: Review Step Rule Summary
- Priority: `P2`
- Estimate: `0.5 day`
- Dependencies: `CCR-013`
- Acceptance criteria:
1. Review includes spellcasting mode, legal spell counts, and equipment source summary.
2. Create action is disabled when unresolved violations exist.
3. Review summary reflects persisted output accurately.

### CCR-015: End to End Test Coverage
- Priority: `P2`
- Estimate: `2 days`
- Dependencies: `CCR-013`
- Acceptance criteria:
1. Automated coverage includes Fighter, Wizard, Sorcerer, Warlock, and Paladin or Ranger flow.
2. Tests include class-change mid-wizard and legacy migration behavior.
3. `npm test` passes with the new suite.

### CCR-016: Documentation and QA Checklist
- Priority: `P2`
- Estimate: `0.5 day`
- Dependencies: `CCR-015`
- Acceptance criteria:
1. `architecture.md` is updated with the new creation flow and rules-engine location.
2. A manual QA checklist is committed for creation edge cases.
3. PR notes include migration and localStorage compatibility checks.

## Definition of Done

For any ticket to be marked complete:
1. Code is merged and lint or tests required by that ticket pass.
2. Acceptance criteria are verified.
3. Any data model or persistence impact is documented.
