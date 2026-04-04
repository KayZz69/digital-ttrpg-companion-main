# Character Creation QA Documentation

> CCR-016 | Rules baseline: 2024 Player's Handbook (D&D 5e 2024)
> Last updated: 2026-04-04

---

## 1. Character Creation Flow

The wizard lives at route `/` and follows a fixed 10-step sequence. Each completed character is persisted to `localStorage` under `soloquest_characters` and stamped with `rulesVersion: "2024-dnd5e"`.

### Step Order

| # | Step Key | Label | Data Collected | Validation |
|---|----------|-------|---------------|------------|
| 1 | `basic` | Basic Info | `name` | Non-empty, max 50 characters |
| 2 | `race` | Race | `race`, `raceAbilityChoices`, `raceAbilityBonuses` | Race selected; if race has flexible ASI choices, all choices completed (distinct if required) |
| 3 | `class` | Class | `class`, `classId` | Class selected |
| 4 | `background` | Background | `background`, `backgroundSkills`, `backgroundTools`, `backgroundLanguages`, `backgroundEquipment`, `backgroundFeat` | Background selected |
| 5 | `abilities` | Ability Scores | `abilityScores` (STR/DEX/CON/INT/WIS/CHA) | All six scores present, finite, and between 3-20 |
| 6 | `skills` | Skills | `skills` (proficiency map) | Exactly N class skills chosen (per class `skillChoices.choose`); expertise count within class limit; expertise only on proficient skills; background skills remain proficient |
| 7 | `saves` | Saving Throws | `savingThrows` | Class saving throw proficiencies present and matching expected proficiencies |
| 8 | `spells` | Spells | `preparedSpells`, `spellSlots`, `spellcastingAbility`, `spellcastingType` | Skipped for non-casters. For casters: cantrip count matches class limit; leveled spell count matches known/prepared limit. Requires ability scores set first. |
| 9 | `equipment` | Equipment | `inventory`, `startingEquipmentChoiceId`, `equipmentSelectionMode` | At least one item; package mode requires a selected package ID; gold-buy mode cannot exceed class budget |
| 10 | `review` | Review | (none -- read-only summary) | All prior visible steps pass validation |

### Available Races (10)

Aasimar, Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human, Orc, Tiefling

### Available Classes (12)

Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard

### Available Backgrounds (13)

Acolyte, Charlatan, Criminal, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin

### Spellcasting Classification

| Category | Classes | Spellcasting Ability | Type |
|----------|---------|---------------------|------|
| Full caster (known) | Bard, Sorcerer | Charisma | `known` |
| Full caster (prepared) | Cleric, Druid | Wisdom | `prepared` |
| Full caster (prepared) | Wizard | Intelligence | `prepared` |
| Half caster (prepared) | Paladin | Charisma | `prepared` |
| Half caster (prepared) | Ranger | Wisdom | `prepared` |
| Pact caster | Warlock | Charisma | `pact` |
| Non-caster | Barbarian, Fighter, Monk, Rogue | -- | `none` |

### Spell Limits at Level 1

| Class | Cantrips | Leveled Spells | Slots (L1) |
|-------|----------|---------------|------------|
| Bard | 2 | 2 known | 2 |
| Cleric | 3 | 1 + WIS mod prepared | 2 |
| Druid | 2 | 1 + WIS mod prepared | 2 |
| Sorcerer | 4 | 2 known | 2 |
| Warlock | 2 | 2 known | 1 |
| Wizard | 3 | 1 + INT mod prepared | 2 |
| Paladin | 0 | 0 (no slots at level 1) | 0 |
| Ranger | 0 | 0 (no slots at level 1) | 0 |

### Equipment Modes

- **Packages:** Pre-curated starting equipment bundles per class. Selecting a package populates `inventory` and sets `startingEquipmentChoiceId`.
- **Gold-buy:** Manual item selection with a class-specific gold budget. Tracked via `equipmentSelectionMode: "gold-buy"`.

### Race Ability Score Bonuses

