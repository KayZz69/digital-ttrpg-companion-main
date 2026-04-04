import { describe, expect, it } from "vitest";
import {
  getStepError,
  getAllStepErrors,
  type WizardStepKey,
} from "@/utils/wizardValidation";
import {
  getSpellSelectionState,
  getMaxCantrips,
  getSpellcastingRuleMode,
} from "@/lib/dndRules";
import {
  applyAbilityBonuses,
  buildRaceAbilityBonuses,
  parseAbilityScoreIncrease,
  hasRequiredRaceAbilityChoices,
} from "@/lib/characterCreationRules";
import {
  validateSpellStepComplete,
  getSpellcastingType,
  getMaxPreparedSpells,
  getCantrips,
  getHighestAvailableSlotLevel,
} from "@/lib/rules/spells";
import { getEquipmentRegistry } from "@/lib/rules/equipment";
import {
  reconcileClassChange,
  reconcileSpellsForClassChange,
  reconcileEquipmentForClassChange,
} from "@/lib/rules/classChange";
import {
  getRaceByName,
  getClassSkillChoices,
  getClassSavingThrowProficiencies,
  getClassSpellcastingAbility,
  getClassStartingEquipmentChoices,
  isSpellcastingClass,
  getClassSpells,
} from "@/lib/dndCompendium";
import type { DnD5eCharacter, DnD5eAbilityScores, PreparedSpell } from "@/types/character";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_SCORES: DnD5eAbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

function makeMinimalCharacter(overrides: Partial<DnD5eCharacter> = {}): Partial<DnD5eCharacter> {
  return {
    id: "test-char-1",
    name: "Test Hero",
    race: "Human",
    class: "Fighter",
    level: 1,
    background: "Soldier",
    abilityScores: { ...BASE_SCORES },
    ...overrides,
  };
}

function makeSpell(id: string, name: string, level: number): PreparedSpell {
  return {
    id: `prepared-${id}`,
    sourceSpellId: id,
    name,
    level,
    school: "Evocation",
    castingTime: "1 action",
    range: "60 feet",
    components: "V, S",
    duration: "Instantaneous",
    description: `Test spell: ${name}`,
  };
}

const ALL_STEPS: WizardStepKey[] = [
  "basic", "race", "class", "background", "abilities",
  "skills", "saves", "spells", "equipment", "review",
];

// ---------------------------------------------------------------------------
// Scenario Group 1: Full character creation validation pipeline
// ---------------------------------------------------------------------------

