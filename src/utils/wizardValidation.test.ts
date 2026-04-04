import { describe, it, expect, vi } from "vitest";
import { getStepError, getAllStepErrors, WizardStepKey } from "./wizardValidation";
import type { DnD5eCharacter, DnD5eAbilityScores } from "@/types/character";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/dndCompendium", () => ({
  getRaceByName: vi.fn((name: string) => {
    if (name === "Human") {
      return { name: "Human", abilityScoreIncrease: "Strength +1, Dexterity +1" };
    }
    if (name === "Half-Elf") {
      return { name: "Half-Elf", abilityScoreIncrease: "Charisma +2, choose +1 to one ability and +1 to another" };
    }
    return undefined;
  }),
  getClassSkillChoices: vi.fn((className: string) => {
    if (className === "Fighter") return { choose: 2, from: ["Athletics", "Perception", "Intimidation", "Survival"] };
    if (className === "Rogue") return { choose: 4, from: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"] };
    return { choose: 0, from: [] };
  }),
  getClassExpertiseSelectionCount: vi.fn((_cls: string, _lvl: number) => 0),
  getClassSavingThrowProficiencies: vi.fn((className: string) => {
    if (className === "Fighter") return { strength: true, constitution: true };
    if (className === "Wizard") return { intelligence: true, wisdom: true };
    return {};
  }),
  getClassByName: vi.fn((className: string) => {
    if (className === "Fighter") return { id: "fighter", name: "Fighter" };
    if (className === "Wizard") return { id: "wizard", name: "Wizard" };
    return undefined;
  }),
  isSpellcastingClass: vi.fn((className: string) => className === "Wizard"),
  getClassSpellcastingAbility: vi.fn((className: string) => {
    if (className === "Wizard") return "intelligence";
    return undefined;
  }),
}));

vi.mock("@/lib/characterCreationRules", () => ({
  applyAbilityBonuses: vi.fn(
    (base: DnD5eAbilityScores, _bonuses?: Partial<Record<keyof DnD5eAbilityScores, number>>) => ({ ...base })
  ),
  hasRequiredRaceAbilityChoices: vi.fn((_increase: string, choices: unknown[]) => choices.length >= 0),
  ABILITY_KEYS: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
}));

vi.mock("@/lib/rules/spells", () => ({
  validateSpellStepComplete: vi.fn(() => ({ isComplete: true, errors: [] })),
}));

vi.mock("@/data", () => ({
  getStartingGoldBudget: vi.fn((_id: string) => 100),
}));

// Import mocked modules for per-test overrides
import { hasRequiredRaceAbilityChoices } from "@/lib/characterCreationRules";
import { validateSpellStepComplete } from "@/lib/rules/spells";
import { getClassExpertiseSelectionCount } from "@/lib/dndCompendium";

const mockedHasRequiredRaceAbilityChoices = vi.mocked(hasRequiredRaceAbilityChoices);
const mockedValidateSpellStepComplete = vi.mocked(validateSpellStepComplete);
const mockedGetClassExpertiseSelectionCount = vi.mocked(getClassExpertiseSelectionCount);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseScores: DnD5eAbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

