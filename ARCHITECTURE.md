# Architecture

Digital TTRPG Companion is a persistent mechanical state layer for AI Game Masters. AI GMs lose character state across sessions — stats, HP, inventory, active effects, dice outcomes get pushed out of context. This app lives outside the AI's context window and provides structured state at session start.

Export and JSON handoff are first-class architectural concerns. The state bundle (character stats, HP, inventory, active effects, session log) must be serializable, stable, and consumable by external systems — whether that's a readable web page, a structured JSON export, or a paste-able context bundle.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- react-router-dom v6 for client routing
- Browser localStorage for persistence (no backend)

## Routing

- `/` -> Character creation wizard
- `/characters` -> Character list
- `/character/:id` -> Character sheet view
- `/character/:id/edit` -> Character edit flow
- `/character/:id/journal` -> Session journal
- `/character/:id/combat` -> Combat tracker
- `/dice` -> Dice roller
- `/npc-library` -> NPC library
- `/compendium` -> Spells and equipment browser

## Data Flow

State is managed in React components and persisted to localStorage as JSON.

- React state <-> localStorage <-> JSON serialization

Storage keys:
- `soloquest_characters` -> character data
- `soloquest_npcs` -> NPC library
- `soloquest_journal` -> session journal entries

Changing key names or stored JSON shape is a breaking change for existing local data.

## Character Creation Rules Baseline

- Baseline: **2024 PHB-oriented class/race dataset** (matches current `src/data/classes.ts` and `src/data/races.ts` content).
- Rules enforcement in the wizard is centralized across:
  - `src/lib/dndRules.ts` for spell slots, known/prepared limits, and cantrip caps.
  - `src/lib/characterCreationRules.ts` for race ability-score bonus parsing/application.
  - `src/lib/dndCompendium.ts` helper selectors for class expertise and starting equipment packages.
- Character creation step order:
  - Basic Info -> Race -> Class -> Background -> Abilities -> Skills -> Saves -> Spells (casters only) -> Equipment -> Review
- Current intentional deviation:
  - Starting equipment package data is a curated rules-safe subset represented in `src/data/startingEquipment.ts`; gold-buy remains available as an alternative mode.

### 2024 PHB Decision Record (CCR-001)

**Decision:** The 2024 Player's Handbook (D&D 5e revised) is the single authoritative ruleset for all game mechanics in this project.

**Enforcing modules:**

| Module | Role |
|--------|------|
| `src/lib/rules/RulesRegistry.ts` | Declares `rulesVersion: "2024-dnd5e"` as the registry baseline |
| `src/lib/rules/spells.ts` | Spell slot, cantrip, and known/prepared tables sourced from 2024 PHB Chapter 7 |
| `src/lib/rules/equipment.ts` | Starting equipment rules aligned with 2024 PHB |
| `src/pages/CharacterWizard.tsx` | Stamps `rulesVersion: "2024-dnd5e"` on every new character |
| `src/data/classes.ts`, `src/data/races.ts` | Static datasets reflect 2024 PHB content |

**Legacy handling:** Characters created before CCR-002 lack a `rulesVersion` field. The migration layer in `src/lib/storage.ts` (`migrateCharacterRecord`) defaults missing `rulesVersion` to `"2024-dnd5e"` at load time. No 2014-specific data paths exist.

**Future:** If 2014 PHB support is ever needed, it would be implemented as a separate `RulesRegistry` with its own spell slot tables, cantrip progression, and known/prepared limits — not as conditional branches in the existing 2024 implementation.

## Layer Structure

| Layer | Path | Purpose |
|-------|------|---------|
| Pages | `src/pages/` | Route-level components |
| Components | `src/components/` | Feature and reusable components |
| UI primitives | `src/components/ui/` | shadcn/ui primitives |
| Types | `src/types/` | Domain interfaces |
| Data | `src/data/` | Static D&D 5e data |
| Utils | `src/utils/` | Pure helper logic |
| Hooks | `src/hooks/` | Custom React hooks |
| Lib | `src/lib/` | Shared utilities |

## Key Subsystems

- Character Management: create, view/edit, list, and persist characters.
- Combat Tracking: initiative ordering, HP updates, and condition tracking.
- Dice Rolling: d4-d20 rolls, modifiers, advantage/disadvantage, history.
- Session Journal: timestamped entries with filtering/tagging.

## Mechanics Engine Notes (Phase 1.1 / 1.3)

- Character progression uses `src/utils/progressionUtils.ts` for XP thresholds, HP gain, and ASI application.
- Level-up ASI selections are validated before progression can continue:
  - Single ASI requires a selectable ability below 20.
  - Split ASI requires two distinct abilities, each below 20.
  - Invalid split selections are ignored defensively in the utility layer.
- Combat math uses `src/utils/combatMathUtils.ts` for attack/save/damage/concentration calculations.
- Weapon proficiency matching enforces category correctness:
  - `Simple weapons` applies only to simple weapons.
  - `Martial weapons` applies only to martial weapons.
- Combat participant cards surface spellcasting math when available:
  - Spell attack bonus (`prof + casting mod`)
  - Spell save DC (`8 + prof + casting mod`)
