# Architecture

Digital TTRPG Companion is a React SPA for character management, combat tracking, dice rolling, and session journaling.

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