function makeChar(overrides: Partial<DnD5eCharacter> = {}): Partial<DnD5eCharacter> {
  return {
    name: "Tav",
    race: "Human",
    class: "Fighter",
    background: "Soldier",
    level: 1,
    abilityScores: { ...baseScores },
    skills: { Athletics: "proficient", Perception: "proficient" },
    backgroundSkills: [],
    inventory: [{ id: "1", name: "Sword", quantity: 1, weight: 3, equipped: false }],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("wizardValidation", () => {
  // -----------------------------------------------------------------------
  // basic step
  // -----------------------------------------------------------------------
  describe("basic step", () => {
    it("passes with a valid name", () => {
      expect(getStepError("basic", makeChar({ name: "Tav" }))).toBeNull();
    });

    it("fails when name is empty", () => {
      expect(getStepError("basic", makeChar({ name: "" }))).toBe("Enter a character name.");
    });

    it("fails when name is undefined", () => {
      expect(getStepError("basic", makeChar({ name: undefined }))).toBe("Enter a character name.");
    });

    it("rejects whitespace-only name", () => {
      expect(getStepError("basic", makeChar({ name: "   " }))).toBe("Enter a character name.");
    });

    it("rejects names exceeding 50 characters", () => {
      const longName = "A".repeat(51);
      const err = getStepError("basic", makeChar({ name: longName }));
      expect(err).toBe("Character name must be 50 characters or fewer.");
    });

    it("accepts name at exactly 50 characters", () => {
      expect(getStepError("basic", makeChar({ name: "A".repeat(50) }))).toBeNull();
    });

    it("trims leading/trailing whitespace before checking length", () => {
      // "  A  " trims to "A" which is 1 char — valid
      expect(getStepError("basic", makeChar({ name: "  Tav  " }))).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // race step
  // -----------------------------------------------------------------------
  describe("race step", () => {
    it("passes with a valid race", () => {
      expect(getStepError("race", makeChar({ race: "Human" }))).toBeNull();
    });

    it("fails when race is empty", () => {
      expect(getStepError("race", makeChar({ race: "" }))).toBe("Choose a race.");
    });

    it("fails when race is undefined", () => {
      expect(getStepError("race", makeChar({ race: undefined }))).toBe("Choose a race.");
    });

    it("fails when race ability choices are incomplete", () => {
      mockedHasRequiredRaceAbilityChoices.mockReturnValueOnce(false);
      const err = getStepError("race", makeChar({ race: "Half-Elf", raceAbilityChoices: [] }));
      expect(err).toBe("Complete race ability score bonus choices.");
    });
  });

  // -----------------------------------------------------------------------
  // class step
  // -----------------------------------------------------------------------
  describe("class step", () => {
    it("passes with a valid class", () => {
      expect(getStepError("class", makeChar({ class: "Fighter" }))).toBeNull();
    });

    it("fails when class is empty", () => {
      expect(getStepError("class", makeChar({ class: "" }))).toBe("Choose a class.");
    });

    it("fails when class is undefined", () => {
      expect(getStepError("class", makeChar({ class: undefined }))).toBe("Choose a class.");
    });
  });

  // -----------------------------------------------------------------------
  // background step
  // -----------------------------------------------------------------------
  describe("background step", () => {
    it("passes with a background", () => {
      expect(getStepError("background", makeChar({ background: "Soldier" }))).toBeNull();
    });

    it("fails when background is missing", () => {
      expect(getStepError("background", makeChar({ background: "" }))).toBe("Choose a background.");
    });
  });

  // -----------------------------------------------------------------------
  // abilities step
  // -----------------------------------------------------------------------
  describe("abilities step", () => {
    it("passes with valid ability scores", () => {
      expect(getStepError("abilities", makeChar())).toBeNull();
    });

    it("fails when ability scores are undefined", () => {
      expect(getStepError("abilities", makeChar({ abilityScores: undefined }))).toBe(
        "Set your ability scores."
      );
    });

    it("fails when a score is below 3", () => {
      const scores = { ...baseScores, strength: 2 };
      expect(getStepError("abilities", makeChar({ abilityScores: scores }))).toBe(
        "All ability scores must be between 3 and 20."
      );
    });

    it("fails when a score is above 20", () => {
      const scores = { ...baseScores, charisma: 21 };
      expect(getStepError("abilities", makeChar({ abilityScores: scores }))).toBe(
        "All ability scores must be between 3 and 20."
      );
    });

    it("fails when a score is NaN", () => {
      const scores = { ...baseScores, wisdom: NaN };
      const err = getStepError("abilities", makeChar({ abilityScores: scores }));
      expect(err).toBe('Ability score "wisdom" is missing or invalid.');
    });

    it("handles missing ability key defensively", () => {
      // Cast to bypass TS — simulates corrupt data
      const partial = { strength: 10, dexterity: 10, constitution: 10 } as DnD5eAbilityScores;
      const err = getStepError("abilities", makeChar({ abilityScores: partial }));
      expect(err).toContain("missing or invalid");
    });

    it("accepts boundary values 3 and 20", () => {
      const scores: DnD5eAbilityScores = {
        strength: 3,
        dexterity: 20,
        constitution: 3,
        intelligence: 20,
        wisdom: 3,
        charisma: 20,
      };
      expect(getStepError("abilities", makeChar({ abilityScores: scores }))).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // skills step
  // -----------------------------------------------------------------------
  describe("skills step", () => {
    it("fails when class is not selected", () => {
      expect(getStepError("skills", makeChar({ class: "" }))).toBe(
        "Choose a class before selecting skills."
      );
    });

    it("passes when correct number of class skills are selected", () => {
      const char = makeChar({
        class: "Fighter",
        skills: { Athletics: "proficient", Perception: "proficient" },
        backgroundSkills: [],
      });
      expect(getStepError("skills", char)).toBeNull();
    });

    it("fails when wrong number of class skills are selected", () => {
      const char = makeChar({
        class: "Fighter",
        skills: { Athletics: "proficient" },
        backgroundSkills: [],
      });
      expect(getStepError("skills", char)).toMatch(/Select exactly 2 class skills/);
    });

    it("fails when expertise count exceeds slots", () => {
      mockedGetClassExpertiseSelectionCount.mockReturnValueOnce(0);
      const char = makeChar({
        class: "Fighter",
        skills: { Athletics: "expert", Perception: "expert" },
        backgroundSkills: [],
      });
      // Wrong class skill count is checked first, but here we have 2 expert from 4 possible
      // and 0 slots. The class selection count check comes first.
      // For this test we need the class skill count to pass:
      // expert counts as "not none", so classSelectionCount = 2 = choose. Then expertise check fires.
      const err = getStepError("skills", char);
      expect(err).toMatch(/expertise/i);
    });

    it("validates expertise can only be on proficient skills", () => {
      mockedGetClassExpertiseSelectionCount.mockReturnValueOnce(2);
      const char = makeChar({
        class: "Fighter",
        skills: {
          Athletics: "proficient",
          Perception: "proficient",
          // Arcana is not in Fighter's class skill list or background skills
          Arcana: "expert",
        },
        backgroundSkills: [],
      });
      const err = getStepError("skills", char);
      expect(err).toContain("Expertise can only be applied to proficient skills");
      expect(err).toContain("Arcana");
    });

    it("allows expertise on background skills", () => {
      mockedGetClassExpertiseSelectionCount.mockReturnValueOnce(1);
      const char = makeChar({
        class: "Fighter",
        skills: {
          Athletics: "proficient",
          Perception: "proficient",
          History: "expert",
        },
        backgroundSkills: ["History"],
      });
      expect(getStepError("skills", char)).toBeNull();
    });

    it("fails when background skills are not proficient", () => {
      const char = makeChar({
        class: "Fighter",
        skills: { Athletics: "proficient", Perception: "proficient" },
        backgroundSkills: ["History"],
      });
      expect(getStepError("skills", char)).toBe("Background skills must remain proficient.");
    });
  });

  // -----------------------------------------------------------------------
  // saves step
  // -----------------------------------------------------------------------
  describe("saves step", () => {
    it("fails when class is not selected", () => {
      expect(getStepError("saves", makeChar({ class: "" }))).toBe(
        "Choose a class before saving throws."
      );
    });

    it("passes when class is selected and no saving throws set yet", () => {
      expect(getStepError("saves", makeChar({ class: "Fighter", savingThrows: undefined }))).toBeNull();
    });

    it("passes when saving throws match class proficiencies", () => {
      expect(
        getStepError("saves", makeChar({
          class: "Fighter",
          savingThrows: { strength: true, constitution: true },
        }))
      ).toBeNull();
    });

    it("fails when saving throws are missing a class proficiency", () => {
      const err = getStepError("saves", makeChar({
        class: "Fighter",
        savingThrows: { strength: true, constitution: false },
      }));
      expect(err).toBe("Saving throw proficiencies do not match class requirements.");
    });

    it("passes when saving throws have extra proficiencies beyond class", () => {
      // Extra proficiencies are allowed (e.g., from feats)
      expect(
        getStepError("saves", makeChar({
          class: "Fighter",
          savingThrows: { strength: true, constitution: true, dexterity: true },
        }))
      ).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // spells step
  // -----------------------------------------------------------------------
  describe("spells step", () => {
    it("skips for non-spellcasting classes", () => {
      expect(getStepError("spells", makeChar({ class: "Fighter" }))).toBeNull();
    });

    it("fails when ability scores are missing for a spellcaster", () => {
      expect(
        getStepError("spells", makeChar({ class: "Wizard", abilityScores: undefined }))
      ).toBe("Set your ability scores before spell selection.");
    });

    it("passes when spell validation is complete", () => {
      mockedValidateSpellStepComplete.mockReturnValueOnce({ isComplete: true, errors: [] });
      expect(getStepError("spells", makeChar({ class: "Wizard" }))).toBeNull();
    });

    it("returns first error when spell validation fails", () => {
      mockedValidateSpellStepComplete.mockReturnValueOnce({
        isComplete: false,
        errors: ["Select 2 more cantrips.", "Select 4 more spells."],
      });
      expect(getStepError("spells", makeChar({ class: "Wizard" }))).toBe("Select 2 more cantrips.");
    });
  });

  // -----------------------------------------------------------------------
  // equipment step
  // -----------------------------------------------------------------------
  describe("equipment step", () => {
    it("fails when inventory is empty", () => {
      expect(getStepError("equipment", makeChar({ inventory: [] }))).toBe(
        "Choose starting equipment."
      );
    });

    it("fails when inventory is undefined", () => {
      expect(getStepError("equipment", makeChar({ inventory: undefined }))).toBe(
        "Choose starting equipment."
      );
    });

    it("passes with inventory items", () => {
      expect(getStepError("equipment", makeChar())).toBeNull();
    });

    it("fails when package mode has no package choice selected", () => {
      const err = getStepError(
        "equipment",
        makeChar({
          equipmentSelectionMode: "packages",
          startingEquipmentChoiceId: undefined,
        })
      );
      expect(err).toBe("Select a starting equipment package.");
    });

    it("passes when package mode has a package choice selected", () => {
      expect(
        getStepError(
          "equipment",
          makeChar({
            equipmentSelectionMode: "packages",
            startingEquipmentChoiceId: "fighter-pack-a",
          })
        )
      ).toBeNull();
    });

    it("fails when gold-buy cost exceeds budget", () => {
      const err = getStepError(
        "equipment",
        makeChar({ class: "Fighter", equipmentSelectionMode: "gold-buy" }),
        { equipmentCostInGp: 150 }
      );
      expect(err).toBe("Gold-buy equipment exceeds starting budget.");
    });

    it("passes when gold-buy cost is within budget", () => {
      expect(
        getStepError(
          "equipment",
          makeChar({ class: "Fighter", equipmentSelectionMode: "gold-buy" }),
          { equipmentCostInGp: 50 }
        )
      ).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // review step
  // -----------------------------------------------------------------------
  describe("review step", () => {
    it("returns null when all steps pass", () => {
      const visibleStepKeys: WizardStepKey[] = [
        "basic", "race", "class", "background", "abilities", "skills", "saves", "equipment", "review",
      ];
      expect(getStepError("review", makeChar(), { visibleStepKeys })).toBeNull();
    });

    it("returns the first error from visible steps", () => {
      const visibleStepKeys: WizardStepKey[] = [
        "basic", "race", "class", "background", "abilities", "skills", "saves", "equipment", "review",
      ];
      const char = makeChar({ name: "", class: "" });
      const err = getStepError("review", char, { visibleStepKeys });
      expect(err).toBe("Enter a character name.");
    });

    it("uses default step keys when visibleStepKeys not provided", () => {
      const char = makeChar({ name: "" });
      expect(getStepError("review", char)).toBe("Enter a character name.");
    });
  });

  // -----------------------------------------------------------------------
  // getAllStepErrors
  // -----------------------------------------------------------------------
  describe("getAllStepErrors", () => {
    it("returns errors for each step", () => {
      const visibleStepKeys: WizardStepKey[] = [
        "basic", "race", "class", "background", "abilities", "skills", "saves", "equipment", "review",
      ];
      const char = makeChar({ name: "", class: "" });
      const errors = getAllStepErrors(char, visibleStepKeys);
      expect(errors.basic).toBe("Enter a character name.");
      expect(errors.class).toBe("Choose a class.");
      expect(errors.skills).toBe("Choose a class before selecting skills.");
      expect(errors.review).toBeNull(); // review is always null in getAllStepErrors
    });

    it("returns null for valid steps", () => {
      const visibleStepKeys: WizardStepKey[] = ["basic", "race", "review"];
      const errors = getAllStepErrors(makeChar(), visibleStepKeys);
      expect(errors.basic).toBeNull();
      expect(errors.race).toBeNull();
      expect(errors.review).toBeNull();
    });

    it("propagates equipmentCostInGp option", () => {
      const visibleStepKeys: WizardStepKey[] = ["equipment", "review"];
      const char = makeChar({ class: "Fighter", equipmentSelectionMode: "gold-buy" });
      const errors = getAllStepErrors(char, visibleStepKeys, { equipmentCostInGp: 150 });
      expect(errors.equipment).toBe("Gold-buy equipment exceeds starting budget.");
    });
  });

  // -----------------------------------------------------------------------
  // unknown step
  // -----------------------------------------------------------------------
  describe("unknown step", () => {
    it("returns error for unrecognised step key", () => {
      expect(getStepError("bogus" as WizardStepKey, makeChar())).toBe("Unknown wizard step.");
    });
  });
});