- **Fixed bonuses:** Parsed from strings like `"Strength +2, Charisma +1"` (e.g., Dragonborn).
- **Choice bonuses:** Parsed from `"Choose +2 to one ability and +1 to another"` patterns (e.g., Human). Requires distinct ability selections when multiple choices.
- **No bonuses:** Some races (e.g., Aasimar, Elf) have no ASI in the data.

---

## 2. QA Checklist

### 2.1 Step-by-Step Happy Path

- [ ] **Basic Info:** Enter a valid name (1-50 chars), advance to next step
- [ ] **Race:** Select each of the 10 races, verify traits display
- [ ] **Race (choice ASI):** For Human, select two distinct abilities for +2/+1 bonuses
- [ ] **Race (fixed ASI):** For Dragonborn, verify Strength +2 / Charisma +1 are shown
- [ ] **Class:** Select each of the 12 classes, verify hit die and features display
- [ ] **Background:** Select each of the 13 backgrounds, verify skills/tools/equipment/feat populate
- [ ] **Abilities:** Use Standard Array to assign all six scores
- [ ] **Abilities:** Use Point Buy to set all six scores within budget
- [ ] **Abilities:** Use Manual Entry to type all six scores
- [ ] **Skills:** Select exactly the required number of class skills
- [ ] **Skills (expertise):** For Rogue/Bard, select expertise on proficient skills
- [ ] **Saves:** Verify class saving throw proficiencies are pre-checked
- [ ] **Spells (full caster):** Select cantrips and leveled spells within limits
- [ ] **Spells (non-caster):** Step is skipped for Fighter, Barbarian, Monk, Rogue
- [ ] **Equipment (packages):** Select a starting equipment package, verify inventory populates
- [ ] **Equipment (gold-buy):** Add items within budget, verify total cost tracking
- [ ] **Review:** All fields display correctly, no validation errors
- [ ] **Save:** Character persists to localStorage with correct structure

### 2.2 Validation and Error Cases

#### Basic Info
- [ ] Empty name shows "Enter a character name."
- [ ] Name exceeding 50 characters shows length error
- [ ] Whitespace-only name is rejected

#### Race
- [ ] No race selected shows "Choose a race."
- [ ] Race with choice bonuses but incomplete selections shows "Complete race ability score bonus choices."
- [ ] Choice bonuses requiring distinct abilities rejects same ability selected twice

#### Class
- [ ] No class selected shows "Choose a class."

#### Background
- [ ] No background selected shows "Choose a background."

#### Abilities
- [ ] Missing ability scores shows "Set your ability scores."
- [ ] Score below 3 shows range error
- [ ] Score above 20 shows range error
- [ ] Non-finite score (NaN, undefined) shows invalid error

#### Skills
- [ ] Fewer than required class skills shows count error
- [ ] More than required class skills shows count error
- [ ] Expertise on non-proficient skill shows expertise proficiency error
- [ ] Expertise count exceeding class limit shows expertise count error
- [ ] Background skills removed from proficiency shows "Background skills must remain proficient."

#### Saves
- [ ] Missing class saving throw proficiency shows mismatch error

#### Spells
- [ ] Ability scores not set shows "Set your ability scores before spell selection."
- [ ] Exceeding cantrip limit is blocked
- [ ] Exceeding leveled spell limit is blocked
- [ ] Spell step validation uses effective (base + race bonus) ability scores

#### Equipment
- [ ] No items selected shows "Choose starting equipment."
- [ ] Package mode with no selected package shows package error
- [ ] Gold-buy exceeding budget shows budget error

#### Review
- [ ] Any unresolved step error blocks final save
- [ ] Review step aggregates all visible step errors

### 2.3 Cross-Step Interactions

