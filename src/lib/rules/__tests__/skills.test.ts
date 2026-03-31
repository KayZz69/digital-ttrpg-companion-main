/**
 * @fileoverview Tests for 2024 D&D 5e skill rules (skills.ts).
 *
 * Coverage targets:
 * - getRegistryClassSkillRules(): all 12 classes, case-insensitive lookup, null for unknown
 * - getRegistrySkillDefinitions(): all 18 skills present
 * - validateSkillSelection(): valid and invalid selections, expertise validation
 * - getSkillsRegistry(): registry shape and delegation
 */

import { describe, expect, it } from "vitest";
import {
  getRegistryClassSkillRules,
  getRegistrySkillDefinitions,
  getSkillsRegistry,
  validateSkillSelection,
} from "../skills";

// ---------------------------------------------------------------------------
// getRegistryClassSkillRules
// ---------------------------------------------------------------------------

describe("getRegistryClassSkillRules", () => {
  const ALL_CLASSES = [
    "barbarian",
    "bard",
    "cleric",
    "druid",
    "fighter",
    "monk",
    "paladin",
    "ranger",
    "rogue",
    "sorcerer",
    "warlock",
    "wizard",
  ];

  it("returns skill rules for all 12 classes", () => {
    for (const classId of ALL_CLASSES) {
      const rules = getRegistryClassSkillRules(classId);
      expect(rules, `${classId} should have skill rules`).not.toBeNull();
      expect(rules!.classId).toBe(classId);
      expect(rules!.skillChoiceCount).toBeGreaterThan(0);
      expect(rules!.availableSkills.length).toBeGreaterThan(0);
    }
  });

  it("supports case-insensitive lookup", () => {
    const lower = getRegistryClassSkillRules("rogue");
    const upper = getRegistryClassSkillRules("Rogue");
    const mixed = getRegistryClassSkillRules("ROGUE");

    expect(lower).not.toBeNull();
    expect(upper).not.toBeNull();
    expect(mixed).not.toBeNull();
    expect(lower!.skillChoiceCount).toBe(upper!.skillChoiceCount);
    expect(lower!.skillChoiceCount).toBe(mixed!.skillChoiceCount);
  });

  it("returns null for unknown class", () => {
    expect(getRegistryClassSkillRules("artificer")).toBeNull();
    expect(getRegistryClassSkillRules("")).toBeNull();
    expect(getRegistryClassSkillRules("  ")).toBeNull();
  });

  it("returns correct skill choice count for each class", () => {
    expect(getRegistryClassSkillRules("barbarian")!.skillChoiceCount).toBe(2);
    expect(getRegistryClassSkillRules("bard")!.skillChoiceCount).toBe(3);
    expect(getRegistryClassSkillRules("cleric")!.skillChoiceCount).toBe(2);
    expect(getRegistryClassSkillRules("druid")!.skillChoiceCount).toBe(2);
    expect(getRegistryClassSkillRules("fighter")!.skillChoiceCount).toBe(2);
    expect(getRegistryClassSkillRules("monk")!.skillChoiceCount).toBe(2);
    expect(getRegistryClassSkillRules("paladin")!.skillChoiceCount).toBe(2);
    expect(getRegistryClassSkillRules("ranger")!.skillChoiceCount).toBe(3);
    expect(getRegistryClassSkillRules("rogue")!.skillChoiceCount).toBe(4);
    expect(getRegistryClassSkillRules("sorcerer")!.skillChoiceCount).toBe(2);
    expect(getRegistryClassSkillRules("warlock")!.skillChoiceCount).toBe(2);
    expect(getRegistryClassSkillRules("wizard")!.skillChoiceCount).toBe(2);
  });

  it("bard has all 18 skills available", () => {
    const rules = getRegistryClassSkillRules("bard");
    expect(rules!.availableSkills.length).toBe(18);
  });

  it("returns expertise slots for bard at level 3", () => {
    const rules = getRegistryClassSkillRules("bard", 3);
    expect(rules!.expertiseSlots).toBe(2);
  });

  it("returns expertise slots for bard at level 10", () => {
    const rules = getRegistryClassSkillRules("bard", 10);
    expect(rules!.expertiseSlots).toBe(4);
  });

  it("returns expertise slots for rogue at level 1", () => {
    const rules = getRegistryClassSkillRules("rogue", 1);
    expect(rules!.expertiseSlots).toBe(2);
  });

  it("returns expertise slots for rogue at level 6", () => {
    const rules = getRegistryClassSkillRules("rogue", 6);
    expect(rules!.expertiseSlots).toBe(4);
  });

  it("returns 0 expertise slots for fighter", () => {
    const rules = getRegistryClassSkillRules("fighter");
    expect(rules!.expertiseSlots).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getRegistrySkillDefinitions
// ---------------------------------------------------------------------------

describe("getRegistrySkillDefinitions", () => {
  it("returns all 18 skills", () => {
    const skills = getRegistrySkillDefinitions();
    expect(skills).toHaveLength(18);
  });

  it("includes all expected skill names", () => {
    const skills = getRegistrySkillDefinitions();
    const names = skills.map((s) => s.name);
    const expected = [
      "Acrobatics",
      "Animal Handling",
      "Arcana",
      "Athletics",
      "Deception",
      "History",
      "Insight",
      "Intimidation",
      "Investigation",
      "Medicine",
      "Nature",
      "Perception",
      "Performance",
      "Persuasion",
      "Religion",
      "Sleight of Hand",
      "Stealth",
      "Survival",
    ];
    for (const name of expected) {
      expect(names).toContain(name);
    }
  });

  it("each skill has an ability and description", () => {
    const skills = getRegistrySkillDefinitions();
    for (const skill of skills) {
      expect(skill.ability).toBeTruthy();
      expect(skill.description).toBeTruthy();
      expect(skill.description.length).toBeGreaterThan(10);
    }
  });

  it("returns a new array each call (no mutation risk)", () => {
    const a = getRegistrySkillDefinitions();
    const b = getRegistrySkillDefinitions();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// validateSkillSelection
// ---------------------------------------------------------------------------

describe("validateSkillSelection", () => {
  it("valid selection: correct number of class picks", () => {
    const result = validateSkillSelection(
      "fighter",
      {
        "Acrobatics": "proficient",
        "Athletics": "proficient",
      },
      [],
    );
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("invalid: too many class picks", () => {
    const result = validateSkillSelection(
      "fighter",
      {
        "Acrobatics": "proficient",
        "Athletics": "proficient",
        "Perception": "proficient",
      },
      [],
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Too many"))).toBe(true);
  });

  it("invalid: too few class picks", () => {
    const result = validateSkillSelection(
      "fighter",
      {
        "Athletics": "proficient",
      },
      [],
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Not enough"))).toBe(true);
  });

  it("background skills do not count against class picks", () => {
    const result = validateSkillSelection(
      "fighter",
      {
        "Acrobatics": "proficient",
        "Athletics": "proficient",
        "History": "proficient",
      },
      ["History"],
    );
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("invalid: skill not available for class", () => {
    const result = validateSkillSelection(
      "cleric",
      {
        "Stealth": "proficient",
        "History": "proficient",
      },
      [],
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("not available"))).toBe(true);
  });

  it("invalid: too many expertise selections", () => {
    const result = validateSkillSelection(
      "rogue",
      {
        "Acrobatics": "expert",
        "Athletics": "expert",
        "Stealth": "expert",
        "Deception": "proficient",
      },
      [],
      1,
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("expertise"))).toBe(true);
  });

  it("valid: expertise within limits for rogue level 1", () => {
    const result = validateSkillSelection(
      "rogue",
      {
        "Acrobatics": "expert",
        "Athletics": "expert",
        "Stealth": "proficient",
        "Deception": "proficient",
      },
      [],
      1,
    );
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid for unknown class with no selections", () => {
    const result = validateSkillSelection("artificer", {}, []);
    expect(result.isValid).toBe(true);
  });

  it("returns invalid for unknown class with selections", () => {
    const result = validateSkillSelection(
      "artificer",
      { "Arcana": "proficient" },
      [],
    );
    expect(result.isValid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getSkillsRegistry
// ---------------------------------------------------------------------------

describe("getSkillsRegistry", () => {
  it("returns an object with getClassSkillRules and getSkillDefinitions", () => {
    const registry = getSkillsRegistry();
    expect(typeof registry.getClassSkillRules).toBe("function");
    expect(typeof registry.getSkillDefinitions).toBe("function");
  });

  it("delegates getClassSkillRules correctly", () => {
    const registry = getSkillsRegistry();
    const rules = registry.getClassSkillRules("rogue");
    expect(rules).not.toBeNull();
    expect(rules!.classId).toBe("rogue");
    expect(rules!.skillChoiceCount).toBe(4);
  });

  it("delegates getSkillDefinitions correctly", () => {
    const registry = getSkillsRegistry();
    const skills = registry.getSkillDefinitions();
    expect(skills).toHaveLength(18);
  });
});
