---
name: rules-content-author
description: Adds or updates DnD 5e data, rules helpers, compendium content, and character-creation support for the Digital TTRPG Companion while preserving architecture and local data compatibility. Use when the user asks for new game data, class or race support, rules updates, spell logic, equipment data, or wizard rule changes.
---

# Rules Content Author

Use this skill for domain work that touches 5e content, mechanics, and character-creation behavior.

## Source of truth

Start with `architecture.md` for current baselines and boundaries.

Current important constraints:
- Character creation is aligned to the 2024 PHB-oriented class and race dataset currently in `src/data/`.
- Shared rules enforcement belongs in `src/lib/`.
- Progression and combat math belong in `src/utils/`.
- Persisted character data must remain compatible unless the user approves a breaking change.

## Typical file ownership

| Concern | Usual location |
|---------|----------------|
| Classes, races, spells, equipment, curated 5e content | `src/data/` |
| Rules selectors and validation | `src/lib/` |
| XP, HP, ASI, combat, math helpers | `src/utils/` |
| Domain types | `src/types/` |
| Wizard and page rendering | `src/components/` and `src/pages/` |

## Workflow

1. Identify whether the request is data-only, rule-only, or both.
2. Update types first if the shape changes.
3. Update static data in `src/data/`.
4. Update selectors, validation, and rule helpers in `src/lib/` or `src/utils/`.
5. Update UI only after the underlying data and rules support exist.
6. Add or update tests for changed mechanics.
7. Update `architecture.md` if a subsystem contract or baseline changes.

## Data and rules guardrails

- Do not duplicate rule calculations across multiple files.
- Keep curated equipment and compendium subsets consistent with the helpers that consume them.
- Preserve storage compatibility for existing characters wherever possible.
- If a new field is required for persisted character data, document the impact and get approval before introducing a breaking shape change.

## Testing focus

For rules-heavy changes, prefer tests around:
- Spellcasting limits
- Proficiency matching
- Level-up and ASI validation
- Combat save, attack, damage, and concentration calculations
- Any parser or selector that maps static data into derived behavior

## Before finishing

- Run `npm run lint`.
- Run targeted Vitest commands for touched mechanics.
- Run `npm run build` if the UI surface changed.
