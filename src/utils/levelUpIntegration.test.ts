/**
 * @fileoverview Tests for level-up progression integration:
 * spell slot updates, HP gain, and spell slot merge logic (CCR-022).
 */

import { describe, it, expect } from "vitest";
import { getDefaultSpellSlots, createEmptySpellSlots } from "@/lib/dndRules";
import { SpellSlots } from "@/types/character";

/**
 * Reproduces the spell slot merge logic from CharacterView.handleLevelUpConfirm.
 * Gains newly added slots while preserving current usage.
 */
function mergeSpellSlots(
  oldSlots: SpellSlots,
  newSlots: SpellSlots
): SpellSlots {
  const result = {} as SpellSlots;
  for (let i = 1; i <= 9; i++) {
    const key = `level${i}` as keyof SpellSlots;
    const oldSlot = oldSlots[key];
    const newSlot = newSlots[key];
    const gained = Math.max(0, newSlot.max - oldSlot.max);
    (result as Record<string, { current: number; max: number }>)[key] = {
      current: Math.min(oldSlot.current + gained, newSlot.max),
      max: newSlot.max,
    };
  }
  return result;
}

describe("Level-up spell slot updates", () => {
  describe("Full caster (Wizard) slot progression", () => {
    it("gains a level 1 slot when going from level 1 to 2", () => {
      const oldSlots = getDefaultSpellSlots("Wizard", 1);
      const newSlots = getDefaultSpellSlots("Wizard", 2);

      expect(oldSlots.level1.max).toBe(2);
      expect(newSlots.level1.max).toBe(3);
    });

    it("gains level 2 slots when going from level 2 to 3", () => {
      const oldSlots = getDefaultSpellSlots("Wizard", 2);
      const newSlots = getDefaultSpellSlots("Wizard", 3);

      expect(oldSlots.level2.max).toBe(0);
      expect(newSlots.level2.max).toBe(2);
    });

    it("gains level 2 slots when going from level 3 to 4", () => {
      const oldSlots = getDefaultSpellSlots("Wizard", 3);
      const newSlots = getDefaultSpellSlots("Wizard", 4);

      expect(newSlots.level1.max).toBe(4);
      expect(newSlots.level2.max).toBe(3);
    });
  });

  describe("Half caster (Paladin) slot progression", () => {
    it("has no spell slots at level 1", () => {
      const slots = getDefaultSpellSlots("Paladin", 1);
      expect(slots.level1.max).toBe(0);
    });

    it("gains level 1 slots at level 2", () => {
      const slots = getDefaultSpellSlots("Paladin", 2);
      expect(slots.level1.max).toBe(2);
    });
  });

  describe("Non-caster slot progression", () => {
    it("Fighter has no slots at any level", () => {
      const slots1 = getDefaultSpellSlots("Fighter", 1);
      const slots3 = getDefaultSpellSlots("Fighter", 3);

      for (let i = 1; i <= 9; i++) {
        const key = `level${i}` as keyof SpellSlots;
        expect(slots1[key].max).toBe(0);
        expect(slots3[key].max).toBe(0);
      }
    });
  });

  describe("Spell slot merge logic", () => {
    it("preserves used slots and gains new ones", () => {
      // Wizard at level 1 who spent 1 slot
      const current: SpellSlots = {
        ...createEmptySpellSlots(),
        level1: { current: 1, max: 2 }, // 1 of 2 remaining
      };

      const newMax = getDefaultSpellSlots("Wizard", 2); // max: 3 at level 2
      const merged = mergeSpellSlots(current, newMax);

      // Should gain 1 slot (3 - 2 = 1 new), so current goes from 1 to 2
      expect(merged.level1.max).toBe(3);
      expect(merged.level1.current).toBe(2);
    });

    it("does not exceed new max on merge", () => {
      const current: SpellSlots = {
        ...createEmptySpellSlots(),
        level1: { current: 2, max: 2 }, // full
      };

      const newMax = getDefaultSpellSlots("Wizard", 2);
      const merged = mergeSpellSlots(current, newMax);

      expect(merged.level1.max).toBe(3);
      expect(merged.level1.current).toBe(3); // 2 + 1 gained = 3, capped at max
    });

    it("adds newly unlocked spell levels", () => {
      const current: SpellSlots = {
        ...createEmptySpellSlots(),
        level1: { current: 3, max: 3 },
        level2: { current: 0, max: 0 }, // no level 2 slots yet
      };

      const newMax = getDefaultSpellSlots("Wizard", 3);
      const merged = mergeSpellSlots(current, newMax);

      expect(merged.level2.max).toBe(2);
      expect(merged.level2.current).toBe(2); // 0 + 2 gained = 2
    });

    it("handles fully depleted slots correctly", () => {
      const current: SpellSlots = {
        ...createEmptySpellSlots(),
        level1: { current: 0, max: 2 }, // all spent
      };

      const newMax = getDefaultSpellSlots("Wizard", 2);
      const merged = mergeSpellSlots(current, newMax);

      // Gains 1 new slot
      expect(merged.level1.max).toBe(3);
      expect(merged.level1.current).toBe(1); // 0 + 1 gained
    });
  });

  describe("Warlock pact magic progression", () => {
    it("has 1 level-1 slot at level 1", () => {
      const slots = getDefaultSpellSlots("Warlock", 1);
      expect(slots.level1.max).toBe(1);
    });

    it("gains a second level-1 slot at level 2", () => {
      const slots = getDefaultSpellSlots("Warlock", 2);
      expect(slots.level1.max).toBe(2);
    });

    it("upgrades to level-2 slots at level 3", () => {
      const slots = getDefaultSpellSlots("Warlock", 3);
      expect(slots.level1.max).toBe(0);
      expect(slots.level2.max).toBe(2);
    });
  });
});
