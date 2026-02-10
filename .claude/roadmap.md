# Digital TTRPG Companion - Product Roadmap

## Context

The Digital TTRPG Companion is a React SPA for D&D 5e character management, combat tracking, dice rolling, and session journaling. It's currently a **stable, feature-complete MVP** with solid architecture, comprehensive type definitions, and good documentation. The app uses localStorage for persistence with no backend.

**Current strengths:** Full character lifecycle, combat tracker with conditions, dice roller with advantage/disadvantage, session journal with tagging, NPC library, ~100 spells, all 12 classes, 10 races, equipment catalog, responsive UI with shadcn/ui.

**Current gaps:** No leveling/progression, no attack roll automation, minimal test coverage (~10%), no export/import, no PWA support, no backend, other game systems stubbed but not implemented, large monolithic components (CharacterView.tsx at 816 lines).

**Goals:** Make this a polished personal tool, learning vehicle, and eventually a publicly released multi-system TTRPG companion with cloud sync and multiplayer support.

---

## Phase 1: D&D 5e Mechanics Engine (Immediate Priority)

Deepen the game mechanics to make D&D 5e feel complete and automated.

### 1.1 Character Progression System
- **Level-up flow**: UI and logic for advancing from level 1-20
- **Experience point tracking**: XP gain, milestone leveling option
- **Proficiency bonus automation**: Auto-calculate from level (Math.ceil(level/4) + 1)
- **Hit point progression**: Roll or average HP on level-up, CON modifier applied
- **Hit dice scaling**: Correct hit dice pool per class/level
- **Ability Score Improvements**: ASI at appropriate levels (4, 8, 12, 16, 19)
- Files: `src/types/character.ts`, new `src/utils/progressionUtils.ts`, new `src/components/LevelUpWizard/`

### 1.2 Subclass System
- **Subclass selection**: UI at appropriate levels (level 3 for most classes)
- **Subclass features**: Data and display for all PHB 2024 subclasses
- **Feature progression**: Subclass features at correct levels
- Expand: `src/data/classes.ts` (subclass details), `src/types/character.ts` (subclass field)

### 1.3 Combat Math Automation
- **Attack rolls**: d20 + ability mod + proficiency (if proficient) vs AC
- **Damage rolls**: Weapon damage dice + ability mod, damage types
- **Critical hits**: Double dice on natural 20
- **Saving throw rolls**: d20 + ability mod + proficiency vs DC
- **Spell attack & save DC**: Calculated from spellcasting ability + proficiency
- **Concentration checks**: CON save (DC 10 or half damage) when hit
- Files: new `src/utils/combatMathUtils.ts`, update `src/pages/CombatTracker.tsx`

### 1.4 Condition Automation
- **Mechanical effects**: Apply condition rules (e.g., restrained = disadvantage on DEX saves, advantage on attacks against)
- **Duration tracking**: Auto-decrement at start/end of turn
- **Concentration loss**: Auto-prompt when concentrating caster takes damage
- **Exhaustion effects**: Cumulative penalties per exhaustion level
- Update: `src/types/combat.ts`, `src/components/CombatParticipant.tsx`

### 1.5 Spell System Completion
- **Full spell database**: Expand from ~100 to all 400+ PHB 2024 spells (batch by level)
- **Spell preparation rules**: Max prepared = ability mod + level (class-dependent)
- **Concentration tracking**: Only one concentration spell at a time
- **Ritual casting**: Cast without slot if ritual tag and class supports it
- **Spell slot recovery**: Short rest (Warlock pact magic), long rest (others)
- Expand: `src/data/spells.ts`, update `src/components/SpellsManager.tsx`

### 1.6 Feat System
- **Feat data**: All PHB 2024 feats with prerequisites and effects
- **Feat selection**: During ASI levels, option to take feat instead
- **Feat effects**: Passive bonuses applied to character sheet
- New: `src/data/feats.ts`, `src/components/FeatSelector.tsx`

---

## Phase 2: Quality & Polish Foundation

Build the quality infrastructure needed before scaling further.

### 2.1 Test Coverage Expansion
- **Unit tests**: Combat math utils, progression utils, dice utils (all pure functions)
- **Component tests**: CharacterWizard steps, InventoryManager, SpellsManager
- **Integration tests**: Character create -> view -> edit -> delete flow
- **Storage tests**: Expand edge cases, migration testing
- Target: 60%+ coverage on utils/lib, 40%+ on components

### 2.2 Component Decomposition
- **CharacterView.tsx** (816 lines): Split into CharacterHeader, AbilityScoresPanel, CombatStatsPanel, ConditionsPanel, InventoryPanel, SpellsPanel, SkillsPanel, NotesPanel
- **CombatTracker.tsx**: Extract CombatControls, InitiativeList, CombatLog
- **DiceRollerInterface.tsx**: Extract DiceSelector, RollHistory, ModifierInput
- Improves testability, reusability, and maintainability

