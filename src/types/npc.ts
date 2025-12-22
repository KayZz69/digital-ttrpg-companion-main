/**
 * @fileoverview Type definitions for NPCs (Non-Player Characters).
 * Used in the NPC library and combat tracker.
 */

/**
 * Represents a special ability or action an NPC can perform.
 * Displayed in the NPC details view.
 */
export interface NPCAbility {
  /** Name of the ability (e.g., "Multiattack", "Spellcasting") */
  name: string;
  /** Full description of what the ability does */
  description: string;
}

/**
 * A Non-Player Character stored in the NPC library.
 * Can be quickly added to combat encounters.
 */
export interface NPC {
  /** Unique identifier for this NPC (UUID) */
  id: string;
  /** Display name of the NPC */
  name: string;
  /** Relationship type: enemy, ally, or neutral */
  type: "enemy" | "ally" | "neutral";
  /** Hit points (used as both current and max when added to combat) */
  hitPoints: number;
  /** Armor class for attack resolution */
  armorClass: number;
  /** Modifier applied to initiative rolls */
  initiativeBonus?: number;
  /** List of special abilities and actions */
  abilities?: NPCAbility[];
  /** Freeform notes about this NPC */
  notes?: string;
  /** ISO 8601 timestamp of when this NPC was created */
  createdAt: string;
}
