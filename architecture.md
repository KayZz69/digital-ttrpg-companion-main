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
