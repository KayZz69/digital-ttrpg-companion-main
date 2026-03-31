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
  getCantrips,
  getHighestAvailableSlotLevel,
  getMaxPreparedSpells,
  getRegistrySpellSelectionState,
  getRules,
  getSpellSlots,
  getSpellcastingType,
  toCharacterSpellSlots,
  validateRegistrySpellSelection,
  validateSpellStepComplete,
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
// CCR-003: Character-model adapters
// ---------------------------------------------------------------------------

describe("toCharacterSpellSlots", () => {
  it("wizard level 5 produces correct SpellSlots shape", () => {
    const slots = toCharacterSpellSlots("wizard", 5);
    expect(slots.level1).toEqual({ current: 4, max: 4 });
    expect(slots.level2).toEqual({ current: 3, max: 3 });
    expect(slots.level3).toEqual({ current: 2, max: 2 });
    expect(slots.level4).toEqual({ current: 0, max: 0 });
  });

  it("non-caster returns all zeroes", () => {
    const slots = toCharacterSpellSlots("fighter", 10);
    for (let l = 1; l <= 9; l++) {
      const key = `level${l}` as keyof typeof slots;
      expect(slots[key]).toEqual({ current: 0, max: 0 });
    }
  });

  it("warlock has single slot level populated", () => {
    const slots = toCharacterSpellSlots("warlock", 5);
    expect(slots.level3).toEqual({ current: 2, max: 2 });
    expect(slots.level1).toEqual({ current: 0, max: 0 });
    expect(slots.level2).toEqual({ current: 0, max: 0 });
  });

  it("paladin level 1 has no slots", () => {
    const slots = toCharacterSpellSlots("paladin", 1);
    for (let l = 1; l <= 9; l++) {
      const key = `level${l}` as keyof typeof slots;
      expect(slots[key]).toEqual({ current: 0, max: 0 });
    }
  });

  it("paladin level 2 has first-level slots", () => {
    const slots = toCharacterSpellSlots("paladin", 2);
    expect(slots.level1).toEqual({ current: 2, max: 2 });
  });
});

