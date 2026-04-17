/**
 * @fileoverview Death saving throw logic for D&D 5e.
 * Tracks successes and failures per the 2024 PHB rules:
 * - Natural 20: combatant regains 1 HP and all death saves clear.
 * - Natural 1: counts as 2 failures.
 * - 10+: 1 success.
 * - 2–9: 1 failure.
 * - 3 successes: stabilized.
 * - 3 failures: dead.
 */

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface DeathSaveRollResult {
  /** The raw d20 roll (1–20) */
  roll: number;
  /** Number of successes added (0 or 1) */
  successesAdded: number;
  /** Number of failures added (0, 1, or 2) */
  failuresAdded: number;
  /** True when the roll was a natural 20 — combatant regains 1 HP and saves clear */
  isNatural20: boolean;
  /** True when the roll was a natural 1 — counts as 2 failures */
  isNatural1: boolean;
  /**
   * Updated death saves after applying the roll.
   * null when isNatural20 is true because saves are fully cleared in that case.
   */
  updatedSaves: DeathSaves | null;
}

/** Returns the initial (all-zero) death saves state. */
export function initialDeathSaves(): DeathSaves {
  return { successes: 0, failures: 0 };
}

/** Returns true when 3 or more successes have been accumulated (stabilized). */
export function isStabilized(saves: DeathSaves): boolean {
  return saves.successes >= 3;
}

/** Returns true when 3 or more failures have been accumulated (dead). */
export function isDead(saves: DeathSaves): boolean {
  return saves.failures >= 3;
}

/**
 * Apply a d20 die result to the current death saves state.
 *
 * Rules:
 * - 20 (natural 20): `isNatural20` is set; `updatedSaves` is null — caller should
 *   heal 1 HP and clear the death saves field on the combatant.
 * - 1  (natural 1):  counts as 2 failures (`failuresAdded = 2`).
 * - 10–19:           1 success (`successesAdded = 1`).
 * - 2–9:             1 failure (`failuresAdded = 1`).
 *
 * Successes and failures are each clamped to the range [0, 3].
 *
 * @param current - The combatant's existing death saves state.
 * @param roll    - The d20 die result (1–20).
 */
export function applyDeathSaveRoll(current: DeathSaves, roll: number): DeathSaveRollResult {
  const isNatural20 = roll === 20;
  const isNatural1 = roll === 1;

  if (isNatural20) {
    return {
      roll,
      successesAdded: 0,
      failuresAdded: 0,
      isNatural20: true,
      isNatural1: false,
      updatedSaves: null,
    };
  }

  const successesAdded = roll >= 10 ? 1 : 0;
  const failuresAdded = isNatural1 ? 2 : roll < 10 ? 1 : 0;

  const updatedSaves: DeathSaves = {
    successes: Math.min(3, current.successes + successesAdded),
    failures: Math.min(3, current.failures + failuresAdded),
  };

  return {
    roll,
    successesAdded,
    failuresAdded,
    isNatural20: false,
    isNatural1,
    updatedSaves,
  };
}