describe("Scenario 1: Full character creation validation pipeline", () => {
  describe("complete Fighter character step by step", () => {
    const fighterSkillChoices = getClassSkillChoices("Fighter");
    const fighterSaves = getClassSavingThrowProficiencies("Fighter");
    const equipChoices = getClassStartingEquipmentChoices("Fighter");

    // Pick 2 skills from the fighter list
    const selectedSkillNames = fighterSkillChoices.from.slice(0, fighterSkillChoices.choose);

    const fighterSkills: Record<string, string> = {};
    for (const skill of selectedSkillNames) {
      fighterSkills[skill] = "proficient";
    }

    const fighter = makeMinimalCharacter({
      class: "Fighter",
      race: "Human",
      background: "Soldier",
      backgroundSkills: ["Athletics", "Intimidation"],
      abilityScores: { ...BASE_SCORES, strength: 16, constitution: 14 },
      skills: {
        ...fighterSkills,
        Athletics: "proficient",
        Intimidation: "proficient",
      },
      savingThrows: fighterSaves,
      inventory: equipChoices.length > 0
        ? equipChoices[0].items.map((itemName, i) => ({
            id: `item-${i}`,
            name: itemName,
            quantity: 1,
            weight: 1,
            equipped: false,
          }))
        : [{ id: "item-0", name: "Longsword", quantity: 1, weight: 3, equipped: false }],
      startingEquipmentChoiceId: equipChoices[0]?.id,
      equipmentSelectionMode: "packages" as const,
    });

    it("basic step passes", () => {
      expect(getStepError("basic", fighter)).toBeNull();
    });

    it("race step passes", () => {
      expect(getStepError("race", fighter)).toBeNull();
    });

    it("class step passes", () => {
      expect(getStepError("class", fighter)).toBeNull();
    });

    it("background step passes", () => {
      expect(getStepError("background", fighter)).toBeNull();
    });

    it("abilities step passes", () => {
      expect(getStepError("abilities", fighter)).toBeNull();
    });

    it("skills step passes", () => {
      expect(getStepError("skills", fighter)).toBeNull();
    });

    it("saves step passes", () => {
      expect(getStepError("saves", fighter)).toBeNull();
    });

    it("spells step passes (non-caster)", () => {
      expect(getStepError("spells", fighter)).toBeNull();
    });

    it("equipment step passes", () => {
      expect(getStepError("equipment", fighter)).toBeNull();
    });

    it("review step passes with all steps valid", () => {
      expect(getStepError("review", fighter, { visibleStepKeys: ALL_STEPS })).toBeNull();
    });

    it("getAllStepErrors returns null for every step", () => {
      const errors = getAllStepErrors(fighter, ALL_STEPS);
      for (const key of ALL_STEPS) {
        expect(errors[key]).toBeNull();
      }
    });
  });

  describe("complete Wizard (spellcaster) character step by step", () => {
    const wizardSkillChoices = getClassSkillChoices("Wizard");
    const wizardSaves = getClassSavingThrowProficiencies("Wizard");
    const equipChoices = getClassStartingEquipmentChoices("Wizard");

    // Wizard: INT-based, level 1 prepared caster
    // At level 1 with INT 16 (+3): prepared = 1 + 3 = 4 leveled spells
    // Cantrips: 3 at level 1
    const wizardSpells = getClassSpells("Wizard");
    const wizardCantrips = wizardSpells.filter((s) => s.level === 0).slice(0, 3);
    const wizardLevel1 = wizardSpells.filter((s) => s.level === 1).slice(0, 4);

    const preparedSpells: PreparedSpell[] = [
      ...wizardCantrips.map((s) => makeSpell(s.id, s.name, s.level)),
      ...wizardLevel1.map((s) => makeSpell(s.id, s.name, s.level)),
    ];

    const backgroundSkills = ["Arcana", "History"];
    const backgroundSkillSet = new Set(backgroundSkills);
    // Pick class skills that don't overlap with background skills
    const classSkillPicks = wizardSkillChoices.from
      .filter((s) => !backgroundSkillSet.has(s))
      .slice(0, wizardSkillChoices.choose);
    const wizardSkills: Record<string, string> = {};
    for (const skill of classSkillPicks) {
      wizardSkills[skill] = "proficient";
    }
    // Background skills must also be proficient
    for (const skill of backgroundSkills) {
      wizardSkills[skill] = "proficient";
    }

    const wizard = makeMinimalCharacter({
      class: "Wizard",
      race: "Human",
      background: "Sage",
      backgroundSkills,
      abilityScores: { ...BASE_SCORES, intelligence: 16, constitution: 14 },
      skills: wizardSkills,
      savingThrows: wizardSaves,
      preparedSpells,
      inventory: equipChoices.length > 0
        ? equipChoices[0].items.map((itemName, i) => ({
            id: `item-${i}`,
            name: itemName,
            quantity: 1,
            weight: 1,
            equipped: false,
          }))
        : [{ id: "item-0", name: "Quarterstaff", quantity: 1, weight: 4, equipped: false }],
      startingEquipmentChoiceId: equipChoices[0]?.id,
      equipmentSelectionMode: "packages" as const,
    });

    it("basic step passes", () => {
      expect(getStepError("basic", wizard)).toBeNull();
    });

    it("race step passes", () => {
      expect(getStepError("race", wizard)).toBeNull();
    });

    it("class step passes", () => {
      expect(getStepError("class", wizard)).toBeNull();
    });

    it("background step passes", () => {
      expect(getStepError("background", wizard)).toBeNull();
    });

    it("abilities step passes", () => {
      expect(getStepError("abilities", wizard)).toBeNull();
    });

    it("skills step passes", () => {
      expect(getStepError("skills", wizard)).toBeNull();
    });

    it("saves step passes", () => {
      expect(getStepError("saves", wizard)).toBeNull();
    });

    it("spells step passes with correct cantrip and leveled counts", () => {
      expect(getStepError("spells", wizard)).toBeNull();
    });

    it("equipment step passes", () => {
      expect(getStepError("equipment", wizard)).toBeNull();
    });

    it("review step passes", () => {
      expect(getStepError("review", wizard, { visibleStepKeys: ALL_STEPS })).toBeNull();
    });
  });

  describe("complete Cleric character step by step", () => {
    const clericSkillChoices = getClassSkillChoices("Cleric");
    const clericSaves = getClassSavingThrowProficiencies("Cleric");
    const equipChoices = getClassStartingEquipmentChoices("Cleric");

    // Cleric: WIS-based, level 1 prepared caster
    // At level 1 with WIS 16 (+3): prepared = 1 + 3 = 4 leveled spells
    // Cantrips: 3 at level 1
    const clericSpells = getClassSpells("Cleric");
    const clericCantrips = clericSpells.filter((s) => s.level === 0).slice(0, 3);
    const clericLevel1 = clericSpells.filter((s) => s.level === 1).slice(0, 4);

    const preparedSpells: PreparedSpell[] = [
      ...clericCantrips.map((s) => makeSpell(s.id, s.name, s.level)),
      ...clericLevel1.map((s) => makeSpell(s.id, s.name, s.level)),
    ];

    const clericBgSkills = ["Insight", "Religion"];
    const clericBgSet = new Set(clericBgSkills);
    // Pick class skills that don't overlap with background skills
    const clericClassPicks = clericSkillChoices.from
      .filter((s) => !clericBgSet.has(s))
      .slice(0, clericSkillChoices.choose);
    const clericSkills: Record<string, string> = {};
    for (const skill of clericClassPicks) {
      clericSkills[skill] = "proficient";
    }
    for (const skill of clericBgSkills) {
      clericSkills[skill] = "proficient";
    }

    const cleric = makeMinimalCharacter({
      class: "Cleric",
      race: "Dwarf",
      background: "Acolyte",
      backgroundSkills: clericBgSkills,
      raceAbilityBonuses: { constitution: 2 },
      abilityScores: { ...BASE_SCORES, wisdom: 16, constitution: 14, strength: 12 },
      skills: clericSkills,
      savingThrows: clericSaves,
      preparedSpells,
      inventory: equipChoices.length > 0
        ? equipChoices[0].items.map((itemName, i) => ({
            id: `item-${i}`,
            name: itemName,
            quantity: 1,
            weight: 1,
            equipped: false,
          }))
        : [{ id: "item-0", name: "Mace", quantity: 1, weight: 4, equipped: false }],
      startingEquipmentChoiceId: equipChoices[0]?.id,
      equipmentSelectionMode: "packages" as const,
    });

    it("all steps pass for a complete Cleric", () => {
      const errors = getAllStepErrors(cleric, ALL_STEPS);
      for (const key of ALL_STEPS) {
        expect(errors[key]).toBeNull();
      }
    });

    it("spell step validates with domain spell count", () => {
      expect(getStepError("spells", cleric)).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Scenario Group 2: Cross-module rule consistency
// ---------------------------------------------------------------------------

describe("Scenario 2: Cross-module rule consistency", () => {
  it("race ability bonuses produce valid ability scores that pass validation", () => {
    const race = getRaceByName("Dragonborn");
    expect(race).toBeDefined();

    const parsed = parseAbilityScoreIncrease(race!.abilityScoreIncrease);
    expect(parsed.fixedBonuses.strength).toBe(2);
    expect(parsed.fixedBonuses.charisma).toBe(1);

    const bonuses = buildRaceAbilityBonuses(race!.abilityScoreIncrease);
    const base: DnD5eAbilityScores = {
      strength: 15, dexterity: 13, constitution: 14,
      intelligence: 10, wisdom: 12, charisma: 8,
    };
    const effective = applyAbilityBonuses(base, bonuses);

    expect(effective.strength).toBe(17);
    expect(effective.charisma).toBe(9);

    // Scores should all pass abilities validation
    const char = makeMinimalCharacter({
      race: "Dragonborn",
      abilityScores: base,
      raceAbilityBonuses: bonuses,
    });
    expect(getStepError("abilities", char)).toBeNull();
  });

  it("race with no ability score increase needs no choices", () => {
    const race = getRaceByName("Aasimar");
    expect(race).toBeDefined();
    // Aasimar has no abilityScoreIncrease field
    expect(hasRequiredRaceAbilityChoices(race!.abilityScoreIncrease, [])).toBe(true);
  });

  it("class spell limits from dndRules match what spellValidation expects", () => {
    // Wizard level 1, INT 16 (+3 mod) -> 4 prepared leveled spells, 3 cantrips
    const dndRulesState = getSpellSelectionState("Wizard", 1, 16, []);
    expect(dndRulesState.maxCantrips).toBe(3);
    expect(dndRulesState.maxLeveledSpells).toBe(4);

    // The registry-based spell validation should produce consistent limits
    const registryMax = getMaxPreparedSpells("wizard", 1, 3); // mod = +3
    expect(registryMax).toBe(4);

    const registryCantrips = getCantrips("wizard", 1);
    expect(registryCantrips).not.toBeNull();
    expect(registryCantrips!.maxKnown).toBe(3);
  });

  it("Cleric spell limits are consistent across modules", () => {
    // Cleric level 1, WIS 14 (+2 mod) -> 3 prepared leveled spells, 3 cantrips
    const dndRulesState = getSpellSelectionState("Cleric", 1, 14, []);
    expect(dndRulesState.maxCantrips).toBe(3);
    expect(dndRulesState.maxLeveledSpells).toBe(3);

    const registryMax = getMaxPreparedSpells("cleric", 1, 2);
    expect(registryMax).toBe(3);
  });

  it("equipment packages from equipment rules produce inventory that passes validation", () => {
    const registry = getEquipmentRegistry();
    const fighterEquip = registry.getEquipmentRules("fighter");
    expect(fighterEquip).not.toBeNull();
    expect(fighterEquip!.packages.length).toBeGreaterThan(0);

    const pkg = fighterEquip!.packages[0];
    const inventory = pkg.items.map((itemName, i) => ({
      id: `item-${i}`,
      name: itemName,
      quantity: 1,
      weight: 1,
      equipped: false,
    }));

    const char = makeMinimalCharacter({
      class: "Fighter",
      inventory,
      startingEquipmentChoiceId: pkg.id,
      equipmentSelectionMode: "packages" as const,
    });

    expect(getStepError("equipment", char)).toBeNull();
  });

  it("saving throws auto-populated by class data match what validation expects", () => {
    const classes = ["Fighter", "Wizard", "Cleric", "Rogue"];
    for (const cls of classes) {
      const saves = getClassSavingThrowProficiencies(cls);
      const char = makeMinimalCharacter({
        class: cls,
        savingThrows: saves,
      });
      expect(getStepError("saves", char)).toBeNull();
    }
  });

  it("non-spellcasting class has no spellcasting type", () => {
    expect(isSpellcastingClass("Fighter")).toBe(false);
    expect(getSpellcastingType("fighter")).toBe("none");
    expect(getClassSpellcastingAbility("Fighter")).toBeUndefined();
  });

  it("spellcasting class abilities are consistent", () => {
    expect(getClassSpellcastingAbility("Wizard")).toBe("intelligence");
    expect(getClassSpellcastingAbility("Cleric")).toBe("wisdom");
    expect(getClassSpellcastingAbility("Sorcerer")).toBe("charisma");
  });
});

// ---------------------------------------------------------------------------
// Scenario Group 3: Class change reconciliation E2E
// ---------------------------------------------------------------------------

describe("Scenario 3: Class change reconciliation E2E", () => {
  it("Wizard with spells switched to Fighter -> spells cleared, validation passes", () => {
    const wizardSpells = getClassSpells("Wizard");
    const cantrips = wizardSpells.filter((s) => s.level === 0).slice(0, 3);
    const leveled = wizardSpells.filter((s) => s.level === 1).slice(0, 4);

    const currentSpells = [
      ...cantrips.map((s) => ({
        id: `prepared-${s.id}`,
        sourceSpellId: s.id,
        name: s.name,
        level: s.level,
      })),
      ...leveled.map((s) => ({
        id: `prepared-${s.id}`,
        sourceSpellId: s.id,
        name: s.name,
        level: s.level,
      })),
    ];

    const result = reconcileClassChange("wizard", "fighter", 1, 16, currentSpells);

    // Fighter has no spellcasting
    expect(result.newSpellcastingType).toBe("none");
    // All spells should be removed
    expect(result.spells.kept).toHaveLength(0);
    expect(result.spells.removed.length).toBe(currentSpells.length);
    // Equipment should be cleared on class change
    expect(result.equipment.shouldClearEquipment).toBe(true);
    // Summary should mention no spellcasting
    expect(result.changeSummary.some((s) => s.includes("no spellcasting"))).toBe(true);

    // After reconciliation, the fighter character should pass spell validation
    const fighterChar = makeMinimalCharacter({
      class: "Fighter",
      preparedSpells: [],
    });
    expect(getStepError("spells", fighterChar)).toBeNull();
  });

  it("Wizard with spells switched to Sorcerer -> compatible spells kept", () => {
    // Find spells that are on BOTH Wizard and Sorcerer lists
    const wizardSpells = getClassSpells("Wizard");
    const sorcererSpells = getClassSpells("Sorcerer");
    const sorcererSpellIds = new Set(sorcererSpells.map((s) => s.id));

    const sharedCantrips = wizardSpells
      .filter((s) => s.level === 0 && sorcererSpellIds.has(s.id))
      .slice(0, 3);
    const sharedLeveled = wizardSpells
      .filter((s) => s.level === 1 && sorcererSpellIds.has(s.id))
      .slice(0, 2);

    // Also add a wizard-only spell
    const wizardOnlyLeveled = wizardSpells
      .filter((s) => s.level === 1 && !sorcererSpellIds.has(s.id))
      .slice(0, 1);

    const currentSpells = [
      ...sharedCantrips.map((s) => ({
        id: `prepared-${s.id}`,
        sourceSpellId: s.id,
        name: s.name,
        level: s.level,
      })),
      ...sharedLeveled.map((s) => ({
        id: `prepared-${s.id}`,
        sourceSpellId: s.id,
        name: s.name,
        level: s.level,
      })),
      ...wizardOnlyLeveled.map((s) => ({
        id: `prepared-${s.id}`,
        sourceSpellId: s.id,
        name: s.name,
        level: s.level,
      })),
    ];

    // Sorcerer is CHA-based; use CHA 16 (+3)
    const result = reconcileSpellsForClassChange("sorcerer", 1, 16, currentSpells);

    // Shared spells should be kept (up to Sorcerer's limits)
    expect(result.kept.length).toBeGreaterThan(0);

    // Wizard-only spells should be removed
    if (wizardOnlyLeveled.length > 0) {
      const removedNames = result.removed.map((r) => r.name);
      expect(removedNames).toContain(wizardOnlyLeveled[0].name);
    }

    // The sorcerer type should be "known"
    expect(getSpellcastingType("sorcerer")).toBe("known");
  });

  it("Fighter with equipment switched to Wizard -> equipment cleared", () => {
    const result = reconcileEquipmentForClassChange("fighter", "wizard");
    expect(result.shouldClearEquipment).toBe(true);
    expect(result.shouldResetMode).toBe(true);
  });

  it("same class change does not clear equipment", () => {
    const result = reconcileEquipmentForClassChange("wizard", "wizard");
    expect(result.shouldClearEquipment).toBe(false);
    expect(result.shouldResetMode).toBe(false);
  });

  it("full reconciliation builds a meaningful summary", () => {
    const wizardSpells = getClassSpells("Wizard");
    const spells = wizardSpells.filter((s) => s.level <= 1).slice(0, 5).map((s) => ({
      id: `prepared-${s.id}`,
      sourceSpellId: s.id,
      name: s.name,
      level: s.level,
    }));

    const result = reconcileClassChange("wizard", "fighter", 1, 16, spells);
    expect(result.changeSummary.length).toBeGreaterThan(0);
    expect(result.changeSummary.some((s) => s.includes("Equipment"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Scenario Group 4: Edge cases across modules
// ---------------------------------------------------------------------------

describe("Scenario 4: Edge cases across modules", () => {
  it("character with all minimum valid ability scores passes full validation", () => {
    const minScores: DnD5eAbilityScores = {
      strength: 3, dexterity: 3, constitution: 3,
      intelligence: 3, wisdom: 3, charisma: 3,
    };

    const char = makeMinimalCharacter({
      abilityScores: minScores,
    });

    expect(getStepError("abilities", char)).toBeNull();
  });

  it("character with all maximum valid ability scores passes validation", () => {
    const maxScores: DnD5eAbilityScores = {
      strength: 20, dexterity: 20, constitution: 20,
      intelligence: 20, wisdom: 20, charisma: 20,
    };

    const char = makeMinimalCharacter({
      abilityScores: maxScores,
    });

    expect(getStepError("abilities", char)).toBeNull();
  });

  it("ability score below minimum fails validation", () => {
    const badScores: DnD5eAbilityScores = {
      strength: 2, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10,
    };

    const char = makeMinimalCharacter({ abilityScores: badScores });
    expect(getStepError("abilities", char)).not.toBeNull();
  });

  it("Ranger at level 1 has no spell slots (half-caster)", () => {
    // Half-casters get no slots at level 1
    const highestSlot = getHighestAvailableSlotLevel("ranger", 1);
    expect(highestSlot).toBe(0);

    // Ranger gets 0 cantrips
    const cantripData = getCantrips("ranger", 1);
    expect(cantripData).toBeNull();

    // Ranger at level 1 has 0 max prepared spells (no slots)
    const maxPrepared = getMaxPreparedSpells("ranger", 1, 2); // WIS +2
    expect(maxPrepared).toBe(0);
  });

  it("Ranger at level 1 spell step passes with no spells selected", () => {
    // Even though Ranger is a spellcaster, at level 1 they have no slots
    // and no cantrips, so selecting 0 spells should be valid
    const rangerSaves = getClassSavingThrowProficiencies("Ranger");
    const char = makeMinimalCharacter({
      class: "Ranger",
      abilityScores: { ...BASE_SCORES, wisdom: 14, dexterity: 16 },
      savingThrows: rangerSaves,
      preparedSpells: [],
    });
    expect(getStepError("spells", char)).toBeNull();
  });

  it("Paladin at level 1 has no spell slots (half-caster)", () => {
    const highestSlot = getHighestAvailableSlotLevel("paladin", 1);
    expect(highestSlot).toBe(0);

    const cantripData = getCantrips("paladin", 1);
    expect(cantripData).toBeNull();

    const maxPrepared = getMaxPreparedSpells("paladin", 1, 3);
    expect(maxPrepared).toBe(0);
  });

  it("Sorcerer known spell limits are separate from prepared caster limits", () => {
    // Sorcerer is a "known" caster, not "prepared"
    expect(getSpellcastingRuleMode("Sorcerer")).toBe("known");
    expect(getSpellcastingType("sorcerer")).toBe("known");

    // At level 1 with CHA 16: known = 3 (from table, not ability-based)
    const maxKnown = getMaxPreparedSpells("sorcerer", 1, 3);
    expect(maxKnown).toBe(3);

    // Cantrips: 4 at level 1 for Sorcerer
    const maxCantrips = getMaxCantrips("Sorcerer", 1);
    expect(maxCantrips).toBe(4);
  });

  it("empty name fails basic step", () => {
    const char = makeMinimalCharacter({ name: "" });
    expect(getStepError("basic", char)).not.toBeNull();
  });

  it("name over 50 chars fails basic step", () => {
    const char = makeMinimalCharacter({ name: "A".repeat(51) });
    expect(getStepError("basic", char)).not.toBeNull();
  });

  it("missing class fails class step", () => {
    const char = makeMinimalCharacter({ class: undefined });
    expect(getStepError("class", char)).not.toBeNull();
  });

  it("missing background fails background step", () => {
    const char = makeMinimalCharacter({ background: undefined });
    expect(getStepError("background", char)).not.toBeNull();
  });

  it("missing race fails race step", () => {
    const char = makeMinimalCharacter({ race: undefined });
    expect(getStepError("race", char)).not.toBeNull();
  });

  it("empty inventory fails equipment step", () => {
    const char = makeMinimalCharacter({ inventory: [] });
    expect(getStepError("equipment", char)).not.toBeNull();
  });

  it("Wizard spell validation fails when too few cantrips selected", () => {
    const wizardSpells = getClassSpells("Wizard");
    const oneCantrip = wizardSpells.filter((s) => s.level === 0).slice(0, 1);
    const leveled = wizardSpells.filter((s) => s.level === 1).slice(0, 4);

    const result = validateSpellStepComplete(
      "wizard",
      1,
      16,
      [
        ...oneCantrip.map((s) => ({ level: s.level })),
        ...leveled.map((s) => ({ level: s.level })),
      ]
    );

    expect(result.isComplete).toBe(false);
    expect(result.errors.some((e) => e.includes("cantrip"))).toBe(true);
  });

  it("equipment registry covers all 12 classes", () => {
    const registry = getEquipmentRegistry();
    const classIds = registry.getSupportedClassIds();
    expect(classIds.length).toBe(12);
    for (const id of classIds) {
      const rules = registry.getEquipmentRules(id);
      expect(rules).not.toBeNull();
      expect(rules!.packages.length).toBeGreaterThan(0);
    }
  });

  it("race ability bonuses cap at 20", () => {
    const base: DnD5eAbilityScores = {
      strength: 20, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10,
    };
    const bonuses = { strength: 2 };
    const effective = applyAbilityBonuses(base, bonuses);
    expect(effective.strength).toBe(20);
  });
});
