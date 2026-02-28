/**
 * @fileoverview Pure combat math utility functions for D&D 5e.
 * Handles attack rolls, damage rolls, saving throws, and concentration checks.
 */

import { rollDice } from "@/utils/diceUtils";
import { getAbilityModifier } from "@/lib/dndRules";
import { getWeaponById } from "@/data/equipment";
import type { DnD5eAbilityScores, InventoryItem } from "@/types/character";
import type { EquippedWeaponStats } from "@/types/combat";

//  Result interfaces 

export interface D20Result {
  /** The final d20 result (highest for advantage, lowest for disadvantage) */
  roll: number;
  /** Whether advantage was applied */
  hadAdvantage: boolean;
  /** Whether disadvantage was applied */
  hadDisadvantage: boolean;
  /** Both rolls when advantage or disadvantage was used */
  allRolls?: [number, number];
}

export interface AttackRollResult {
  d20: D20Result;
  attackBonus: number;
  total: number;
  isCrit: boolean;
  isFumble: boolean;
}

export interface DamageRollBreakdown {
  /** Individual die results */
  dice: number[];
  /** Additional dice from a critical hit (same count as dice) */
  critDice: number[];
  /** Total flat bonus (ability mod + magic bonus) */
  bonus: number;
  /** Total damage */
  total: number;
  /** The dice expression that was rolled */
  diceExpression: string;
  damageType: string;
}

export interface ParsedDice {
  count: number;
  sides: number;
  bonus: number;
}

export interface SavingThrowResult {
  roll: number;
  bonus: number;
  total: number;
  dc: number;
  success: boolean;
}

//  Core d20 logic 

/**
 * Roll a d20 with optional advantage or disadvantage.
 * If both are set they cancel out (5e rule).
 */
export function rollD20(advantage = false, disadvantage = false): D20Result {
  const hasAdvantage = advantage && !disadvantage;
  const hasDisadvantage = disadvantage && !advantage;

  if (hasAdvantage || hasDisadvantage) {
    const r1 = rollDice(20);
    const r2 = rollDice(20);
    const roll = hasAdvantage ? Math.max(r1, r2) : Math.min(r1, r2);
    return { roll, hadAdvantage: hasAdvantage, hadDisadvantage: hasDisadvantage, allRolls: [r1, r2] };
  }

  return { roll: rollDice(20), hadAdvantage: false, hadDisadvantage: false };
}

//  Dice expression parsing 

/**
 * Parse a dice expression like "2d6", "1d8+3", "1d4-1".
 * Returns count=0, sides=0, bonus=N for flat numbers (e.g., "1" for a blowgun).
 */
export function parseDiceExpression(expr: string): ParsedDice {
  const normalized = expr.trim().toLowerCase().replace(/\s/g, "");
  const match = normalized.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) {
    const flat = parseInt(normalized, 10);
    return { count: 0, sides: 0, bonus: isNaN(flat) ? 0 : flat };
  }
  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    bonus: match[3] ? parseInt(match[3], 10) : 0,
  };
}

//  Attack rolls 

/** Calculate total attack bonus: ability mod + proficiency + magic weapon bonus. */
export function calcAttackBonus(abilityMod: number, profBonus: number, magicBonus = 0): number {
  return abilityMod + profBonus + magicBonus;
}

/** Roll an attack: d20 + attackBonus, with optional advantage/disadvantage. */
export function rollAttack(
  attackBonus: number,
  advantage = false,
  disadvantage = false
): AttackRollResult {
  const d20 = rollD20(advantage, disadvantage);
  return {
    d20,
    attackBonus,
    total: d20.roll + attackBonus,
    isCrit: d20.roll === 20,
    isFumble: d20.roll === 1,
  };
}

/**
 * Check whether an attack roll hits a target's AC.
 * Natural 20 always hits; natural 1 always misses.
 */
export function checkHit(result: AttackRollResult, targetAC: number): boolean {
  if (result.isCrit) return true;
  if (result.isFumble) return false;
  return result.total >= targetAC;
}

//  Damage rolls 

/**
 * Roll damage dice.
 * On a critical hit the dice are doubled (per 5e rules: extra dice, bonus is not doubled).
 */
