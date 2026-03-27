/**
 * @fileoverview 2024 D&D 5e spell rules implementation.
 *
 * Implements RulesRegistry for spellcasting mechanics based on the
 * 2024 Player's Handbook.
 *
 * All magic numbers reference the 2024 PHB via inline comments:
 *   - Spell slot tables: 2024 PHB Chapter 7, each class section
 *   - Cantrip progression: 2024 PHB Chapter 7, cantrip upgrade footnote
 *   - Known/prepared limits: 2024 PHB class tables, "Spells Prepared" column
 *   - Warlock pact magic: 2024 PHB, Warlock class table (Chapter 7)
 *
 * This module exports only pure functions — no classes, no side effects.
 * Import getRules() to obtain the registry object.
 */

import type {
  Cantrip,
  EquipmentRule,
  RulesRegistry,
  SpellSlot,
  SpellcastingType,
} from "./RulesRegistry";
import { equipment } from "./equipment";

// ---------------------------------------------------------------------------
// Spell slot tables (2024 PHB)
// ---------------------------------------------------------------------------

/**
 * Full caster spell slot progression (levels 1–20).
 * Applies to: Bard, Cleric, Druid, Sorcerer, Wizard.
 *
 * Columns: [L1, L2, L3, L4, L5, L6, L7, L8, L9]
 * @see 2024 PHB — Class table for Wizard (representative full caster), Chapter 7
 */
const FULL_CASTER_SLOTS: ReadonlyArray<readonly number[]> = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // level 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // level 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // level 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // level 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // level 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // level 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // level 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // level 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // level 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // level 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // level 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // level 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // level 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // level 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // level 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // level 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // level 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // level 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // level 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // level 20
];

/**
 * Half caster spell slot progression (levels 1–20).
 * Applies to: Paladin, Ranger.
 * Half casters gain their first slots at level 2.
 *
 * @see 2024 PHB — Paladin class table, Chapter 7
 */
const HALF_CASTER_SLOTS: ReadonlyArray<readonly number[]> = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0], // level 1 — no slots yet
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // level 2
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // level 3
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // level 4
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // level 5
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // level 6
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // level 7
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // level 8
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // level 9
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // level 10
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // level 11
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // level 12
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // level 13
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // level 14
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // level 15
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // level 16
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // level 17
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // level 18
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // level 19
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // level 20
];

/**
 * Warlock Pact Magic slot progression (levels 1–20).
 * All slots are at a single spell level; slots recharge on short rests.
 *
 * Each entry: { spellLevel, slots }
 * @see 2024 PHB — Warlock class table, "Spell Slots" and "Slot Level", Chapter 7
 */
const WARLOCK_PACT_SLOTS: ReadonlyArray<{ readonly spellLevel: number; readonly slots: number }> =
  [
    { spellLevel: 1, slots: 1 }, // level 1
    { spellLevel: 1, slots: 2 }, // level 2
    { spellLevel: 2, slots: 2 }, // level 3
    { spellLevel: 2, slots: 2 }, // level 4
    { spellLevel: 3, slots: 2 }, // level 5
    { spellLevel: 3, slots: 2 }, // level 6
    { spellLevel: 4, slots: 2 }, // level 7
    { spellLevel: 4, slots: 2 }, // level 8
    { spellLevel: 5, slots: 2 }, // level 9
    { spellLevel: 5, slots: 2 }, // level 10
    { spellLevel: 5, slots: 3 }, // level 11
    { spellLevel: 5, slots: 3 }, // level 12
    { spellLevel: 5, slots: 3 }, // level 13
    { spellLevel: 5, slots: 3 }, // level 14
    { spellLevel: 5, slots: 3 }, // level 15
    { spellLevel: 5, slots: 3 }, // level 16
    { spellLevel: 5, slots: 4 }, // level 17
    { spellLevel: 5, slots: 4 }, // level 18
    { spellLevel: 5, slots: 4 }, // level 19
    { spellLevel: 5, slots: 4 }, // level 20
  ];

// ---------------------------------------------------------------------------
// Cantrip progression (2024 PHB)
// ---------------------------------------------------------------------------

