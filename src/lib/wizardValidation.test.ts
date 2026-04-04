import { describe, expect, it } from "vitest";
import { DnD5eCharacter } from "@/types/character";
import {
  getStepValidationError,
  validateAllSteps,
} from "./wizardValidation";

function makeCharacter(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return {
    name: "Test Hero",
    race: "Human",
    class: "Fighter",
    background: "Soldier",
    level: 1,
    abilityScores: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    },
    skills: {
      Athletics: "proficient",
      Intimidation: "proficient",
      Perception: "proficient",
      Insight: "proficient",
    },
    backgroundSkills: ["Athletics", "Intimidation"],
    savingThrows: { strength: true, constitution: true },
    inventory: [
      { id: "1", name: "Longsword", quantity: 1, weight: 3, equipped: false },
    ],
    equipmentSelectionMode: "packages",
    startingEquipmentChoiceId: "fighter-martial-shield",
    ...overrides,
  };
}

describe("getStepValidationError", () => {
  describe("basic step", () => {
    it("returns null when name is provided", () => {
      expect(getStepValidationError("basic", makeCharacter())).toBeNull();
    });

    it("returns error when name is empty", () => {
      expect(
        getStepValidationError("basic", makeCharacter({ name: "" }))
      ).toBe("Enter a character name.");
    });

    it("returns error when name is whitespace only", () => {
      expect(
        getStepValidationError("basic", makeCharacter({ name: "   " }))
      ).toBe("Enter a character name.");
    });
  });

  describe("race step", () => {
    it("returns null when race is selected", () => {
      expect(getStepValidationError("race", makeCharacter())).toBeNull();
    });

    it("returns error when no race selected", () => {
      expect(
        getStepValidationError("race", makeCharacter({ race: "" }))
      ).toBe("Choose a race.");
    });
  });

  describe("class step", () => {
    it("returns null when class is selected", () => {
      expect(getStepValidationError("class", makeCharacter())).toBeNull();
    });

    it("returns error when no class selected", () => {
      expect(
        getStepValidationError("class", makeCharacter({ class: "" }))
      ).toBe("Choose a class.");
    });
  });

  describe("background step", () => {
    it("returns null when background is selected", () => {
      expect(getStepValidationError("background", makeCharacter())).toBeNull();
    });

    it("returns error when no background selected", () => {
      expect(
        getStepValidationError("background", makeCharacter({ background: undefined }))
      ).toBe("Choose a background.");
    });
  });

  describe("abilities step", () => {
    it("returns null when scores are valid", () => {
      expect(getStepValidationError("abilities", makeCharacter())).toBeNull();
    });

    it("returns error when a score is below 3", () => {
      expect(
        getStepValidationError(
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
        )
      ).toBe("All ability scores must be between 3 and 20.");
    });

    it("returns error when a score exceeds 20", () => {
      expect(
        getStepValidationError(
          "abilities",
          makeCharacter({
            abilityScores: {
              strength: 22,
              dexterity: 10,
              constitution: 10,
              intelligence: 10,
              wisdom: 10,
              charisma: 10,
            },
          })
        )
      ).toBe("All ability scores must be between 3 and 20.");
    });

    it("returns error when abilityScores is undefined", () => {
      expect(
        getStepValidationError(
          "abilities",
          makeCharacter({ abilityScores: undefined })
        )
      ).toBe("Set your ability scores.");
    });
  });

  describe("skills step", () => {
    it("returns null when correct number of skills selected", () => {
      expect(getStepValidationError("skills", makeCharacter())).toBeNull();
    });

    it("returns error when no class is set", () => {
      expect(
        getStepValidationError("skills", makeCharacter({ class: "" }))
      ).toBe("Choose a class before selecting skills.");
    });

    it("returns error when background skills are removed", () => {
      expect(
        getStepValidationError(
          "skills",
          makeCharacter({
            skills: {
              Athletics: "none",
              Intimidation: "proficient",
              Perception: "proficient",
              Acrobatics: "proficient",
            },
          })
        )
      ).toBe("Background skills must remain proficient.");
    });
  });

  describe("saves step", () => {
    it("returns null when class is selected", () => {
      expect(getStepValidationError("saves", makeCharacter())).toBeNull();
    });

    it("returns error when no class", () => {
      expect(
        getStepValidationError("saves", makeCharacter({ class: "" }))
      ).toBe("Choose a class before saving throws.");
    });
  });

  describe("spells step", () => {
    it("returns null for non-caster classes", () => {
      expect(
        getStepValidationError("spells", makeCharacter({ class: "Fighter" }))
      ).toBeNull();
    });

    it("returns error for caster without cantrips", () => {
      const error = getStepValidationError(
        "spells",
        makeCharacter({
          class: "Wizard",
          preparedSpells: [],
        })
      );
      expect(error).toBeTruthy();
    });
  });

  describe("equipment step", () => {
    it("returns null when equipment is valid in package mode", () => {
      expect(getStepValidationError("equipment", makeCharacter())).toBeNull();
    });

    it("returns error when inventory is empty", () => {
      expect(
        getStepValidationError(
          "equipment",
          makeCharacter({ inventory: [] })
        )
      ).toBeTruthy();
    });

    it("returns error when package mode but no package selected", () => {
      const error = getStepValidationError(
        "equipment",
        makeCharacter({
          equipmentSelectionMode: "packages",
          startingEquipmentChoiceId: undefined,
          inventory: [
            { id: "1", name: "Sword", quantity: 1, weight: 3, equipped: false },
          ],
        })
      );
      expect(error).toBeTruthy();
    });
  });
});

describe("validateAllSteps", () => {
  it("returns all-valid results for a complete character", () => {
    const results = validateAllSteps(makeCharacter(), [
      "basic", "race", "class", "background", "abilities",
      "skills", "saves", "equipment",
    ]);
    expect(results.every((r) => r.valid)).toBe(true);
    expect(results.every((r) => r.error === null)).toBe(true);
  });

  it("flags invalid steps in results", () => {
    const results = validateAllSteps(
      makeCharacter({ name: "", background: undefined }),
      ["basic", "race", "class", "background", "abilities"]
    );
    const basicResult = results.find((r) => r.key === "basic");
    const bgResult = results.find((r) => r.key === "background");
    expect(basicResult?.valid).toBe(false);
    expect(basicResult?.error).toBe("Enter a character name.");
    expect(bgResult?.valid).toBe(false);
  });

  it("excludes review from results", () => {
    const results = validateAllSteps(makeCharacter(), [
      "basic", "race", "review",
    ]);
    expect(results.find((r) => r.key === "review")).toBeUndefined();
  });

  it("includes step labels", () => {
    const results = validateAllSteps(makeCharacter(), ["basic", "race"]);
    expect(results[0].label).toBe("Basic Info");
    expect(results[1].label).toBe("Race");
  });
});
