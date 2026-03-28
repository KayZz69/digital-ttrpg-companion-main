/**
 * @fileoverview Tests for 2024 D&D 5e spell rules (spells.ts).
 *
 * Coverage targets:
 * - getSpellSlots(): all caster types, all levels 1–20
 * - getCantrips(): cantrip progression, damage dice at levels 5/11/17
 * - getSpellcastingType(): classification of all classes
 * - getMaxPreparedSpells(): known vs prepared, full vs half caster
 * - getRules(): registry shape and delegation
 */

import { describe, expect, it } from "vitest";
import {
  buildSpellSlots,
  getCantrips,
  getHighestSlotLevel,
  getMaxPreparedSpells,
  getRegistrySpellSelectionState,
  getRules,
  getSpellSlots,
  getSpellcastingType,
  validateRegistrySpellSelection,
} from "../spells";

// ---------------------------------------------------------------------------
// getSpellcastingType
// ---------------------------------------------------------------------------

describe("getSpellcastingType", () => {
  it("returns 'pact' for warlock", () => {
    expect(getSpellcastingType("warlock")).toBe("pact");
    expect(getSpellcastingType("Warlock")).toBe("pact"); // case-insensitive
  });

  it("returns 'known' for known-list casters", () => {
    expect(getSpellcastingType("bard")).toBe("known");
    expect(getSpellcastingType("sorcerer")).toBe("known");
  });

  it("returns 'prepared' for prepared casters (full)", () => {
    expect(getSpellcastingType("cleric")).toBe("prepared");
    expect(getSpellcastingType("druid")).toBe("prepared");
    expect(getSpellcastingType("wizard")).toBe("prepared");
  });

  it("returns 'prepared' for prepared casters (half)", () => {
    expect(getSpellcastingType("paladin")).toBe("prepared");
    expect(getSpellcastingType("ranger")).toBe("prepared");
  });

  it("returns 'none' for non-spellcasting classes", () => {
    expect(getSpellcastingType("fighter")).toBe("none");
    expect(getSpellcastingType("barbarian")).toBe("none");
    expect(getSpellcastingType("monk")).toBe("none");
    expect(getSpellcastingType("rogue")).toBe("none");
    expect(getSpellcastingType("")).toBe("none");
  });
});

// ---------------------------------------------------------------------------
// getSpellSlots — full casters
// ---------------------------------------------------------------------------

describe("getSpellSlots — full casters", () => {
  it("wizard level 1: 2 first-level slots", () => {
    const slots = getSpellSlots("wizard", 1);
    expect(slots).toHaveLength(1);
    expect(slots[0]).toEqual({ level: 1, max: 2 });
  });

  it("wizard level 3: levels 1+2 slots", () => {
    const slots = getSpellSlots("wizard", 3);
    const map = Object.fromEntries(slots.map((s) => [s.level, s.max]));
    expect(map[1]).toBe(4);
    expect(map[2]).toBe(2);
    expect(map[3]).toBeUndefined(); // no level 3 yet
  });

  it("wizard level 20: 9 slot levels, correct counts", () => {
    const slots = getSpellSlots("wizard", 20);
    expect(slots).toHaveLength(9);
    const map = Object.fromEntries(slots.map((s) => [s.level, s.max]));
    expect(map[1]).toBe(4);
    expect(map[2]).toBe(3);
    expect(map[3]).toBe(3);
    expect(map[4]).toBe(3);
    expect(map[5]).toBe(3);
    expect(map[6]).toBe(2);
    expect(map[7]).toBe(2);
    expect(map[8]).toBe(1);
    expect(map[9]).toBe(1);
  });

  it("returns empty array for non-caster", () => {
    expect(getSpellSlots("fighter", 10)).toHaveLength(0);
    expect(getSpellSlots("barbarian", 1)).toHaveLength(0);
  });

  // Spot-check all full-caster classes behave identically at level 5
  it.each(["bard", "cleric", "druid", "sorcerer", "wizard"])(
    "%s at level 5 has correct full-caster slots",
    (cls) => {
      const slots = getSpellSlots(cls, 5);
      const map = Object.fromEntries(slots.map((s) => [s.level, s.max]));
      expect(map[1]).toBe(4);
      expect(map[2]).toBe(3);
      expect(map[3]).toBe(2);
      expect(map[4]).toBeUndefined();
    }
  );
});