/**
 * Maximum cantrips known per class at each level (index = level - 1).
 *
 * Cantrips scale in damage dice at levels 5, 11, 17:
 *   - Levels  1–4:  1 die
 *   - Levels  5–10: 2 dice
 *   - Levels 11–16: 3 dice
 *   - Levels 17–20: 4 dice
 * @see 2024 PHB — "Cantrip Upgrade", each class table footnote
 */
const CANTRIP_LIMITS: Readonly<Record<string, ReadonlyArray<number>>> = {
  // 2024 PHB — Bard class table, "Cantrips Known" column
  bard: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  // 2024 PHB — Cleric class table, "Cantrips Known" column
  cleric: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  // 2024 PHB — Druid class table, "Cantrips Known" column
  druid: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  // Paladin: no cantrips in 2024 PHB
  paladin: Array(20).fill(0) as number[],
  // Ranger: no cantrips in 2024 PHB
  ranger: Array(20).fill(0) as number[],
  // 2024 PHB — Sorcerer class table, "Cantrips Known" column
  sorcerer: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  // 2024 PHB — Warlock class table, "Cantrips Known" column
  warlock: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  // 2024 PHB — Wizard class table, "Cantrips Known" column
  wizard: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
};

/**
 * Returns the cantrip damage dice count for a given character level.
 * Progression: levels 1–4 → 1, 5–10 → 2, 11–16 → 3, 17–20 → 4.
 *
 * @see 2024 PHB — "Cantrip Upgrade" footnote in each caster class table
 */
function getCantripDamageDice(characterLevel: number): number {
  if (characterLevel >= 17) return 4; // 2024 PHB: level 17 upgrade
  if (characterLevel >= 11) return 3; // 2024 PHB: level 11 upgrade
  if (characterLevel >= 5) return 2; // 2024 PHB: level 5 upgrade
  return 1;
}

// ---------------------------------------------------------------------------
// Known/prepared spell counts (2024 PHB)
// ---------------------------------------------------------------------------

/**
 * Known spell count per level for "known" casters (index = level - 1).
 * These classes have a fixed list of known spells, not preparation.
 *
 * @see 2024 PHB — class table "Spells Known" column
 */
const KNOWN_SPELL_LIMITS: Readonly<Record<string, ReadonlyArray<number>>> = {
  // 2024 PHB — Bard class table
  bard: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 17, 18, 19, 20, 22, 22, 22],
  // 2024 PHB — Sorcerer class table
  sorcerer: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17],
  // 2024 PHB — Warlock class table (Pact Magic "Spells Known" column)
  warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
};

// ---------------------------------------------------------------------------
// Class classification sets
// ---------------------------------------------------------------------------

/** Classes that use half-caster spell slot progression */
const HALF_CASTER_CLASSES = new Set(["paladin", "ranger"]);

/** Classes that use warlock pact magic */
const PACT_MAGIC_CLASSES = new Set(["warlock"]);

/** Full caster class identifiers */
const FULL_CASTER_CLASSES = new Set(["bard", "cleric", "druid", "sorcerer", "wizard"]);

/**
 * Prepared casters: prepare daily from full list.
 * Limit = characterLevel + spellcastingMod (full), or floor(level/2) + mod (half).
 * @see 2024 PHB — "Preparing Spells" in each class section
 */
const PREPARED_CASTERS = new Set(["cleric", "druid", "paladin", "ranger", "wizard"]);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Clamps a character level to valid range [1, 20].
 */
function clampLevel(level: number): number {
  return Math.min(Math.max(Math.floor(level), 1), 20);
}

/**
 * Converts a flat number array to SpellSlot[] descriptors.
 * Only includes entries with max > 0.
 */
function toSpellSlots(row: readonly number[]): SpellSlot[] {
  return row
    .map((max, i) => ({ level: i + 1, max }))
    .filter((s) => s.max > 0);
}

// ---------------------------------------------------------------------------
// Public rule functions (exported for direct use / testing)
// ---------------------------------------------------------------------------

/**
 * Returns the spellcasting type for a class.
 * Non-spellcasting classes return "none".
 *
 * @pure
 */
export function getSpellcastingType(classId: string): SpellcastingType {
  const id = classId.trim().toLowerCase();
  if (PACT_MAGIC_CLASSES.has(id)) return "pact";
  if (FULL_CASTER_CLASSES.has(id) || HALF_CASTER_CLASSES.has(id)) {
    return PREPARED_CASTERS.has(id) ? "prepared" : "known";
  }
  return "none";
}

