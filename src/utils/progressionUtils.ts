/**
 * @fileoverview D&D 5e Character Progression Utilities
 * Handles XP thresholds, level-up calculations, HP gain, and ASI detection.
 */

import { type ClassFeature } from "@/data/types";
import { type DnD5eAbilityScores } from "@/types/character";
import { getClassHitDie } from "@/lib/dndCompendium";

// XP required to reach each level (index 0 = level 1, index 19 = level 20)
export const XP_THRESHOLDS: readonly number[] = [
  0,       // Level 1
  300,     // Level 2
  900,     // Level 3
  2700,    // Level 4
  6500,    // Level 5
  14000,   // Level 6
  23000,   // Level 7
  34000,   // Level 8
  48000,   // Level 9
  64000,   // Level 10
  85000,   // Level 11
  100000,  // Level 12
  120000,  // Level 13
  140000,  // Level 14
  165000,  // Level 15
  195000,  // Level 16
  225000,  // Level 17
  265000,  // Level 18
  305000,  // Level 19
  355000,  // Level 20
];

export const MAX_LEVEL = 20;

/**
 * Returns the character level for a given XP total.
 * Always returns a value between 1 and 20.
 */
export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

/**
 * Returns the total XP required to reach the given level.
 * Clamps between level 1 and 20.
 */
export function getXPForLevel(level: number): number {
  const clamped = Math.min(Math.max(level, 1), MAX_LEVEL);
  return XP_THRESHOLDS[clamped - 1];
}

/**
 * Returns XP progress within the current level and total XP needed for the next level.
 * At level 20, returns { current: xp, total: xp, percentage: 100 }.
 */
export function getXPProgress(xp: number): {
  level: number;
  current: number;
  total: number;
  percentage: number;
  xpToNext: number;
} {
  const level = getLevelFromXP(xp);
  if (level >= MAX_LEVEL) {
    return { level, current: xp, total: xp, percentage: 100, xpToNext: 0 };
  }
  const levelStart = XP_THRESHOLDS[level - 1];
  const levelEnd = XP_THRESHOLDS[level];
  const current = xp - levelStart;
  const total = levelEnd - levelStart;
  const percentage = Math.min(100, Math.floor((current / total) * 100));
  const xpToNext = Math.max(0, levelEnd - xp);
  return { level, current, total, percentage, xpToNext };
}

/**
 * Returns whether a character has enough XP to advance to the next level.
 */
export function canLevelUp(currentLevel: number, xp: number): boolean {
  if (currentLevel >= MAX_LEVEL) return false;
  return xp >= XP_THRESHOLDS[currentLevel]; // index = next level - 1
}

/**
 * Returns the average HP gain on level-up (floor of half hit die + 1) plus CON modifier.
 * Minimum of 1.
 */
export function getAverageHPGain(hitDie: number, conMod: number): number {
  return Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);
}

/**
 * Simulates rolling a hit die for HP on level-up, adding CON modifier.
 * Minimum of 1.
 */
export function rollHPGain(hitDie: number, conMod: number): number {
  const roll = Math.floor(Math.random() * hitDie) + 1;
  return Math.max(1, roll + conMod);
}

/**
 * Returns the total hit dice pool for a character (one per level).
 */
export function getHitDiceMax(level: number): number {
  return Math.max(1, level);
}

/**
 * Extracts levels that grant Ability Score Improvements from a class's feature list.
 */
export function getASILevelsFromFeatures(features: ClassFeature[]): number[] {
  const asiLevels: number[] = [];
  for (const feature of features) {
    if (feature.name === "Ability Score Improvement") {
      if (!asiLevels.includes(feature.level)) {
        asiLevels.push(feature.level);
      }
    }
  }
  return asiLevels.sort((a, b) => a - b);
}

/**
 * Returns true if leveling to `newLevel` grants an ASI for the given class features.
 */
export function isASILevel(features: ClassFeature[], newLevel: number): boolean {
  return features.some(
    (f) => f.name === "Ability Score Improvement" && f.level === newLevel
  );
}

/**
 * Returns all class features gained at exactly the given level.
 */
export function getNewFeaturesAtLevel(features: ClassFeature[], level: number): ClassFeature[] {
  return features.filter((f) => f.level === level);
}

/**
 * Calculates the new max HP after leveling up.
 */
export function getNewMaxHP(
  currentMaxHP: number,
  className: string,
  conMod: number,
  useAverage: boolean
): { newMaxHP: number; hpGained: number } {
  const hitDie = getClassHitDie(className);
  const hpGained = useAverage
    ? getAverageHPGain(hitDie, conMod)
    : rollHPGain(hitDie, conMod);
  return { newMaxHP: currentMaxHP + hpGained, hpGained };
}

/**
 * Applies an ASI choice to ability scores.
 * mode "single": add 2 to one ability (max 20)
 * mode "split": add 1 to each of two abilities (max 20)
 */
export function applyASI(
  scores: DnD5eAbilityScores,
  choice: { mode: "single"; ability: keyof DnD5eAbilityScores } | { mode: "split"; ability1: keyof DnD5eAbilityScores; ability2: keyof DnD5eAbilityScores }
): DnD5eAbilityScores {
  const updated = { ...scores };
  if (choice.mode === "single") {
    updated[choice.ability] = Math.min(20, updated[choice.ability] + 2);
  } else {
    updated[choice.ability1] = Math.min(20, updated[choice.ability1] + 1);
    updated[choice.ability2] = Math.min(20, updated[choice.ability2] + 1);
  }
  return updated;
}