// ---------------------------------------------------------------------------
// getSpellSlots — half casters (paladin / ranger)
// ---------------------------------------------------------------------------

describe("getSpellSlots — half casters", () => {
  it("paladin level 1: no spell slots", () => {
    expect(getSpellSlots("paladin", 1)).toHaveLength(0);
  });

  it("paladin level 2: 2 first-level slots", () => {
    const slots = getSpellSlots("paladin", 2);
    expect(slots).toHaveLength(1);
    expect(slots[0]).toEqual({ level: 1, max: 2 });
  });

  it("paladin level 5: levels 1+2", () => {
    const slots = getSpellSlots("paladin", 5);
    const map = Object.fromEntries(slots.map((s) => [s.level, s.max]));
    expect(map[1]).toBe(4);
    expect(map[2]).toBe(2);
    expect(map[3]).toBeUndefined();
  });

  it("ranger level 20: max level 5 slots (level 5 slots = 2)", () => {
    const slots = getSpellSlots("ranger", 20);
    const map = Object.fromEntries(slots.map((s) => [s.level, s.max]));
    expect(map[5]).toBe(2);
    // No level 6+
    expect(slots.find((s) => s.level >= 6)).toBeUndefined();
  });

  it("all half-caster levels 1–20 produce at most 5 slot levels", () => {
    for (let level = 1; level <= 20; level++) {
      const slots = getSpellSlots("paladin", level);
      expect(slots.every((s) => s.level <= 5)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// getSpellSlots — warlock pact magic
// ---------------------------------------------------------------------------

describe("getSpellSlots — warlock pact magic", () => {
  it("warlock level 1: 1 slot at spell level 1", () => {
    const slots = getSpellSlots("warlock", 1);
    expect(slots).toHaveLength(1);
    expect(slots[0]).toEqual({ level: 1, max: 1 });
  });

  it("warlock level 2: 2 slots at spell level 1", () => {
    expect(getSpellSlots("warlock", 2)[0]).toEqual({ level: 1, max: 2 });
  });

  it("warlock level 5: 2 slots at spell level 3", () => {
    const slots = getSpellSlots("warlock", 5);
    expect(slots).toHaveLength(1);
    expect(slots[0]).toEqual({ level: 3, max: 2 });
  });

  it("warlock level 9–10: spell level 5, 2 slots", () => {
    expect(getSpellSlots("warlock", 9)[0]).toEqual({ level: 5, max: 2 });
    expect(getSpellSlots("warlock", 10)[0]).toEqual({ level: 5, max: 2 });
  });

  it("warlock level 11: 3 slots at spell level 5", () => {
    expect(getSpellSlots("warlock", 11)[0]).toEqual({ level: 5, max: 3 });
  });

  it("warlock level 17–20: 4 slots at spell level 5", () => {
    for (let level = 17; level <= 20; level++) {
      expect(getSpellSlots("warlock", level)[0]).toEqual({ level: 5, max: 4 });
    }
  });

  it("warlock always returns exactly 1 slot entry", () => {
    for (let level = 1; level <= 20; level++) {
      expect(getSpellSlots("warlock", level)).toHaveLength(1);
    }
  });
});

// ---------------------------------------------------------------------------
// getSpellSlots — level clamping
// ---------------------------------------------------------------------------

describe("getSpellSlots — level clamping", () => {
  it("clamps level below 1 to level 1", () => {
    expect(getSpellSlots("wizard", 0)).toEqual(getSpellSlots("wizard", 1));
    expect(getSpellSlots("wizard", -5)).toEqual(getSpellSlots("wizard", 1));
  });

  it("clamps level above 20 to level 20", () => {
    expect(getSpellSlots("wizard", 21)).toEqual(getSpellSlots("wizard", 20));
    expect(getSpellSlots("wizard", 99)).toEqual(getSpellSlots("wizard", 20));
  });
});

// ---------------------------------------------------------------------------
// getCantrips
// ---------------------------------------------------------------------------

describe("getCantrips", () => {
  it("returns null for non-cantrip classes", () => {
    // Fighter has no cantrips
    expect(getCantrips("fighter", 5)).toBeNull();
    expect(getCantrips("barbarian", 1)).toBeNull();
  });

  it("wizard level 1: 3 cantrips, 1 damage die", () => {
    const c = getCantrips("wizard", 1);
    expect(c).not.toBeNull();
    expect(c!.maxKnown).toBe(3);
    expect(c!.damageDice).toBe(1);
  });

  it("wizard levels 1–3: 3 cantrips; levels 4–9: 4 cantrips", () => {
    // 2024 PHB — Wizard table: 3 cantrips at levels 1-3, 4 at levels 4-9
    for (let level = 1; level <= 3; level++) {
      expect(getCantrips("wizard", level)?.maxKnown).toBe(3);
    }
    for (let level = 4; level <= 9; level++) {
      expect(getCantrips("wizard", level)?.maxKnown).toBe(4);
    }
  });

  it("cantrip damage dice scale at levels 5, 11, 17", () => {
    expect(getCantrips("wizard", 1)?.damageDice).toBe(1); // 2024 PHB: level 1–4
    expect(getCantrips("wizard", 4)?.damageDice).toBe(1);
    expect(getCantrips("wizard", 5)?.damageDice).toBe(2); // 2024 PHB: level 5 upgrade
    expect(getCantrips("wizard", 10)?.damageDice).toBe(2);
    expect(getCantrips("wizard", 11)?.damageDice).toBe(3); // 2024 PHB: level 11 upgrade
    expect(getCantrips("wizard", 16)?.damageDice).toBe(3);
    expect(getCantrips("wizard", 17)?.damageDice).toBe(4); // 2024 PHB: level 17 upgrade
    expect(getCantrips("wizard", 20)?.damageDice).toBe(4);
  });

  it("sorcerer has more cantrips than wizard at level 1", () => {
    expect(getCantrips("sorcerer", 1)?.maxKnown).toBe(4); // sorcerer starts with 4
    expect(getCantrips("wizard", 1)?.maxKnown).toBe(3);
  });

  it("paladin and ranger have no cantrips — return null (contract enforced)", () => {
    // P2 fix: no cantrip access → null, not {maxKnown: 0}
    expect(getCantrips("paladin", 5)).toBeNull();
    expect(getCantrips("ranger", 10)).toBeNull();
  });

  it("cantrips for all caster classes at all levels are non-negative", () => {
    const classes = ["bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard"];
    for (const cls of classes) {
      for (let level = 1; level <= 20; level++) {
        const c = getCantrips(cls, level);
        expect(c?.maxKnown ?? 0).toBeGreaterThanOrEqual(0);
        expect(c?.damageDice ?? 1).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// getMaxPreparedSpells
// ---------------------------------------------------------------------------

describe("getMaxPreparedSpells", () => {
  it("non-caster returns 0", () => {
    expect(getMaxPreparedSpells("fighter", 10, 3)).toBe(0);
    expect(getMaxPreparedSpells("barbarian", 20, 5)).toBe(0);
  });

  // Known casters
  it("sorcerer level 1: 3 spells known", () => {
    expect(getMaxPreparedSpells("sorcerer", 1, 3)).toBe(3);
  });

  it("bard level 5: 8 spells known", () => {
    expect(getMaxPreparedSpells("bard", 5, 3)).toBe(8);
  });

  it("warlock level 1: 2 spells known", () => {
    expect(getMaxPreparedSpells("warlock", 1, 4)).toBe(2);
  });

  it("warlock level 20: 15 spells known", () => {
    expect(getMaxPreparedSpells("warlock", 20, 5)).toBe(15);
  });

  // Known casters ignore spellcasting modifier
  it("sorcerer: modifier does not affect known count", () => {
    expect(getMaxPreparedSpells("sorcerer", 5, 0)).toBe(7);
    expect(getMaxPreparedSpells("sorcerer", 5, 5)).toBe(7);
  });

  // Prepared full casters
  it("wizard level 5, mod +3: 8 prepared spells", () => {
    expect(getMaxPreparedSpells("wizard", 5, 3)).toBe(8); // 5 + 3
  });

  it("cleric level 1, mod +1: 2 prepared spells", () => {
    expect(getMaxPreparedSpells("cleric", 1, 1)).toBe(2); // 1 + 1
  });

  it("prepared minimum is 1 even with negative modifier", () => {
    expect(getMaxPreparedSpells("cleric", 1, -2)).toBe(1); // max(1, 1 + -2)
  });

  // Half casters
  it("paladin level 5, mod +3: 5 prepared", () => {
    // floor(5/2) + 3 = 2 + 3 = 5
    expect(getMaxPreparedSpells("paladin", 5, 3)).toBe(5);
  });

  it("ranger level 2, mod +2: 3 prepared", () => {
    // floor(2/2) + 2 = 1 + 2 = 3
    expect(getMaxPreparedSpells("ranger", 2, 2)).toBe(3);
  });

  it("half-caster minimum is 1 even with negative modifier", () => {
    expect(getMaxPreparedSpells("paladin", 2, -3)).toBe(1); // max(1, 1 + -3)
  });
});

// ---------------------------------------------------------------------------
// getRules — registry shape + delegation
// ---------------------------------------------------------------------------

describe("getRules", () => {
  it("returns a registry with correct rulesVersion", () => {
    const rules = getRules();
    expect(rules.rulesVersion).toBe("2024-dnd5e");
  });

  it("delegates getSpellSlots correctly", () => {
    const rules = getRules();
    expect(rules.getSpellSlots("wizard", 1)).toEqual(getSpellSlots("wizard", 1));
    expect(rules.getSpellSlots("warlock", 5)).toEqual(getSpellSlots("warlock", 5));
  });

  it("delegates getCantrips correctly", () => {
    const rules = getRules();
    expect(rules.getCantrips("wizard", 1)).toEqual(getCantrips("wizard", 1));
    expect(rules.getCantrips("fighter", 1)).toBeNull();
  });

  it("delegates getSpellcastingType correctly", () => {
    const rules = getRules();
    expect(rules.getSpellcastingType("wizard")).toBe("prepared");
    expect(rules.getSpellcastingType("bard")).toBe("known");
    expect(rules.getSpellcastingType("warlock")).toBe("pact");
    expect(rules.getSpellcastingType("fighter")).toBe("none");
  });

  it("delegates getMaxPreparedSpells correctly", () => {
    const rules = getRules();
    expect(rules.getMaxPreparedSpells("wizard", 5, 3)).toBe(8);
  });

  it("delegates getEquipmentRules to equipment registry", () => {
    const rules = getRules();
    // Known classes should return equipment data
    const wizardEquip = rules.getEquipmentRules("wizard");
    expect(wizardEquip).not.toBeNull();
    expect(wizardEquip?.classId).toBe("wizard");
    const fighterEquip = rules.getEquipmentRules("fighter");
    expect(fighterEquip).not.toBeNull();
    expect(fighterEquip?.classId).toBe("fighter");
    // Unknown classes should still return null
    expect(rules.getEquipmentRules("unknown-class")).toBeNull();
  });

  it("returns a new object on each call (not cached/singleton)", () => {
    const a = getRules();
    const b = getRules();
    // Both should behave identically but are separate objects
    expect(a.rulesVersion).toBe(b.rulesVersion);
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// Integration: full level 1–20 slot generation for all spellcasters
// ---------------------------------------------------------------------------

describe("Integration: full progression for all casters", () => {
  const fullCasters = ["bard", "cleric", "druid", "sorcerer", "wizard"];
  const halfCasters = ["paladin", "ranger"];
  const nonCasters = ["barbarian", "fighter", "monk", "rogue"];

  it("full casters always have slots from level 1", () => {
    for (const cls of fullCasters) {
      const slots = getSpellSlots(cls, 1);
      expect(slots.length).toBeGreaterThan(0);
    }
  });

  it("half casters have no slots at level 1 but do at level 2+", () => {
    for (const cls of halfCasters) {
      expect(getSpellSlots(cls, 1)).toHaveLength(0);
      expect(getSpellSlots(cls, 2).length).toBeGreaterThan(0);
    }
  });

  it("non-casters have no slots at any level", () => {
    for (const cls of nonCasters) {
      for (let level = 1; level <= 20; level++) {
        expect(getSpellSlots(cls, level)).toHaveLength(0);
      }
    }
  });

  it("slot max values are always non-negative", () => {
    const allCasters = [...fullCasters, ...halfCasters, "warlock"];
    for (const cls of allCasters) {
      for (let level = 1; level <= 20; level++) {
        const slots = getSpellSlots(cls, level);
        for (const s of slots) {
          expect(s.max).toBeGreaterThan(0);
          expect(s.level).toBeGreaterThanOrEqual(1);
          expect(s.level).toBeLessThanOrEqual(9);
        }
      }
    }
  });

  it("slot levels are always in ascending order", () => {
    const allCasters = [...fullCasters, ...halfCasters, "warlock"];
    for (const cls of allCasters) {
      for (let level = 1; level <= 20; level++) {
        const slots = getSpellSlots(cls, level);
        for (let i = 1; i < slots.length; i++) {
          expect(slots[i].level).toBeGreaterThan(slots[i - 1].level);
        }
      }
    }
  });

  it("character loads with valid spell slots from registry (integration)", () => {
    const rules = getRules();
    // Simulate a wizard character at level 5
    const characterLevel = 5;
    const spellcastingMod = 3;

    const slots = rules.getSpellSlots("wizard", characterLevel);
    const cantrips = rules.getCantrips("wizard", characterLevel);
    const maxPrepared = rules.getMaxPreparedSpells("wizard", characterLevel, spellcastingMod);
    const castingType = rules.getSpellcastingType("wizard");

    // Build SpellSlots structure (as CharacterData.spellSlots)
    const spellSlots: Record<string, { current: number; max: number }> = {
      level1: { current: 0, max: 0 },
      level2: { current: 0, max: 0 },
      level3: { current: 0, max: 0 },
      level4: { current: 0, max: 0 },
      level5: { current: 0, max: 0 },
      level6: { current: 0, max: 0 },
      level7: { current: 0, max: 0 },
      level8: { current: 0, max: 0 },
      level9: { current: 0, max: 0 },
    };
    for (const s of slots) {
      spellSlots[`level${s.level}`] = { current: s.max, max: s.max };
    }

    expect(spellSlots.level1.max).toBe(4);
    expect(spellSlots.level2.max).toBe(3);
    expect(spellSlots.level3.max).toBe(2);
    expect(spellSlots.level4.max).toBe(0); // not available yet
    expect(cantrips?.maxKnown).toBe(4);
    expect(cantrips?.damageDice).toBe(2); // level 5 upgrade
    expect(maxPrepared).toBe(8); // 5 + 3
    expect(castingType).toBe("prepared");
  });
});

// ---------------------------------------------------------------------------
// buildSpellSlots — bridge to CharacterData SpellSlots format
// ---------------------------------------------------------------------------

describe("buildSpellSlots", () => {
  it("wizard level 5: populates levels 1–3, rest are zero", () => {
    const slots = buildSpellSlots("wizard", 5);
    expect(slots.level1).toEqual({ current: 4, max: 4 });
    expect(slots.level2).toEqual({ current: 3, max: 3 });
    expect(slots.level3).toEqual({ current: 2, max: 2 });
    expect(slots.level4).toEqual({ current: 0, max: 0 });
    expect(slots.level9).toEqual({ current: 0, max: 0 });
  });

  it("fighter: all zero slots", () => {
    const slots = buildSpellSlots("fighter", 5);
    for (let l = 1; l <= 9; l++) {
      expect(slots[`level${l}` as keyof typeof slots]).toEqual({ current: 0, max: 0 });
    }
  });

  it("warlock level 5: single pact slot at level 3", () => {
    const slots = buildSpellSlots("warlock", 5);
    expect(slots.level3).toEqual({ current: 2, max: 2 });
    expect(slots.level1).toEqual({ current: 0, max: 0 });
  });

  it("paladin level 1: no slots", () => {
    const slots = buildSpellSlots("paladin", 1);
    for (let l = 1; l <= 9; l++) {
      expect(slots[`level${l}` as keyof typeof slots]).toEqual({ current: 0, max: 0 });
    }
  });

  it("paladin level 2: 2 first-level slots", () => {
    const slots = buildSpellSlots("paladin", 2);
    expect(slots.level1).toEqual({ current: 2, max: 2 });
  });
});

// ---------------------------------------------------------------------------
// getHighestSlotLevel — bridge helper
// ---------------------------------------------------------------------------

describe("getHighestSlotLevel", () => {
  it("wizard level 5: highest is 3", () => {
    expect(getHighestSlotLevel("wizard", 5)).toBe(3);
  });

  it("wizard level 20: highest is 9", () => {
    expect(getHighestSlotLevel("wizard", 20)).toBe(9);
  });

  it("fighter: 0", () => {
    expect(getHighestSlotLevel("fighter", 10)).toBe(0);
  });

  it("warlock level 5: highest is 3 (pact slot level)", () => {
    expect(getHighestSlotLevel("warlock", 5)).toBe(3);
  });

  it("paladin level 1: 0 (no slots yet)", () => {
    expect(getHighestSlotLevel("paladin", 1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getRegistrySpellSelectionState
// ---------------------------------------------------------------------------

describe("getRegistrySpellSelectionState", () => {
  it("wizard level 1, mod +3: 3 cantrips, 4 leveled", () => {
    const state = getRegistrySpellSelectionState("wizard", 1, 3, []);
    expect(state.casterType).toBe("prepared");
    expect(state.label).toBe("Prepared spells");
    expect(state.maxCantrips).toBe(3);
    expect(state.maxLeveledSpells).toBe(4);
    expect(state.isAtLimit).toBe(false);
    expect(state.isOverLimit).toBe(false);
  });

  it("bard level 1, mod +2: known caster", () => {
    const state = getRegistrySpellSelectionState("bard", 1, 2, []);
    expect(state.casterType).toBe("known");
    expect(state.label).toBe("Known spells");
    expect(state.maxLeveledSpells).toBe(4);
  });

  it("warlock: pact caster type", () => {
    const state = getRegistrySpellSelectionState("warlock", 1, 3, []);
    expect(state.casterType).toBe("pact");
    expect(state.label).toBe("Pact spells");
  });

  it("non-caster returns casterType none", () => {
    const state = getRegistrySpellSelectionState("fighter", 1, 0, []);
    expect(state.casterType).toBe("none");
    expect(state.isAtLimit).toBe(true);
  });

  it("correctly counts cantrips and leveled spells", () => {
    const spells = [
      { level: 0 }, { level: 0 }, { level: 0 },
      { level: 1 }, { level: 1 },
    ];
    const state = getRegistrySpellSelectionState("wizard", 1, 3, spells);
    expect(state.currentCantrips).toBe(3);
    expect(state.currentLeveledSpells).toBe(2);
    expect(state.remainingCantrips).toBe(0);
    expect(state.remainingLeveledSpells).toBe(2);
    expect(state.isAtLimit).toBe(false);
    expect(state.isOverLimit).toBe(false);
  });

  it("detects over-limit cantrips", () => {
    const spells = [{ level: 0 }, { level: 0 }, { level: 0 }, { level: 0 }]; // 4 cantrips for wizard L1 (max 3)
    const state = getRegistrySpellSelectionState("wizard", 1, 3, spells);
    expect(state.isOverLimit).toBe(true);
  });

  it("detects over-limit leveled spells", () => {
    const spells = [
      { level: 1 }, { level: 1 }, { level: 1 }, { level: 1 }, { level: 1 },
    ]; // 5 leveled for wizard L1+3 (max 4)
    const state = getRegistrySpellSelectionState("wizard", 1, 3, spells);
    expect(state.isOverLimit).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateRegistrySpellSelection
// ---------------------------------------------------------------------------

describe("validateRegistrySpellSelection", () => {
  it("allows adding a cantrip within limits", () => {
    const result = validateRegistrySpellSelection("wizard", 1, 3, [], 0);
    expect(result.canAdd).toBe(true);
  });

  it("blocks cantrip when at limit", () => {
    const spells = [{ level: 0 }, { level: 0 }, { level: 0 }]; // 3 cantrips = wizard L1 max
    const result = validateRegistrySpellSelection("wizard", 1, 3, spells, 0);
    expect(result.canAdd).toBe(false);
    expect(result.reason).toContain("Cantrip limit");
  });

  it("allows adding a leveled spell within limits", () => {
    const result = validateRegistrySpellSelection("wizard", 1, 3, [], 1);
    expect(result.canAdd).toBe(true);
  });

  it("blocks leveled spell at limit", () => {
    const spells = [{ level: 1 }, { level: 1 }, { level: 1 }, { level: 1 }]; // 4 = max
    const result = validateRegistrySpellSelection("wizard", 1, 3, spells, 1);
    expect(result.canAdd).toBe(false);
    expect(result.reason).toContain("limit reached");
  });

  it("blocks non-caster class", () => {
    const result = validateRegistrySpellSelection("fighter", 1, 0, [], 1);
    expect(result.canAdd).toBe(false);
    expect(result.reason).toContain("does not use spellcasting");
  });
});