/**
 * Returns spell slot descriptors for a class at a given character level.
 * Returns an empty array for non-spellcasting classes.
 *
 * For Warlock: returns a single SpellSlot at the pact spell level.
 * For Paladin/Ranger: uses half-caster table.
 * For all other casters: uses full-caster table.
 *
 * @pure
 */
export function getSpellSlots(classId: string, characterLevel: number): SpellSlot[] {
  const id = classId.trim().toLowerCase();
  const level = clampLevel(characterLevel);

  if (PACT_MAGIC_CLASSES.has(id)) {
    const pact = WARLOCK_PACT_SLOTS[level - 1];
    return [{ level: pact.spellLevel, max: pact.slots }];
  }

  if (HALF_CASTER_CLASSES.has(id)) {
    return toSpellSlots(HALF_CASTER_SLOTS[level - 1]);
  }

  if (FULL_CASTER_CLASSES.has(id)) {
    return toSpellSlots(FULL_CASTER_SLOTS[level - 1]);
  }

  return [];
}

/**
 * Returns cantrip progression data for a class at a given character level.
 * Returns null for classes with no cantrips.
 *
 * Classes with no cantrips (paladin, ranger) return `null` — not `{maxKnown: 0}`.
 * Consumers should check `result !== null` before rendering cantrip UI.
 *
 * @pure
 */
export function getCantrips(classId: string, characterLevel: number): Cantrip | null {
  const id = classId.trim().toLowerCase();
  const level = clampLevel(characterLevel);
  const limits = CANTRIP_LIMITS[id];
  if (!limits) return null;

  const maxKnown = limits[level - 1];
  if (maxKnown === 0) return null; // No cantrip access → null, not {maxKnown: 0}

  return {
    characterLevel: level,
    maxKnown,
    damageDice: getCantripDamageDice(level),
  };
}

/**
 * Returns the maximum number of leveled spells a class can prepare/know.
 *
 * - Known casters (Bard, Sorcerer, Warlock): fixed table lookup.
 * - Prepared full casters (Cleric, Druid, Wizard): level + mod (min 1).
 * - Prepared half casters (Paladin, Ranger): floor(level/2) + mod (min 1).
 * - Non-casters: 0.
 *
 * @pure
 * @param classId              — lowercase class identifier
 * @param characterLevel       — 1–20
 * @param spellcastingModifier — spellcasting ability modifier (may be negative)
 */
export function getMaxPreparedSpells(
  classId: string,
  characterLevel: number,
  spellcastingModifier: number,
): number {
  const id = classId.trim().toLowerCase();
  const level = clampLevel(characterLevel);

  // FUNDAMENTAL: Does this class have ANY spell slots at this level?
  const slots = getSpellSlots(id, level);
  if (slots.length === 0) return 0; // No slots = no prepared spells possible

  // Known casters: fixed table
  const knownLimits = KNOWN_SPELL_LIMITS[id];
  if (knownLimits) {
    return knownLimits[level - 1] ?? 0;
  }

  // Prepared half casters: floor(level/2) + mod
  if (HALF_CASTER_CLASSES.has(id)) {
    return Math.max(1, Math.floor(level / 2) + spellcastingModifier);
  }

  // Prepared full casters: level + mod
  if (PREPARED_CASTERS.has(id)) {
    return Math.max(1, level + spellcastingModifier);
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Registry factory
// ---------------------------------------------------------------------------

/**
 * Creates and returns the 2024 D&D 5e spell rules registry.
 *
 * The returned object is a plain object (not a class instance) for easy
 * mocking in tests and composition in DI patterns.
 *
 * @pure — the returned registry object contains only pure functions.
 *
 * @example
 * ```ts
 * const rules = getRules();
 * const slots = rules.getSpellSlots("wizard", 5);
 * // slots → [{ level: 1, max: 4 }, { level: 2, max: 3 }, { level: 3, max: 2 }]
 * ```
 */
export function getRules(): RulesRegistry<SpellSlot[], Cantrip | null, EquipmentRule | null> {
  return {
    rulesVersion: "2024-dnd5e",

    getSpellSlots,
    getCantrips,
    getSpellcastingType,
    getMaxPreparedSpells,

    getEquipmentRules: (classId: string) => equipment.getEquipmentRules(classId),
  };
}
