import { describe, expect, it } from "vitest";
import {
  createEmptySpellSlots,
  formatModifier,
  getDefaultSpellSlots,
  getHighestSlotLevel,
  getLevelOneHitPoints,
  getProficiencyBonus,
  getSpellSelectionState,
  getSpellcastingRuleMode,
  validateSpellSelection,
} from "./dndRules";

describe("dndRules helpers", () => {
  it("calculates proficiency bonus correctly", () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(17)).toBe(6);
  });

  it("formats modifiers", () => {
    expect(formatModifier(3)).toBe("+3");
    expect(formatModifier(-1)).toBe("-1");
  });

  it("calculates level 1 hit points from class hit die and Constitution", () => {
    expect(getLevelOneHitPoints("Wizard", 14)).toBe(8);
    expect(getLevelOneHitPoints("Barbarian", 16)).toBe(15);
  });

  it("returns empty spell slots for non-spellcasters", () => {
    const fighterSlots = getDefaultSpellSlots("Fighter", 5);
    expect(getHighestSlotLevel(fighterSlots)).toBe(0);
  });

  it("returns class spell slots for full and pact casters", () => {
    const wizardLevel1 = getDefaultSpellSlots("Wizard", 1);
    expect(wizardLevel1.level1.max).toBe(2);
    expect(getHighestSlotLevel(wizardLevel1)).toBe(1);

    const warlockLevel1 = getDefaultSpellSlots("Warlock", 1);
    expect(warlockLevel1.level1.max).toBe(1);
    expect(getHighestSlotLevel(warlockLevel1)).toBe(1);
  });

  it("creates fully empty slot objects", () => {
    const empty = createEmptySpellSlots();
    expect(empty.level1.max).toBe(0);
    expect(empty.level9.current).toBe(0);
  });

  it("identifies known and prepared spellcasting classes", () => {
    expect(getSpellcastingRuleMode("Sorcerer")).toBe("known");
    expect(getSpellcastingRuleMode("Wizard")).toBe("prepared");
    expect(getSpellcastingRuleMode("Fighter")).toBe("none");
  });

  it("tracks leveled spell limits for known and prepared casters", () => {
    const sorcererState = getSpellSelectionState(
      "Sorcerer",
      1,
      16,
      [{ level: 1 }, { level: 1 }, { level: 0 }]
    );
    expect(sorcererState.maxLeveledSpells).toBe(2);
    expect(sorcererState.currentLeveledSpells).toBe(2);
    expect(sorcererState.isAtLimit).toBe(true);

    const wizardState = getSpellSelectionState(
      "Wizard",
      3,
      16,
      [{ level: 1 }, { level: 2 }, { level: 0 }]
    );
    expect(wizardState.maxLeveledSpells).toBe(6);
    expect(wizardState.remainingLeveledSpells).toBe(4);
  });

  it("validates additions when class spell limits are reached", () => {
    const blocked = validateSpellSelection(
      "Warlock",
      1,
      16,
      [{ level: 1 }, { level: 1 }],
      1
    );
    expect(blocked.canAdd).toBe(false);
    expect(blocked.reason).toContain("limit reached");

    const cantripAllowed = validateSpellSelection(
      "Warlock",
      1,
      16,
      [{ level: 1 }, { level: 1 }],
      0
    );
    expect(cantripAllowed.canAdd).toBe(true);
  });
});
