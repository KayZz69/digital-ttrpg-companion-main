import { describe, expect, it } from "vitest";
import { DnD5eCharacter } from "@/types/character";
import {
  getStepErrors,
  getStepError,
  getCrossStepErrors,
} from "./wizardValidation";
import {
  getClassByName,
  getClassSavingThrowProficiencies,
  getClassSkillChoices,
  getClassSpellcastingAbility,
  isSpellcastingClass,
} from "@/lib/dndCompendium";

function makeCharacter(overrides: Partial<DnD5eCharacter> = {}): Partial<DnD5eCharacter> {
  return {
    name: "Test Hero",
    race: "Human",
    class: "Fighter",
    level: 1,
    background: "Soldier",
    abilityScores: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    },
    experiencePoints: 0,
    hitPoints: { current: 12, max: 12 },
    inventory: [
      {
        id: "item-1",
        name: "Longsword",
        quantity: 1,
        weight: 3,
        equipped: false,
      },
    ],
    skills: {},
    savingThrows: getClassSavingThrowProficiencies("Fighter"),
    ...overrides,
  };
}

describe("wizardValidation", () => {
  // -------------------------------------------------------------------------
  // Basic Info Step
  // -------------------------------------------------------------------------
  describe("basic step", () => {
    it("passes with a valid name", () => {
      const errors = getStepErrors("basic", makeCharacter({ name: "Aragorn" }));
      expect(errors).toEqual([]);
    });

    it("fails with empty name", () => {
      const errors = getStepErrors("basic", makeCharacter({ name: "" }));
      expect(errors).toContain("Enter a character name.");
    });

    it("fails with whitespace-only name", () => {
      const errors = getStepErrors("basic", makeCharacter({ name: "   " }));
      expect(errors).toContain("Enter a character name.");
    });
  });

  // -------------------------------------------------------------------------
  // Race Step
  // -------------------------------------------------------------------------
  describe("race step", () => {
    it("passes with a valid race", () => {
      const errors = getStepErrors("race", makeCharacter({ race: "Human" }));
      expect(errors).toEqual([]);
    });

    it("fails with no race selected", () => {
      const errors = getStepErrors("race", makeCharacter({ race: "" }));
      expect(errors).toContain("Choose a race.");
    });

    it("fails with undefined race", () => {
      const errors = getStepErrors("race", makeCharacter({ race: undefined }));
      expect(errors).toContain("Choose a race.");
    });
  });

  // -------------------------------------------------------------------------
  // Class Step
  // -------------------------------------------------------------------------
  describe("class step", () => {
    it("passes with a valid class", () => {
      const errors = getStepErrors("class", makeCharacter({ class: "Fighter" }));
      expect(errors).toEqual([]);
    });

    it("fails with no class selected", () => {
      const errors = getStepErrors("class", makeCharacter({ class: "" }));
      expect(errors).toContain("Choose a class.");
    });
  });

  // -------------------------------------------------------------------------
  // Background Step
  // -------------------------------------------------------------------------
  describe("background step", () => {
    it("passes with a valid background", () => {
      const errors = getStepErrors("background", makeCharacter({ background: "Soldier" }));
      expect(errors).toEqual([]);
    });

    it("fails with no background selected", () => {
      const errors = getStepErrors("background", makeCharacter({ background: undefined }));
      expect(errors).toContain("Choose a background.");
    });
  });

  // -------------------------------------------------------------------------
  // Abilities Step
  // -------------------------------------------------------------------------
  describe("abilities step", () => {
    it("passes with valid ability scores", () => {
      const errors = getStepErrors("abilities", makeCharacter());
      expect(errors).toEqual([]);
    });

    it("fails with no ability scores set", () => {
      const errors = getStepErrors("abilities", makeCharacter({ abilityScores: undefined }));
      expect(errors).toContain("Set your ability scores.");
    });

    it("fails with ability score below 3", () => {
      const errors = getStepErrors(
        "abilities",
        makeCharacter({
          abilityScores: {
            strength: 2,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
          },
        })
      );
      expect(errors).toContain("All ability scores must be between 3 and 20.");
    });

    it("fails with ability score above 20", () => {
      const errors = getStepErrors(
        "abilities",
        makeCharacter({
          abilityScores: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 25,
          },
        })
      );
      expect(errors).toContain("All ability scores must be between 3 and 20.");
    });
  });

  // -------------------------------------------------------------------------
  // Skills Step
  // -------------------------------------------------------------------------
  describe("skills step", () => {
    it("fails when no class is selected", () => {
      const errors = getStepErrors("skills", makeCharacter({ class: "" }));
      expect(errors).toContain("Choose a class before selecting skills.");
    });

    it("fails when wrong number of class skills selected", () => {
      const classChoices = getClassSkillChoices("Fighter");
      // Select 0 class skills when Fighter requires some
      const errors = getStepErrors(
        "skills",
        makeCharacter({ class: "Fighter", skills: {} })
      );
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/Select exactly \d+ class skill/);
    });

    it("passes when correct number of class skills selected", () => {
      const classChoices = getClassSkillChoices("Fighter");
      const skills: Record<string, "proficient" | "none"> = {};
      // Pick the correct number of skills from the class list
      classChoices.from.slice(0, classChoices.choose).forEach((skill) => {
        skills[skill] = "proficient";
      });
      const errors = getStepErrors(
        "skills",
        makeCharacter({ class: "Fighter", skills })
      );
      expect(errors).toEqual([]);
    });

    it("fails when background skills are set to none", () => {
      const classChoices = getClassSkillChoices("Fighter");
      const skills: Record<string, "proficient" | "none"> = {};
      classChoices.from.slice(0, classChoices.choose).forEach((skill) => {
        skills[skill] = "proficient";
      });
      // Background skill marked as none
      skills["History"] = "none";
      const errors = getStepErrors(
        "skills",
        makeCharacter({
          class: "Fighter",
          skills,
          backgroundSkills: ["History"],
        })
      );
      expect(errors).toContain("Background skills must remain proficient.");
    });
  });

  // -------------------------------------------------------------------------
  // Saves Step
  // -------------------------------------------------------------------------
  describe("saves step", () => {
    it("passes with a class selected", () => {
      const errors = getStepErrors("saves", makeCharacter({ class: "Fighter" }));
      expect(errors).toEqual([]);
    });

    it("fails with no class selected", () => {
      const errors = getStepErrors("saves", makeCharacter({ class: "" }));
      expect(errors).toContain("Choose a class before saving throws.");
    });
  });

  // -------------------------------------------------------------------------
  // Spells Step
  // -------------------------------------------------------------------------
  describe("spells step", () => {
    it("passes for non-spellcasting class", () => {
      const errors = getStepErrors("spells", makeCharacter({ class: "Fighter" }));
      expect(errors).toEqual([]);
    });

    it("fails for spellcasting class with no spells selected", () => {
      // Only run if Wizard is a spellcasting class in the data
      if (!isSpellcastingClass("Wizard")) return;

      const errors = getStepErrors(
        "spells",
        makeCharacter({
          class: "Wizard",
          preparedSpells: [],
        })
      );
      expect(errors.length).toBeGreaterThan(0);
    });

    it("fails for spellcasting class with no ability scores", () => {
      if (!isSpellcastingClass("Wizard")) return;

      const errors = getStepErrors(
        "spells",
        makeCharacter({
          class: "Wizard",
          abilityScores: undefined,
          preparedSpells: [],
        })
      );
      expect(errors).toContain("Set your ability scores before spell selection.");
    });
  });

  // -------------------------------------------------------------------------
  // Equipment Step
  // -------------------------------------------------------------------------
  describe("equipment step", () => {
    it("passes with equipment present", () => {
      const errors = getStepErrors("equipment", makeCharacter());
      expect(errors).toEqual([]);
    });

    it("fails with no equipment", () => {
      const errors = getStepErrors(
        "equipment",
        makeCharacter({ inventory: [] })
      );
      expect(errors).toContain("Choose starting equipment.");
    });

    it("fails when gold-buy cost exceeds budget", () => {
      const errors = getStepErrors(
        "equipment",
        makeCharacter({
          class: "Fighter",
          equipmentSelectionMode: "gold-buy",
          inventory: [
            {
              id: "item-1",
              name: "Expensive Sword",
              quantity: 1,
              weight: 3,
              equipped: false,
              sourceItemId: "some-id",
            },
          ],
        }),
        { equipmentCostGp: 99999 }
      );
      expect(errors).toContain("Gold-buy equipment exceeds starting budget.");
    });

    it("passes when gold-buy cost is within budget", () => {
      const errors = getStepErrors(
        "equipment",
        makeCharacter({
          class: "Fighter",
          equipmentSelectionMode: "gold-buy",
          inventory: [
            {
              id: "item-1",
              name: "Dagger",
              quantity: 1,
              weight: 1,
              equipped: false,
              sourceItemId: "some-id",
            },
          ],
        }),
        { equipmentCostGp: 2 }
      );
      expect(errors).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Review Step
  // -------------------------------------------------------------------------
  describe("review step", () => {
    it("passes when all steps are valid", () => {
      const classChoices = getClassSkillChoices("Fighter");
      const skills: Record<string, "proficient" | "none"> = {};
      classChoices.from.slice(0, classChoices.choose).forEach((skill) => {
        skills[skill] = "proficient";
      });

      const errors = getStepErrors(
        "review",
        makeCharacter({ skills }),
        {
          activeStepKeys: ["basic", "race", "class", "background", "abilities", "skills", "saves", "equipment"],
        }
      );
      expect(errors).toEqual([]);
    });

    it("collects errors from multiple invalid steps", () => {
      const errors = getStepErrors(
        "review",
        makeCharacter({ name: "", race: "", class: "", background: undefined, inventory: [] }),
        {
          activeStepKeys: ["basic", "race", "class", "background", "equipment"],
        }
      );
      expect(errors.length).toBeGreaterThanOrEqual(4);
      expect(errors).toContain("Enter a character name.");
      expect(errors).toContain("Choose a race.");
      expect(errors).toContain("Choose a class.");
      expect(errors).toContain("Choose a background.");
    });
  });

  // -------------------------------------------------------------------------
  // Unknown Step
  // -------------------------------------------------------------------------
  describe("unknown step", () => {
    it("returns unknown step error", () => {
      const errors = getStepErrors("nonexistent", makeCharacter());
      expect(errors).toContain("Unknown wizard step.");
    });
  });

  // -------------------------------------------------------------------------
  // getStepError (backwards-compat wrapper)
  // -------------------------------------------------------------------------
  describe("getStepError", () => {
    it("returns null when no errors", () => {
      expect(getStepError("basic", makeCharacter({ name: "Gandalf" }))).toBeNull();
    });

    it("returns first error when there are errors", () => {
      expect(getStepError("basic", makeCharacter({ name: "" }))).toBe(
        "Enter a character name."
      );
    });
  });

  // -------------------------------------------------------------------------
  // Cross-Step Consistency Validation
  // -------------------------------------------------------------------------
  describe("getCrossStepErrors", () => {
    it("returns no errors for a consistent character", () => {
      const classChoices = getClassSkillChoices("Fighter");
      const skills: Record<string, "proficient" | "none"> = {};
      classChoices.from.slice(0, classChoices.choose).forEach((skill) => {
        skills[skill] = "proficient";
      });

      const errors = getCrossStepErrors(
        makeCharacter({
          skills,
          savingThrows: getClassSavingThrowProficiencies("Fighter"),
        })
      );
      expect(errors).toEqual([]);
    });

    it("detects background skills missing from skills map", () => {
      const errors = getCrossStepErrors(
        makeCharacter({
          backgroundSkills: ["Athletics", "Intimidation"],
          skills: { Athletics: "proficient" },
        })
      );
      expect(errors).toContain(
        'Background skill "Intimidation" is not marked as proficient.'
      );
    });

    it("detects saving throws not matching class", () => {
      const errors = getCrossStepErrors(
        makeCharacter({
          class: "Fighter",
          savingThrows: {},
        })
      );
      // Fighter should have strength and constitution
      expect(errors.some((e) => e.includes("Saving throw proficiency"))).toBe(true);
    });

    it("detects spellcasting class with no spells", () => {
      if (!isSpellcastingClass("Wizard")) return;

      const errors = getCrossStepErrors(
        makeCharacter({
          class: "Wizard",
          preparedSpells: [],
          savingThrows: getClassSavingThrowProficiencies("Wizard"),
        })
      );
      expect(errors).toContain("Spellcasting class has no spells selected.");
    });

    it("does not flag spells for non-spellcasting class", () => {
      const errors = getCrossStepErrors(
        makeCharacter({
          class: "Fighter",
          preparedSpells: [],
          savingThrows: getClassSavingThrowProficiencies("Fighter"),
        })
      );
      expect(errors).not.toContain("Spellcasting class has no spells selected.");
    });

    it("detects empty equipment", () => {
      const errors = getCrossStepErrors(
        makeCharacter({
          inventory: [],
          savingThrows: getClassSavingThrowProficiencies("Fighter"),
        })
      );
      expect(errors).toContain("Character has no equipment.");
    });

    it("detects class ID mismatch", () => {
      const classData = getClassByName("Fighter");
      if (!classData) return;

      const errors = getCrossStepErrors(
        makeCharacter({
          class: "Fighter",
          classId: "wizard-id-wrong",
          savingThrows: getClassSavingThrowProficiencies("Fighter"),
        })
      );
      expect(errors.some((e) => e.includes("Class ID"))).toBe(true);
    });

    it("passes when class ID matches", () => {
      const classData = getClassByName("Fighter");
      if (!classData) return;

      const errors = getCrossStepErrors(
        makeCharacter({
          class: "Fighter",
          classId: classData.id,
          savingThrows: getClassSavingThrowProficiencies("Fighter"),
        })
      );
      expect(errors.filter((e) => e.includes("Class ID"))).toEqual([]);
    });

    it("handles empty character gracefully", () => {
      const errors = getCrossStepErrors({});
      expect(errors).toContain("Character has no equipment.");
      // Should not throw
    });

    it("handles character with no skills or saves gracefully", () => {
      const errors = getCrossStepErrors({
        class: "Fighter",
        inventory: [{ id: "1", name: "Sword", quantity: 1, weight: 3, equipped: false }],
      });
      // Should detect missing saving throws
      expect(errors.some((e) => e.includes("Saving throw proficiency"))).toBe(true);
    });
  });
});
