import { describe, expect, it } from "vitest";
import {
    canCastAsRitual,
    getActiveConcentrationSpell,
    isConcentrationConflict,
    isPactMagicCaster,
    restoreSpellSlots,
} from "./spellUtils";
import { createEmptySpellSlots, getDefaultSpellSlots } from "@/lib/dndRules";

describe("spellUtils", () => {
    describe("canCastAsRitual", () => {
        it("returns true for a ritual spell with a ritual-capable class", () => {
            // Wizard supports ritual casting
            expect(canCastAsRitual({ ritual: true }, "Wizard")).toBe(true);
            expect(canCastAsRitual({ ritual: true }, "Cleric")).toBe(true);
            expect(canCastAsRitual({ ritual: true }, "Druid")).toBe(true);
        });

        it("returns false for a ritual spell with a non-ritual class", () => {
            // Sorcerer does NOT support ritual casting
            expect(canCastAsRitual({ ritual: true }, "Sorcerer")).toBe(false);
            expect(canCastAsRitual({ ritual: true }, "Warlock")).toBe(false);
        });

        it("returns false for a non-ritual spell regardless of class", () => {
            expect(canCastAsRitual({ ritual: false }, "Wizard")).toBe(false);
            expect(canCastAsRitual({ ritual: undefined }, "Wizard")).toBe(false);
        });

        it("returns false for a non-spellcasting class", () => {
            expect(canCastAsRitual({ ritual: true }, "Fighter")).toBe(false);
        });
    });

    describe("getActiveConcentrationSpell", () => {
        it("returns the name of the first concentration spell", () => {
            const spells = [
                { name: "Fireball", concentration: false },
                { name: "Bless", concentration: true },
                { name: "Shield", concentration: false },
            ];
            expect(getActiveConcentrationSpell(spells)).toBe("Bless");
        });

        it("returns null when no concentration spells are present", () => {
            const spells = [
                { name: "Fireball", concentration: false },
                { name: "Shield", concentration: false },
            ];
            expect(getActiveConcentrationSpell(spells)).toBeNull();
        });

        it("returns null for an empty list", () => {
            expect(getActiveConcentrationSpell([])).toBeNull();
        });

        it("handles undefined concentration field gracefully", () => {
            const spells = [{ name: "Custom Spell", concentration: undefined }];
            expect(getActiveConcentrationSpell(spells)).toBeNull();
        });
    });

    describe("isConcentrationConflict", () => {
        it("returns true when a concentration spell is active and new spell requires concentration", () => {
            expect(isConcentrationConflict("Bless", { concentration: true })).toBe(true);
        });

        it("returns false when no concentration spell is active", () => {
            expect(isConcentrationConflict(null, { concentration: true })).toBe(false);
            expect(isConcentrationConflict(undefined, { concentration: true })).toBe(false);
        });

        it("returns false when new spell does not require concentration", () => {
            expect(isConcentrationConflict("Bless", { concentration: false })).toBe(false);
            expect(isConcentrationConflict("Bless", { concentration: undefined })).toBe(false);
        });
    });

    describe("isPactMagicCaster", () => {
        it("returns true for Warlock (any casing)", () => {
            expect(isPactMagicCaster("Warlock")).toBe(true);
            expect(isPactMagicCaster("warlock")).toBe(true);
            expect(isPactMagicCaster("  Warlock  ")).toBe(true);
        });

        it("returns false for other classes", () => {
            expect(isPactMagicCaster("Wizard")).toBe(false);
            expect(isPactMagicCaster("Cleric")).toBe(false);
            expect(isPactMagicCaster("")).toBe(false);
        });
    });

    describe("restoreSpellSlots", () => {
        it("restores all slots on long rest for full casters", () => {
            const depleted = createEmptySpellSlots();
            const restored = restoreSpellSlots(depleted, "Wizard", 5, "long");
            const expected = getDefaultSpellSlots("Wizard", 5);
            expect(restored).toEqual(expected);
            expect(restored.level1.current).toBe(restored.level1.max);
            expect(restored.level3.current).toBe(restored.level3.max);
        });

        it("does not restore non-warlock slots on short rest", () => {
            const depleted = createEmptySpellSlots();
            const restored = restoreSpellSlots(depleted, "Wizard", 5, "short");
            // Should be unchanged from the depleted input
            expect(restored.level1.current).toBe(0);
            expect(restored.level3.current).toBe(0);
        });

        it("restores warlock pact slots on short rest", () => {
            const depleted = createEmptySpellSlots();
            const restored = restoreSpellSlots(depleted, "Warlock", 5, "short");
            const expected = getDefaultSpellSlots("Warlock", 5);
            expect(restored).toEqual(expected);
        });

        it("restores warlock pact slots on long rest", () => {
            const depleted = createEmptySpellSlots();
            const restored = restoreSpellSlots(depleted, "Warlock", 5, "long");
            const expected = getDefaultSpellSlots("Warlock", 5);
            expect(restored).toEqual(expected);
        });

        it("handles non-spellcasting classes gracefully", () => {
            const slots = createEmptySpellSlots();
            const restored = restoreSpellSlots(slots, "Fighter", 5, "long");
            expect(restored.level1.max).toBe(0);
        });
    });
});
