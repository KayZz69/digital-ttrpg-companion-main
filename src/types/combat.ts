/**
 * @fileoverview Type definitions for the combat tracking system.
 * Handles initiative order, combatant status, and condition tracking.
 */

/**
 * Classification of a combatant in the initiative order.
 * Determines visual styling and behavior in the combat tracker.
 */
export type CombatantType = "player" | "enemy" | "ally";

/**
 * D&D 5e status conditions that can affect combatants.
 * Each condition has specific mechanical effects per the SRD.
 */
export type ConditionType =
  | "blinded"
  | "charmed"
  | "deafened"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious";

/**
 * A condition effect currently applied to a combatant.
 * Conditions can have a duration that decrements each round.
 */
export interface Condition {
  /** Unique identifier for this condition instance (UUID) */
  id: string;
  /** The type of condition (e.g., "poisoned", "prone") */
  type: ConditionType;
  /** Rounds remaining; -1 indicates indefinite duration */
  duration: number;
  /** Optional notes about the condition source or specifics */
  notes?: string;
}

/**
 * A participant in combat, whether player character, enemy, or ally.
 * Tracks all combat-relevant stats needed for the encounter.
 */
export interface Combatant {
  /** Unique identifier for this combatant (UUID) */
  id: string;
  /** Display name in the initiative order */
  name: string;
  /** Classification: player, enemy, or ally */
  type: CombatantType;
  /** Current initiative roll result (including bonus) */
  initiative: number;
  /** Dexterity modifier or other bonus added to initiative rolls */
  initiativeBonus?: number;
  /** Current and maximum hit points */
  hitPoints: {
    current: number;
    max: number;
  };
  /** Armor class for attack resolution */
  armorClass: number;
  /** Active conditions affecting this combatant */
  conditions?: Condition[];
  /** Whether this combatant is currently active in combat */
  isActive?: boolean;
  /** Links to a Character if this is a player combatant */
  characterId?: string;
}

/**
 * A saved combat encounter with full state.
 * Allows resuming encounters from where they left off.
 */
export interface CombatEncounter {
  /** Unique identifier for this encounter (UUID) */
  id: string;
  /** ID of the player character who initiated this encounter */
  characterId: string;
  /** All combatants in the initiative order */
  participants: Combatant[];
  /** Index of the current combatant in the turn order */
  currentTurn: number;
  /** Current round number (starts at 1) */
  round: number;
  /** ISO 8601 timestamp when the encounter began */
  startedAt: string;
  /** ISO 8601 timestamp when the encounter ended (optional) */
  endedAt?: string;
}