### 2.3 TypeScript Strictness
- Enable `strictNullChecks` and `noImplicitAny` incrementally
- Replace `as` type assertions with proper type guards
- Add runtime validation at data boundaries (storage reads, form inputs)
- Update: `tsconfig.json`, all files with type assertion issues

### 2.4 Data Export/Import
- **JSON export**: Full character data, NPC library, journal entries
- **JSON import**: Restore from export, validate shape before importing
- **PDF character sheet**: Generate printable D&D 5e character sheet
- **Share format**: Compact character export for sharing builds
- New: `src/utils/exportUtils.ts`, `src/components/ExportImportDialog.tsx`

### 2.5 PWA & Offline Support
- **Service worker**: Cache app shell and static assets
- **Web app manifest**: Install prompt, app icon, splash screen
- **Offline indicator**: Show connection status
- This is critical for table use where WiFi may be spotty

### 2.6 Accessibility Audit
- **ARIA attributes**: Labels, roles, live regions for dice rolls and combat updates
- **Keyboard navigation**: Full tab order, Enter/Space activation, Escape to close
- **Focus management**: Trap focus in dialogs, return focus on close
- **Screen reader**: Announce dice results, combat turn changes
- **Color contrast**: Verify all theme colors meet WCAG AA

---

## Phase 3: Multi-System Architecture

Refactor to support Dragonbane and Cyberpunk Red alongside D&D 5e.

### 3.1 System-Agnostic Core
- **Abstract character interface**: Common fields (name, HP, stats) with system-specific extensions
- **Plugin architecture**: Each game system registers its own: character sheet layout, dice mechanics, combat rules, data tables
- **System registry**: Dynamic loading of system-specific components and logic
- **Shared components**: Dice roller, journal, NPC library work across all systems
- Refactor: `src/types/`, new `src/systems/` directory structure

### 3.2 Dragonbane Implementation
- **Character creation**: Kin, profession, age, attributes (STR, CON, AGL, INT, WIL, CHA)
- **D20 roll-under mechanics**: Skill checks, ability checks (roll under stat)
- **Heroic abilities**: Tracking and usage
- **Conditions**: Dragonbane-specific (exhausted, sickly, dazed, angry, scared, disheartened)
- **Combat**: Initiative cards, round-based, movement/action economy
- **Equipment**: Dragonbane weapons, armor, gear with supply tracking
- New: `src/systems/dragonbane/`

### 3.3 Cyberpunk Red Implementation
- **Character creation**: Lifepath system, roles, stats (INT, REF, DEX, TECH, COOL, WILL, LUCK, MOVE, BODY, EMP)
- **Skill system**: Skill + stat + d10 vs DV
- **Combat**: Initiative, range bands, cover, critical injuries
- **Netrunning**: Interface, programs, NET architecture
- **Cyberware**: Humanity cost, installation, effects
- **Reputation & IP tracking**
- New: `src/systems/cyberpunk-red/`

### 3.4 System Switcher UX
- **Dashboard**: Show all characters across systems
- **System badges**: Visual indicators for which system a character belongs to
- **Per-system theming**: Color scheme/accent per game system
- **Quick switch**: Easy navigation between system-specific views

---

## Phase 4: Campaign & Social Features

Move beyond solo play into campaign and party management.

### 4.1 Campaign Management
- **Campaign entity**: Name, description, game system, associated characters, sessions
- **Campaign timeline**: Ordered session history with journal entries
- **World notes**: Locations, factions, plot threads (markdown with linking)
- **Campaign dashboard**: Overview of party, recent sessions, active quests
- New: `src/types/campaign.ts`, `src/pages/CampaignDashboard.tsx`

### 4.2 Encounter Builder
- **Monster library**: Stat blocks from Monster Manual 2025 data
- **CR calculator**: Estimated difficulty based on party level/size
- **Encounter templates**: Save and reuse encounter setups
- **Quick-start combat**: One-click from encounter to combat tracker with all combatants loaded
- New: `src/data/monsters.ts`, `src/pages/EncounterBuilder.tsx`

### 4.3 Rules Reference
- **Searchable rules**: Conditions, actions in combat, spellcasting rules, ability checks
- **Quick reference cards**: Common rules at a glance during play
- **Contextual help**: Tooltips and links from character sheet / combat tracker to relevant rules
- Source: Extract from `5e Source/` reference documents

### 4.4 Enhanced Journal
- **Rich text editor**: Markdown with preview, image embedding (base64 or URL)
- **Session templates**: Pre-built structures for session notes (recap, events, loot, XP)
- **NPC mentions**: Auto-link NPC names to NPC library entries
- **Timeline view**: Visual timeline of campaign events
- **Map notes**: Simple coordinate/location tagging on uploaded maps

---

## Phase 5: Backend & Cloud Infrastructure

