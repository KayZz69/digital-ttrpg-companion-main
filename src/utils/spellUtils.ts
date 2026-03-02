/**
 * @fileoverview Spell system utility functions for D&D 5e.
 * Handles ritual casting eligibility, concentration conflict detection,
 * and rest-based spell slot recovery.
 */

import type { PreparedSpell, SpellSlots } from "@/types/character";
import { getClassByName } from "@/lib/dndCompendium";
import { getDefaultSpellSlots } from "@/lib/dndRules";

/**
 * Returns true if the spell has the ritual tag AND the character's class
 * supports ritual casting (per ClassSpellcasting.ritualCasting).
 *
 * When true, the spell can be cast without expending a spell slot
 * (though it takes 10 minutes longer than its normal casting time).
 */
export function canCastAsRitual(
    spell: Pick<PreparedSpell, "ritual">,
    className: string
): boolean {
    if (!spell.ritual) return false;
    const cls = getClassByName(className);
    return cls?.spellcasting?.ritualCasting === true;
}

/**
 * Returns the first concentration spell from a list of active spells,
 * or null if none are found.
 *
 * In practice, only one concentration spell should be active at a time,
 * but this returns the first match for validation purposes.
 */
export function getActiveConcentrationSpell(
    spells: Pick<PreparedSpell, "name" | "concentration">[]
): string | null {
    const found = spells.find((s) => s.concentration === true);
    return found?.name ?? null;
}

/**
 * Returns true if casting a new concentration spell would conflict
 * with an existing active concentration spell.
 *
 * Per 5e rules, a caster can only concentrate on one spell at a time.
 * Casting a new concentration spell ends the previous one.
 */
export function isConcentrationConflict(
    activeConcentrationSpell: string | null | undefined,
    newSpell: Pick<PreparedSpell, "concentration">
): boolean {
    if (!newSpell.concentration) return false;
    return !!activeConcentrationSpell;
}

/**
 * Returns true if the class is a Warlock (pact magic caster).
 * Warlocks recover all spell slots on short rests instead of long rests.
 */
export function isPactMagicCaster(className: string): boolean {
    return className.trim().toLowerCase() === "warlock";
}

/**
 * Restores spell slots based on rest type and class.
 *
 * Short rest:
 *   - Warlock: all pact magic slots reset to max
 *   - Others: no change
 *
 * Long rest:
 *   - All classes: all spell slots reset to max
 *
 * @returns A new SpellSlots object with restored values.
 */
export function restoreSpellSlots(
    currentSlots: SpellSlots,
    className: string,
    level: number,
    restType: "short" | "long"
): SpellSlots {
    if (restType === "long") {
        // Long rest: restore all slots to their class/level max
        return getDefaultSpellSlots(className, level);
    }

    // Short rest: only Warlocks recover pact magic slots
    if (isPactMagicCaster(className)) {
        return getDefaultSpellSlots(className, level);
    }

    // Non-Warlock short rest: no spell slot change
    return { ...currentSlots };
}
