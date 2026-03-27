/**
 * @fileoverview RulesRegistry interface and shared D&D 5e 2024 type definitions.
 *
 * This module defines the extensible rules registry contract that all rule
 * implementations must satisfy. It is interface-only — no implementation lives here.
 *
 * Rules baseline: 2024 Player's Handbook (D&D 5e 2024)
 *
 * @see ARCHITECTURE.md — "Character Creation Rules Baseline"
 */

// ---------------------------------------------------------------------------
// Primitive types
// ---------------------------------------------------------------------------

/**
 * Spell slot descriptor for a single spell level.
 * Represents the maximum slots available at a given spell level.
 *
 * @see 2024 PHB — "Spell Slots" table, Chapter 7 (each class section)
 */
export interface SpellSlot {
  /** Spell level (1–9) */
  readonly level: number;
  /** Maximum number of spell slots at this level */
  readonly max: number;
}

/**
 * Cantrip (level-0 spell) descriptor for a class at a specific character level.
 *
 * Cantrips scale in power at character levels 5, 11, and 17.
 * @see 2024 PHB — "Cantrip Upgrade" (each class table footnote)
 */
export interface Cantrip {
  /** Character level at which this cantrip count applies */
  readonly characterLevel: number;
  /** Maximum number of cantrips known */
  readonly maxKnown: number;
  /**
   * Damage die count multiplier for cantrips that deal damage.
   * Follows the 2024 PHB progression: 1→2→3→4 dice at levels 1/5/11/17.
   */
  readonly damageDice: number;
}

/**
 * Equipment rule for a starting class package.
 * Full implementation deferred to CCR-007.
 *
 * @see 2024 PHB — "Starting Equipment" (each class section)
 */
export interface EquipmentRule {
  /** Class identifier this rule applies to (lowercase, e.g. "wizard") */
  readonly classId: string;
  /**
   * Named equipment packages the player may choose from.
   * Each package is a human-readable list of items.
   */
  readonly packages: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    /** Item names in this package (display only; linking deferred to CCR-007) */
    readonly items: ReadonlyArray<string>;
  }>;
  /** Starting gold (in gp) if the player chooses gold-buy mode */
  readonly startingGoldGP: number;
}

// ---------------------------------------------------------------------------
// Spellcasting mechanics
// ---------------------------------------------------------------------------

/**
 * Describes how a class acquires and manages leveled spells.
 *
 * - `known`    — player chooses spells from a fixed list; count is capped by level.
 * - `prepared` — player prepares spells daily from their full class list; count
 *                is capped by level + spellcasting modifier.
 * - `pact`     — warlock-style pact magic: all slots are the same level; short-rest
 *                recovery (slot progression handled separately in SpellRegistry).
 * - `none`     — class has no spellcasting.
 */
export type SpellcastingType = "known" | "prepared" | "pact" | "none";

// ---------------------------------------------------------------------------
// Core registry interface
// ---------------------------------------------------------------------------

/**
 * Contract for all rule subsystem registries.
 *
 * A registry is a pure, stateless object (or plain-object factory result)
 * that surfaces rule lookups. No mutations, no side effects.
 *
 * @template TSpellSlots  — spell slot structure returned by `getSpellSlots`
 * @template TCantrips    — cantrip descriptor structure returned by `getCantrips`
 * @template TEquipment   — equipment rule structure returned by `getEquipmentRules`
 */
export interface RulesRegistry<
  TSpellSlots = SpellSlot[],
  TCantrips = Cantrip | null,
  TEquipment = EquipmentRule | null,
> {
  /**
   * Identifies the rules edition this registry implements.
   * Format: "<year>-<edition>" e.g. "2024-dnd5e"
   */
  readonly rulesVersion: string;

  /**
   * Returns the spell slot progression for a given class and character level.
   *
   * @param classId       — lowercase class identifier (e.g. "wizard", "paladin")
   * @param characterLevel — 1–20
   * @returns Array of SpellSlot descriptors (empty for non-casters)
   */
  getSpellSlots(classId: string, characterLevel: number): TSpellSlots;

  /**
   * Returns the cantrip progression for a given class at a character level.
   *
   * @param classId        — lowercase class identifier
   * @param characterLevel — 1–20
   * @returns Cantrip descriptor, or null if the class has no cantrips
   */
  getCantrips(classId: string, characterLevel: number): TCantrips;

  /**
   * Returns the spellcasting type for a class.
   *
   * @param classId — lowercase class identifier
   */
  getSpellcastingType(classId: string): SpellcastingType;

  /**
   * Returns the maximum number of prepared/known leveled spells.
   *
   * - For `known` casters: returns the fixed known-spell count from class table.
   * - For `prepared` casters: returns `characterLevel + spellcastingModifier`
   *   (floored for half-casters at `floor(level/2) + mod`).
   * - For `pact` casters: returns the pact spells known count.
   * - For `none`: returns 0.
   *
   * @param classId              — lowercase class identifier
   * @param characterLevel       — 1–20
   * @param spellcastingModifier — spellcasting ability modifier
   */
  getMaxPreparedSpells(
    classId: string,
    characterLevel: number,
    spellcastingModifier: number,
  ): number;

  /**
   * Returns starting equipment rules for a class.
   * Full implementation deferred to CCR-007.
   *
   * @param classId — lowercase class identifier
   */
  getEquipmentRules(classId: string): TEquipment;
}