export function rollDamage(
  diceExpr: string,
  bonus: number,
  isCrit: boolean,
  damageType = ""
): DamageRollBreakdown {
  const parsed = parseDiceExpression(diceExpr);

  if (parsed.count === 0) {
    // Flat damage (e.g., blowgun "1")
    return { dice: [], critDice: [], bonus: parsed.bonus + bonus, total: parsed.bonus + bonus, diceExpression: diceExpr, damageType };
  }

  const dice = Array.from({ length: parsed.count }, () => rollDice(parsed.sides));
  const critDice = isCrit ? Array.from({ length: parsed.count }, () => rollDice(parsed.sides)) : [];
  const totalBonus = parsed.bonus + bonus;
  const total = dice.reduce((s, n) => s + n, 0) + critDice.reduce((s, n) => s + n, 0) + totalBonus;

  return { dice, critDice, bonus: totalBonus, total, diceExpression: diceExpr, damageType };
}

//  Saving throws 

/** Calculate saving throw bonus: ability modifier + proficiency bonus (if proficient). */
export function calcSavingThrowBonus(
  abilityMod: number,
  profBonus: number,
  hasProficiency: boolean
): number {
  return abilityMod + (hasProficiency ? profBonus : 0);
}

/** Roll a d20 saving throw vs a DC. */
export function rollSavingThrow(
  dc: number,
  abilityMod: number,
  profBonus: number,
  hasProficiency: boolean
): SavingThrowResult {
  const roll = rollDice(20);
  const bonus = calcSavingThrowBonus(abilityMod, profBonus, hasProficiency);
  const total = roll + bonus;
  return { roll, bonus, total, dc, success: total >= dc };
}

//  Spellcasting 

/** Spell Save DC = 8 + proficiency bonus + spellcasting ability modifier. */
export function calcSpellSaveDC(profBonus: number, spellcastingMod: number): number {
  return 8 + profBonus + spellcastingMod;
}

/** Spell attack bonus = proficiency bonus + spellcasting ability modifier. */
export function calcSpellAttackBonus(profBonus: number, spellcastingMod: number): number {
  return profBonus + spellcastingMod;
}

//  Concentration 

/** Concentration check DC = max(10, floor(damageTaken / 2)). */
export function calcConcentrationDC(damageTaken: number): number {
  return Math.max(10, Math.floor(damageTaken / 2));
}

//  Weapon resolution 

function checkWeaponProficiency(
  proficiencies: string[],
  weaponCategory: string | undefined,
  weaponName: string
): boolean {
  const nameLower = weaponName.toLowerCase();
  return proficiencies.some((p) => {
    const lower = p.toLowerCase();
    if (lower === "simple weapons" && weaponCategory === "simple") return true;
    if (lower === "martial weapons" && (weaponCategory === "martial" || weaponCategory === "simple")) return true;
    return lower.includes(nameLower);
  });
}

/**
 * Resolve equipped weapon stats from a character's mainHand inventory item.
 * Returns null if no damage data is found (e.g., item is not a weapon).
 */
export function resolveWeaponStats(
  mainHandItem: InventoryItem,
  abilityScores: DnD5eAbilityScores,
  profBonus: number,
  weaponProficiencies: string[]
): EquippedWeaponStats | null {
  let damageDice = mainHandItem.damageDice ?? "";
  let damageType = mainHandItem.damageType ?? "";
  const magicBonus = mainHandItem.weaponAttackBonus ?? 0;
  let isFinesse = false;
  let isRanged = false;
  let weaponCategory: string | undefined;

  if (mainHandItem.sourceItemType === "weapon" && mainHandItem.sourceItemId) {
    const weapon = getWeaponById(mainHandItem.sourceItemId);
    if (weapon) {
      if (weapon.damage.dice) damageDice = weapon.damage.dice;
      if (weapon.damage.type) damageType = weapon.damage.type;
      isFinesse = weapon.properties.some((p) => p.toLowerCase().includes("finesse"));
      isRanged = weapon.weaponType === "ranged";
      weaponCategory = weapon.category;
    }
  }

  if (!damageDice) return null;

  const strMod = getAbilityModifier(abilityScores.strength);
  const dexMod = getAbilityModifier(abilityScores.dexterity);
  let abilityMod: number;
  if (isFinesse) {
    abilityMod = Math.max(strMod, dexMod);
  } else if (isRanged) {
    abilityMod = dexMod;
  } else {
    abilityMod = strMod;
  }

  const isProficient = checkWeaponProficiency(weaponProficiencies, weaponCategory, mainHandItem.name);

  return {
    name: mainHandItem.name,
    damageDice,
    damageType,
    attackBonus: abilityMod + (isProficient ? profBonus : 0) + magicBonus,
    damageBonus: abilityMod + magicBonus,
    isFinesse,
    isRanged,
  };
}
