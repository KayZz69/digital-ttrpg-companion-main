import { describe, expect, it } from "vitest";
import {
  getAllBackgroundDefinitions,
  getClassExpertiseSelectionCount,
  getClassStartingEquipmentChoices,
} from "@/lib/dndCompendium";
import { getRegistrySpellSelectionState } from "@/lib/rules/spells";

describe("character creation rules wiring", () => {
  it("exposes background choices", () => {
    const backgrounds = getAllBackgroundDefinitions();
    expect(backgrounds.length).toBeGreaterThan(5);
    expect(backgrounds.some((entry) => entry.name === "Soldier")).toBe(true);
  });

  it("limits expertise by class feature availability", () => {
    expect(getClassExpertiseSelectionCount("Rogue", 1)).toBe(2);
    expect(getClassExpertiseSelectionCount("Wizard", 1)).toBe(0);
  });

  it("provides class starting equipment packages", () => {
    const fighterChoices = getClassStartingEquipmentChoices("Fighter");
    expect(fighterChoices.length).toBeGreaterThan(0);
    expect(fighterChoices[0].items.length).toBeGreaterThan(0);
  });

  it("tracks cantrip and leveled limits together", () => {
    // Wizard level 1, INT 16 → modifier +3 → maxLeveledSpells = 1 + 3 = 4
    const wizardState = getRegistrySpellSelectionState(
      "Wizard",
      1,
      3,
      [{ level: 0 }, { level: 0 }, { level: 0 }, { level: 1 }, { level: 1 }]
    );
    expect(wizardState.maxCantrips).toBe(3);
    expect(wizardState.maxLeveledSpells).toBe(4);
    expect(wizardState.isOverLimit).toBe(false);
  });
});