describe("getHighestAvailableSlotLevel", () => {
  it("wizard level 5 → 3", () => {
    expect(getHighestAvailableSlotLevel("wizard", 5)).toBe(3);
  });

  it("wizard level 20 → 9", () => {
    expect(getHighestAvailableSlotLevel("wizard", 20)).toBe(9);
  });

  it("fighter → 0", () => {
    expect(getHighestAvailableSlotLevel("fighter", 10)).toBe(0);
  });

  it("warlock level 9 → 5", () => {
    expect(getHighestAvailableSlotLevel("warlock", 9)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// CCR-003: Registry-backed spell selection state
// ---------------------------------------------------------------------------

describe("getRegistrySpellSelectionState", () => {
  it("returns mode=none for non-caster", () => {
    const state = getRegistrySpellSelectionState("fighter", 1, 10, []);
    expect(state.mode).toBe("none");
    expect(state.maxCantrips).toBe(0);
    expect(state.maxLeveledSpells).toBeNull();
  });

  it("wizard is prepared mode", () => {
    const state = getRegistrySpellSelectionState("wizard", 5, 16, []);
    expect(state.mode).toBe("prepared");
    expect(state.label).toBe("Prepared spells");
    // 2024 PHB: wizard level 5 = 4 cantrips
    expect(state.maxCantrips).toBe(4);
    // level + mod = 5 + 3 = 8
    expect(state.maxLeveledSpells).toBe(8);
  });

  it("bard is known mode", () => {
    const state = getRegistrySpellSelectionState("bard", 1, 16, []);
    expect(state.mode).toBe("known");
    expect(state.label).toBe("Known spells");
  });

  it("warlock is known mode (pact maps to known)", () => {
    const state = getRegistrySpellSelectionState("warlock", 1, 16, []);
    expect(state.mode).toBe("known");
  });

  it("tracks current counts and remaining", () => {
    const spells = [
      { level: 0 }, { level: 0 }, // 2 cantrips
      { level: 1 }, { level: 1 }, { level: 2 }, // 3 leveled
    ];
    const state = getRegistrySpellSelectionState("wizard", 5, 16, spells);
    expect(state.currentCantrips).toBe(2);
    expect(state.currentLeveledSpells).toBe(3);
    expect(state.remainingCantrips).toBe(2); // 4 - 2
    expect(state.remainingLeveledSpells).toBe(5); // 8 - 3
    expect(state.isAtLimit).toBe(false);
    expect(state.isOverLimit).toBe(false);
  });

  it("detects over-limit for cantrips", () => {
    // wizard level 1 = 3 cantrips max, give 4
    const spells = [{ level: 0 }, { level: 0 }, { level: 0 }, { level: 0 }];
    const state = getRegistrySpellSelectionState("wizard", 1, 16, spells);
    expect(state.isOverLimit).toBe(true);
  });
});

describe("validateRegistrySpellSelection", () => {
  it("non-caster cannot add", () => {
    const result = validateRegistrySpellSelection("fighter", 1, 10, [], 1);
    expect(result.canAdd).toBe(false);
    expect(result.reason).toContain("does not use spellcasting");
  });

  it("allows adding cantrip when under limit", () => {
    const result = validateRegistrySpellSelection("wizard", 1, 16, [], 0);
    expect(result.canAdd).toBe(true);
  });

  it("blocks cantrip at limit", () => {
    const cantrips = [{ level: 0 }, { level: 0 }, { level: 0 }]; // wizard level 1 = 3 max
    const result = validateRegistrySpellSelection("wizard", 1, 16, cantrips, 0);
    expect(result.canAdd).toBe(false);
    expect(result.reason).toContain("Cantrip limit");
  });

  it("allows adding leveled spell when under limit", () => {
    const result = validateRegistrySpellSelection("wizard", 5, 16, [], 1);
    expect(result.canAdd).toBe(true);
  });

  it("blocks leveled spell at limit", () => {
    // wizard level 5, mod +3 = 8 max. Fill 8 spells.
    const spells = Array.from({ length: 8 }, () => ({ level: 1 }));
    const result = validateRegistrySpellSelection("wizard", 5, 16, spells, 1);
    expect(result.canAdd).toBe(false);
    expect(result.reason).toContain("limit reached");
  });
});

// ---------------------------------------------------------------------------
// CCR-006: validateSpellStepComplete
// ---------------------------------------------------------------------------

describe("validateSpellStepComplete", () => {
  // --- Non-caster ---

  it("non-caster (fighter): always complete", () => {
    const result = validateSpellStepComplete("fighter", 5, 10, []);
    expect(result.isComplete).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // --- Known caster: Bard level 1 ---
  // Bard level 1: 2 cantrips, 4 known spells

  it("bard level 1: incomplete with 0 spells", () => {
    const result = validateSpellStepComplete("bard", 1, 16, []);
    expect(result.isComplete).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("bard level 1: incomplete with partial cantrips and partial known", () => {
    // 1/2 cantrips + 3/4 known
    const spells = [
      { level: 0 },
      { level: 1 }, { level: 1 }, { level: 1 },
    ];
    const result = validateSpellStepComplete("bard", 1, 16, spells);
    expect(result.isComplete).toBe(false);
    expect(result.errors.some((e) => e.includes("cantrips"))).toBe(true);
    expect(result.errors.some((e) => e.includes("known spells"))).toBe(true);
  });

  it("bard level 1: complete with exact counts (2 cantrips + 4 known)", () => {
    const spells = [
      { level: 0 }, { level: 0 },
      { level: 1 }, { level: 1 }, { level: 1 }, { level: 1 },
    ];
    const result = validateSpellStepComplete("bard", 1, 16, spells);
    expect(result.isComplete).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // --- Prepared caster: Cleric level 1 ---
  // Cleric level 1: 3 cantrips, prepared = level + mod (min 1)

  it("cleric level 1: incomplete with 0 spells", () => {
    const result = validateSpellStepComplete("cleric", 1, 16, []);
    expect(result.isComplete).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("cleric level 1: complete with exact cantrips + at least 1 leveled", () => {
    // 3 cantrips + 1 leveled spell (mod +3 allows up to 4, but only 1 needed)
    const spells = [
      { level: 0 }, { level: 0 }, { level: 0 },
      { level: 1 },
    ];
    const result = validateSpellStepComplete("cleric", 1, 16, spells);
    expect(result.isComplete).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // --- Prepared caster: Wizard level 1 ---
  // Wizard level 1: 3 cantrips, prepared = level + mod (min 1)

  it("wizard level 1: incomplete with 0 spells", () => {
    const result = validateSpellStepComplete("wizard", 1, 16, []);
    expect(result.isComplete).toBe(false);
  });

  it("wizard level 1: complete with exact cantrips + at least 1 leveled", () => {
    const spells = [
      { level: 0 }, { level: 0 }, { level: 0 },
      { level: 1 },
    ];
    const result = validateSpellStepComplete("wizard", 1, 16, spells);
    expect(result.isComplete).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // --- Half-caster at level 1: Paladin ---
  // Paladin level 1: 0 cantrips, 0 slots → complete with 0 spells

  it("paladin level 1: complete with 0 spells (no slots, no cantrips)", () => {
    const result = validateSpellStepComplete("paladin", 1, 16, []);
    expect(result.isComplete).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // --- Half-caster at level 2: Ranger ---
  // Ranger level 2: 0 cantrips, has slots → needs at least 1 leveled spell

  it("ranger level 2: incomplete with 0 spells (has slots)", () => {
    const result = validateSpellStepComplete("ranger", 2, 14, []);
    expect(result.isComplete).toBe(false);
    expect(result.errors.some((e) => e.includes("at least 1"))).toBe(true);
  });

  it("ranger level 2: complete with 1 leveled spell", () => {
    const spells = [{ level: 1 }];
    const result = validateSpellStepComplete("ranger", 2, 14, spells);
    expect(result.isComplete).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // --- Warlock (pact → treated as known) ---
  // Warlock level 1: 2 cantrips, 2 known spells

  it("warlock level 1: incomplete with 0 spells", () => {
    const result = validateSpellStepComplete("warlock", 1, 16, []);
    expect(result.isComplete).toBe(false);
  });

  it("warlock level 1: complete with exact counts (2 cantrips + 2 known)", () => {
    const spells = [
      { level: 0 }, { level: 0 },
      { level: 1 }, { level: 1 },
    ];
    const result = validateSpellStepComplete("warlock", 1, 16, spells);
    expect(result.isComplete).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // --- Over-limit ---

  it("over-limit: returns error for too many cantrips", () => {
    // wizard level 1: 3 cantrips max, give 4
    const spells = [
      { level: 0 }, { level: 0 }, { level: 0 }, { level: 0 },
      { level: 1 },
    ];
    const result = validateSpellStepComplete("wizard", 1, 16, spells);
    expect(result.isComplete).toBe(false);
    expect(result.errors.some((e) => e.includes("Too many cantrips"))).toBe(true);
  });

  it("over-limit: returns error for too many leveled spells", () => {
    // wizard level 1, mod +3 = 4 max leveled. Give 5 leveled + 3 cantrips.
    const spells = [
      { level: 0 }, { level: 0 }, { level: 0 },
      { level: 1 }, { level: 1 }, { level: 1 }, { level: 1 }, { level: 1 },
    ];
    const result = validateSpellStepComplete("wizard", 1, 16, spells);
    expect(result.isComplete).toBe(false);
    expect(result.errors.some((e) => e.includes("Too many leveled spells"))).toBe(true);
  });

  // --- Invalid spell level ---

  it("spell level exceeds highest slot level: returns error", () => {
    // wizard level 1: highest slot = 1, add a level 2 spell
    const spells = [
      { level: 0 }, { level: 0 }, { level: 0 },
      { level: 2 },
    ];
    const result = validateSpellStepComplete("wizard", 1, 16, spells);
    expect(result.isComplete).toBe(false);
    expect(result.errors.some((e) => e.includes("exceeds highest available slot level"))).toBe(true);
  });

  // --- Edge case: negative modifier for prepared caster ---

  it("prepared caster with negative modifier: min 1 leveled spell required", () => {
    // cleric level 1, ability score 6 → mod = -2 → max prepared = max(1, 1 + -2) = 1
    const result = validateSpellStepComplete("cleric", 1, 6, []);
    expect(result.isComplete).toBe(false);
    expect(result.errors.some((e) => e.includes("at least 1"))).toBe(true);
  });

  it("prepared caster with negative modifier: complete with exact cantrips + 1 leveled", () => {
    // cleric level 1: 3 cantrips, min 1 leveled
    const spells = [
      { level: 0 }, { level: 0 }, { level: 0 },
      { level: 1 },
    ];
    const result = validateSpellStepComplete("cleric", 1, 6, spells);
    expect(result.isComplete).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
