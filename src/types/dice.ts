/**
 * @fileoverview Type definitions for the dice rolling system.
 * Supports standard polyhedral dice (d4-d100) with advantage/disadvantage mechanics.
 */

/**
 * Standard polyhedral dice types used in tabletop RPGs.
 * Includes all common dice from d4 to d100 (percentile).
 */
export type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

/**
 * Roll mode for D&D 5e advantage/disadvantage mechanics.
 * - "normal": Roll once and use the result
 * - "advantage": Roll twice, take the higher result
 * - "disadvantage": Roll twice, take the lower result
 */
export type RollMode = "normal" | "advantage" | "disadvantage";

/**
 * Represents a complete dice roll with all relevant metadata.
 * Stored in roll history and displayed in the dice roller interface.
 */
export interface DiceRoll {
  /** Unique identifier for this roll (UUID) */
  id: string;
  /** When the roll was made */
  timestamp: Date;
  /** Type of die rolled (e.g., "d20") */
  diceType: DiceType;
  /** Number of dice rolled (e.g., 2 for 2d6) */
  numberOfDice: number;
  /** Static modifier added to the total (can be negative) */
  modifier: number;
  /** Roll mode (normal, advantage, or disadvantage) */
  mode: RollMode;
  /** Individual die results before modifiers */
  results: number[];
  /** Final calculated total including modifiers */
  total: number;
  /** Optional description (e.g., "Attack roll", "Stealth check") */
  description?: string;
}

/** Array of all available dice types for UI dropdowns and iteration */
export const DICE_TYPES: DiceType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];