Add server-side support for persistence, sync, and multiplayer.

### 5.1 Backend Foundation
- **Tech choice**: Node.js + Express (or Next.js API routes) + PostgreSQL (or Supabase for faster start)
- **User authentication**: Email/password + OAuth (Google, Discord)
- **REST API**: CRUD endpoints for characters, campaigns, NPCs, journal entries
- **Data migration**: Tool to migrate localStorage data to cloud account
- New: `server/` or transition to Next.js

### 5.2 Cloud Sync
- **Offline-first sync**: Local changes queue, sync when online
- **Conflict resolution**: Last-write-wins with manual merge option for conflicts
- **Real-time updates**: WebSocket or SSE for live data push
- **Selective sync**: Choose which characters/campaigns to keep local vs cloud

### 5.3 Multiplayer & Sharing
- **Party system**: DM creates party, players join with invite code
- **Shared combat tracker**: All party members see the same combat state
- **DM screen**: Private DM notes, hidden monster HP, secret rolls
- **Character sharing**: Public character builds with shareable links
- **Session scheduling**: Integrate with calendar, session reminders

### 5.4 DM Tools
- **Session prep workspace**: Notes, encounters, NPCs for upcoming session
- **Random generators**: NPC names, tavern descriptions, loot tables, plot hooks
- **Initiative tracker with DM controls**: Hidden enemies, delayed reveal
- **Soundboard integration**: Ambient sounds, music cues (links to external services)

---

## Phase 6: Advanced Features & Ecosystem

Long-term vision for a mature platform.

### 6.1 Character Builder Optimizer
- **Build planner**: Plan character progression to level 20
- **Multiclass support**: Multi-class combinations with prerequisite validation
- **Build sharing**: Community builds with ratings and comments
- **"What-if" mode**: Preview level-up choices before committing

### 6.2 Analytics & Insights
- **Roll statistics**: Dice history analysis, luck tracking, roll distributions
- **Session analytics**: Play time, combat duration, most-used spells
- **Character progression graph**: XP/level over time, HP growth
- **Campaign stats**: Sessions played, total combat rounds, loot acquired

### 6.3 Homebrew Support
- **Custom classes/subclasses**: User-defined with feature editor
- **Custom races/species**: Create and share homebrew species
- **Custom spells/items**: Full editor with balance guidelines
- **Homebrew packs**: Bundle and share collections of custom content

### 6.4 Mobile App
- **React Native or Capacitor**: Native mobile experience from shared codebase
- **Offline-first**: Full functionality without connection
- **Push notifications**: Session reminders, turn notifications in shared combat
- **Quick dice widget**: Home screen widget for fast rolls

---

## Cross-Cutting Concerns (Apply Throughout All Phases)

### Testing Strategy
- Every new utility function gets unit tests
- Every new component gets at least smoke tests
- Integration tests for critical user flows
- Test data factories for consistent mock data

### Documentation
- Update `architecture.md` with each architectural change
- API documentation when backend is added
- User-facing help/docs for the app itself
- Update `CLAUDE.md` and `AGENTS.md` as patterns evolve

### Performance
- Lazy loading for game system modules (Phase 3+)
- Virtual scrolling for long lists (spell database, monster library)
- IndexedDB migration for large datasets before backend (Phase 4)
- Image optimization and lazy loading

### Security (Phase 5+)
- Input sanitization on all user content
- Rate limiting on API endpoints
- Secure auth token handling (httpOnly cookies)
- Content Security Policy headers
- Regular dependency audits

---

## Suggested Implementation Order

```
NOW        Phase 1.1  Character Progression (leveling)
           Phase 1.3  Combat Math Automation
           Phase 1.5  Spell System Completion

NEXT       Phase 1.2  Subclass System
           Phase 1.4  Condition Automation
           Phase 1.6  Feat System
           Phase 2.1  Test Coverage Expansion
           Phase 2.2  Component Decomposition

THEN       Phase 2.4  Data Export/Import
           Phase 2.5  PWA & Offline
           Phase 2.6  Accessibility Audit
           Phase 2.3  TypeScript Strictness
           Phase 3.1  System-Agnostic Core Refactor

LATER      Phase 3.2  Dragonbane
           Phase 3.3  Cyberpunk Red
           Phase 4.1  Campaign Management
           Phase 4.2  Encounter Builder
           Phase 4.3  Rules Reference

FUTURE     Phase 5.x  Backend & Cloud
           Phase 6.x  Advanced Features
```

Each phase item is designed to be a standalone deliverable that improves the app incrementally. No phase requires later phases to be valuable.

---

## Verification

For each milestone:
1. `npm run build` passes with no errors
2. `npm test` passes with no failures
3. `npm run lint` passes clean
4. Manual testing of the new feature end-to-end
5. Existing features still work (regression check)
6. Documentation updated if architecture changed