- [ ] **Class change clears spells:** Changing class after selecting spells resets `preparedSpells`
- [ ] **Class change updates skills:** Changing class updates available skill choices
- [ ] **Class change updates saves:** Changing class updates saving throw proficiencies
- [ ] **Class change updates equipment:** Changing class resets equipment package selection
- [ ] **Race bonuses apply to ability scores:** Selecting a race with fixed or choice ASI modifies effective ability scores used in spell validation
- [ ] **Race change recalculates bonuses:** Changing race clears or recalculates `raceAbilityBonuses` and `raceAbilityChoices`
- [ ] **Background change updates skills:** Changing background updates `backgroundSkills`, which affects available class skill picks
- [ ] **Spell step visibility:** Step hidden for non-casting classes (Barbarian, Fighter, Monk, Rogue)
- [ ] **Half-caster level 1:** Paladin and Ranger have 0 spell slots at level 1 (no spells to select, 0 cantrips)

### 2.4 Spellcaster-Specific Flows

#### Full Casters -- Known (Bard, Sorcerer)
- [ ] Cantrip limit enforced (Bard: 2, Sorcerer: 4 at level 1)
- [ ] Known spell limit enforced (both: 2 at level 1)
- [ ] Cannot add leveled spells past known limit
- [ ] All selected spells are from the class spell list

#### Full Casters -- Prepared (Cleric, Druid, Wizard)
- [ ] Cantrip limit enforced (Cleric: 3, Druid: 2, Wizard: 3 at level 1)
- [ ] Prepared limit = level + ability modifier (minimum 1)
- [ ] With low ability score (e.g., 8), prepared limit floors at 1
- [ ] With high ability score (e.g., 20), prepared limit = 1 + 5 = 6

#### Pact Caster (Warlock)
- [ ] Cantrip limit enforced (2 at level 1)
- [ ] Known spell limit enforced (2 at level 1)
- [ ] Pact slot is 1 slot at spell level 1

#### Half Casters (Paladin, Ranger)
- [ ] 0 cantrips at all levels
- [ ] 0 spell slots at level 1 (spells effectively skip)
- [ ] At level 2+: prepared limit = floor(level/2) + ability modifier (minimum 1)

### 2.5 Non-Caster Flows

- [ ] **Barbarian:** Spell step skipped, hit die d12, STR/CON saves
- [ ] **Fighter:** Spell step skipped, hit die d10, STR/CON saves
- [ ] **Monk:** Spell step skipped, hit die d8, STR/DEX saves
- [ ] **Rogue:** Spell step skipped, hit die d8, DEX/INT saves, expertise available

### 2.6 Equipment Validation

- [ ] **Package mode:** Each of the 12 classes has at least one equipment package
- [ ] **Package items:** Selected package populates inventory with correct items
- [ ] **Gold-buy budget:** Each class has a positive integer gold budget
- [ ] **Gold-buy overspend:** Total cost exceeding budget shows error
- [ ] **Mode switch:** Switching from package to gold-buy (or vice versa) resets inventory
- [ ] **Background equipment:** Background-granted items display separately

### 2.7 Persistence and Export

- [ ] Saved character appears in `/characters` list
- [ ] Saved character loads correctly at `/character/:id`
- [ ] `rulesVersion` is set to `"2024-dnd5e"` on every new character
- [ ] `system` is set to `"dnd5e"` in the wrapper
- [ ] `createdAt` and `updatedAt` are valid ISO 8601 timestamps
- [ ] Character data is valid JSON (serializable, no circular references)
- [ ] Legacy characters without `rulesVersion` get migrated to `"2024-dnd5e"` on load

---

## 3. Test Coverage Summary

### Test File Inventory

