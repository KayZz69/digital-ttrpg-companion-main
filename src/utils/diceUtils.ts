import { DiceType, RollMode, DiceRoll } from "@/types/dice";

/**
 * Rolls a single die with the specified number of sides.
 * Uses Math.random() to generate a random integer between 1 and sides (inclusive).
 *
 * @param sides - The number of sides on the die (e.g., 6 for a d6, 20 for a d20)
 * @returns A random integer between 1 and sides (inclusive)
 *
 * @example
 * rollDice(20); // Returns a number between 1 and 20
 * rollDice(6);  // Returns a number between 1 and 6
 */
export const rollDice = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Creates a complete dice roll with support for multiple dice, modifiers, and advantage/disadvantage.
 * Handles D&D 5e roll mechanics including advantage (take highest) and disadvantage (take lowest).
 *
 * @param diceType - The type of die to roll (e.g., "d20", "d6")
 * @param numberOfDice - How many dice to roll (ignored for advantage/disadvantage which always rolls 2)
 * @param modifier - A static number to add to (or subtract from) the total
 * @param mode - The roll mode: "normal", "advantage", or "disadvantage"
 * @param description - Optional description for the roll (e.g., "Attack roll", "Perception check")
 * @returns A DiceRoll object containing all roll details and the calculated total
 *
 * @example
 * // Normal attack roll with +5 modifier
 * createDiceRoll("d20", 1, 5, "normal", "Attack roll");
 *
 * // Roll 2d6 damage with +3 modifier
 * createDiceRoll("d6", 2, 3, "normal", "Shortsword damage");
 *
 * // Advantage roll for stealth check
 * createDiceRoll("d20", 1, 4, "advantage", "Stealth check");
 */
export const createDiceRoll = (
  diceType: DiceType,
  numberOfDice: number,
  modifier: number,
  mode: RollMode,
  description?: string
): DiceRoll => {
  const sides = parseInt(diceType.substring(1));
  const results: number[] = [];

  if (mode === "advantage" || mode === "disadvantage") {
    // Roll twice for advantage/disadvantage
    const roll1 = rollDice(sides);
    const roll2 = rollDice(sides);
    results.push(roll1, roll2);
  } else {
    // Normal rolls
    for (let i = 0; i < numberOfDice; i++) {
      results.push(rollDice(sides));
    }
  }

  let total = 0;
  if (mode === "advantage") {
    total = Math.max(...results) + modifier;
  } else if (mode === "disadvantage") {
    total = Math.min(...results) + modifier;
  } else {
    total = results.reduce((sum, val) => sum + val, 0) + modifier;
  }

  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    diceType,
    numberOfDice,
    modifier,
    mode,
    results,
    total,
    description,
  };
};

/**
 * Formats a dice roll result into a human-readable string.
 * Produces output like "2d6+3: [4, 5] = 12" or "1d20 (Advantage): [8, 15] → 15+2 = 17".
 *
 * @param roll - The DiceRoll object to format
 * @returns A formatted string showing the roll notation, individual results, and total
 *
 * @example
 * const roll = createDiceRoll("d20", 1, 5, "normal");
 * formatRollResult(roll); // "1d20+5: 15 = 20"
 */
export const formatRollResult = (roll: DiceRoll): string => {
  const { diceType, numberOfDice, modifier, mode, results, total } = roll;

  let modeText = "";
  if (mode === "advantage") modeText = " (Advantage)";
  if (mode === "disadvantage") modeText = " (Disadvantage)";

  const modifierText = modifier !== 0 ? ` ${modifier >= 0 ? "+" : ""}${modifier}` : "";
  const rollText = `${numberOfDice}${diceType}${modifierText}${modeText}`;

  let resultsText = "";
  if (mode === "advantage" || mode === "disadvantage") {
    resultsText = `[${results.join(", ")}] → ${mode === "advantage" ? Math.max(...results) : Math.min(...results)}`;
  } else {
    resultsText = results.length > 1 ? `[${results.join(", ")}]` : `${results[0]}`;
  }

  return `${rollText}: ${resultsText}${modifierText} = ${total}`;
};