| Test File | Module Under Test | Status |
|-----------|-------------------|--------|
| `src/utils/wizardValidation.test.ts` | Wizard step validation | Passing |
| `src/utils/diceUtils.test.ts` | Dice rolling utilities | Passing |
| `src/utils/progressionUtils.test.ts` | XP thresholds, HP gain, ASI | Passing |
| `src/utils/combatMathUtils.test.ts` | Attack, save, damage, concentration math | Passing |
| `src/utils/conditionUtils.test.ts` | Condition tracking utilities | Passing |
| `src/utils/spellUtils.test.ts` | Spell utility helpers | Passing |
| `src/lib/dndRules.test.ts` | Spell slots, cantrips, known/prepared limits | Passing |
| `src/lib/characterCreationRules.test.ts` | Race ability bonus parsing/application | Passing |
| `src/lib/dndCompendium.test.ts` | Compendium selectors | Passing |
| `src/lib/storage.test.ts` | localStorage persistence | Passing |
| `src/lib/__tests__/storage-migration.test.ts` | Legacy character migration | Passing |
| `src/lib/rules/__tests__/spells.test.ts` | 2024 PHB spell rules registry | Passing |
| `src/lib/rules/__tests__/equipment.test.ts` | Equipment rules registry | Passing |
| `src/lib/rules/equipment.test.ts` | Equipment packages, gold budgets, backgrounds | Passing |
| `src/lib/rules/__tests__/classChange.test.ts` | Class change reconciliation | Passing |
| `src/test/characterCreation.test.ts` | Character creation integration | Passing |
| `src/test/characterCreationE2E.test.ts` | End-to-end character creation flows | Passing |

### Current Test Counts

- **27 test files**, 692 total tests
- **692 passing**, 0 failures
- **27 test files passing**, 0 failing

### Coverage by Domain

| Domain | Covered | Key Gaps |
|--------|---------|----------|
| Wizard step validation | Good | All 10 steps validated in `wizardValidation.test.ts` |
| Spell rules (slots, cantrips, limits) | Good | Both `dndRules.test.ts` and `rules/__tests__/spells.test.ts` cover tables |
| Race ability bonuses | Good | Parsing, application, choice validation in `characterCreationRules.test.ts` |
| Equipment rules | Good | All 12 class packages, 13 backgrounds, gold budgets tested |
| Class change reconciliation | Good | Spell clearing, skill reset on class switch |
| Storage and migration | Good | localStorage CRUD, legacy migration to `"2024-dnd5e"` |
| Combat math | Good | Attack bonus, save DC, damage, concentration |
| Progression (XP, HP, ASI) | Good | Thresholds, HP gain, split ASI edge cases |
| UI component rendering | Good | All 9 wizard step components have passing tests |
| End-to-end wizard flow | Good | `characterCreation.test.ts` + `characterCreationE2E.test.ts` cover full flows for Fighter, Wizard, Cleric, class changes, and edge cases |

### Known Gaps and Risk

| Gap | Risk | Notes |
|-----|------|-------|
| No Warlock pact magic UI test | Low | Pact slot logic is tested at the rules layer but not at the UI step level |
| Limited race-class combination coverage | Low | Not every race + class combination is tested, but rules are class-agnostic |
| Page-level components (CharacterView, CombatTracker) | Low | No unit tests; these are composition layers, not rules logic |

---

## 4. Known Issues and Limitations

### Pre-Existing Lint Warnings

There are 13 shadcn/ui `useEffect` dependency warnings in `src/components/ui/` files. These are upstream shadcn patterns and are not project bugs. Do not modify shadcn primitives to fix these.

### Large Page Components

The following page components have been flagged in code review as candidates for decomposition but are functional:

- `CharacterWizard.tsx` -- orchestrates all 10 steps
- `CharacterView.tsx` -- full character sheet display
- `CombatTracker.tsx` -- combat state management

### Deviations from 2024 PHB

| Area | Deviation | Reference |
|------|-----------|-----------|
| Starting equipment | Curated rules-safe subset, not exhaustive 2024 PHB lists | `src/data/startingEquipment.ts` |
| Gold-buy | Alternative mode available alongside packages | ARCHITECTURE.md note |
| Subclasses | Listed in class data but not fully detailed | `src/data/classes.ts` -- features present, subclass mechanics not enforced |
| Multiclassing | Not supported | Single-class creation only |
| Feats | Background origin feat recorded but not mechanically enforced | `backgroundFeat` field stored but no feat effect system |
| Spell lists | Curated subset per class, not complete 2024 PHB spell list | Compendium coverage is partial |

### localStorage Constraints

- Storage key: `soloquest_characters`
- JSON shape changes are breaking changes for existing local data
- Legacy characters (pre-CCR-002) are migrated on load via `migrateCharacterRecord` in `src/lib/storage.ts`
- No cloud backup -- data loss on browser clear
