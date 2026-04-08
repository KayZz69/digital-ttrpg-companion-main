/**
 * @fileoverview Armor Class computation for D&D 5e characters.
 * Parses armor AC strings from compendium data and computes effective AC
 * based on equipped armor, shields, and ability scores.
 */

import { InventoryItem, DnD5eAbilityScores } from "@/types/character";
import { getAllArmor } from "@/data";
import type { Armor } from "@/data/types";

export interface ParsedArmorClass {
  /** Base AC number from the armor */
  base: number;
  /** Whether Dex modifier is added */
  addsDex: boolean;
  /** Maximum Dex modifier allowed (null = unlimited) */
  maxDex: number | null;
}

export interface ACBreakdown {
  /** Final computed AC value */
  total: number;
  /** Base AC source description (e.g., "Chain Mail (16)") */
  baseSource: string;
  /** Dex modifier applied (if any) */
  dexBonus: number;
  /** Shield bonus applied */
  shieldBonus: number;
  /** Whether stealth disadvantage applies */
  stealthDisadvantage: boolean;
}

/**
 * Parse an armor class string from compendium data into structured values.
 *
 * Known patterns:
 * - "16" (heavy armor, flat AC)
 * - "11 + Dex modifier" (light armor, full Dex)
 * - "14 + Dex modifier (max 2)" (medium armor, capped Dex)
 */
export function parseArmorClass(acString: string): ParsedArmorClass {
  const trimmed = acString.trim();

  // Pattern: "N + Dex modifier (max M)"
  const maxDexMatch = trimmed.match(/^(\d+)\s*\+\s*Dex\s+modifier\s*\(max\s+(\d+)\)/i);
  if (maxDexMatch) {
    return {
      base: parseInt(maxDexMatch[1], 10),
      addsDex: true,
      maxDex: parseInt(maxDexMatch[2], 10),
    };
  }

  // Pattern: "N + Dex modifier"
  const dexMatch = trimmed.match(/^(\d+)\s*\+\s*Dex\s+modifier/i);
  if (dexMatch) {
    return {
      base: parseInt(dexMatch[1], 10),
      addsDex: true,
      maxDex: null,
    };
  }

  // Pattern: flat number "N"
  const flatMatch = trimmed.match(/^(\d+)$/);
  if (flatMatch) {
    return {
      base: parseInt(flatMatch[1], 10),
      addsDex: false,
      maxDex: null,
    };
  }

  // Fallback: treat as base 10 (unarmored)
  return { base: 10, addsDex: true, maxDex: null };
}

/**
 * Look up armor compendium data by sourceItemId.
 */
function findArmorById(sourceItemId: string): Armor | undefined {
  return getAllArmor().find((a) => a.id === sourceItemId);
}

/**
 * Compute the character's effective Armor Class from equipped inventory items.
 *
 * Rules:
 * - No armor equipped: AC = 10 + Dex modifier (unarmored defense)
 * - Armor equipped: parsed from armor's armorClass string
 * - Shield equipped (offHand slot, sourceItemType "armor" with category "shield",
 *   or item named "Shield"): +2 AC
 */
export function computeArmorClass(
  inventory: InventoryItem[],
  abilityScores: DnD5eAbilityScores
): ACBreakdown {
  const dexMod = Math.floor((abilityScores.dexterity - 10) / 2);
  const equippedItems = inventory.filter((item) => item.equipped);

  // Find equipped armor (slot = "armor" or compendium armor that isn't a shield)
  let armorItem: InventoryItem | undefined;
  let armorData: Armor | undefined;

  for (const item of equippedItems) {
    if (item.equipmentSlot === "armor" && item.sourceItemId && item.sourceItemType === "armor") {
      const data = findArmorById(item.sourceItemId);
      if (data && data.category !== "shield") {
        armorItem = item;
        armorData = data;
        break;
      }
    }
    // Also check for armor-slot items without compendium link
    if (item.equipmentSlot === "armor" && !armorItem) {
      armorItem = item;
    }
  }

  // Find equipped shield
  let shieldBonus = 0;
  for (const item of equippedItems) {
    const isShield =
      item.name.toLowerCase() === "shield" ||
      (item.sourceItemId && item.sourceItemType === "armor" &&
        findArmorById(item.sourceItemId)?.category === "shield");
    if (isShield) {
      shieldBonus = 2;
      break;
    }
  }

  // Compute base AC
  let baseAC: number;
  let baseSource: string;
  let dexBonus: number;
  let stealthDisadvantage = false;

  if (armorData) {
    const parsed = parseArmorClass(armorData.armorClass);
    baseAC = parsed.base;
    if (parsed.addsDex) {
      dexBonus = parsed.maxDex !== null ? Math.min(dexMod, parsed.maxDex) : dexMod;
    } else {
      dexBonus = 0;
    }
    baseSource = armorData.name;
    stealthDisadvantage = armorData.stealthDisadvantage ?? false;
  } else if (armorItem) {
    // Non-compendium armor in armor slot — use flat 10 + Dex as fallback
    baseAC = 10;
    dexBonus = dexMod;
    baseSource = armorItem.name;
  } else {
    // Unarmored
    baseAC = 10;
    dexBonus = dexMod;
    baseSource = "Unarmored";
  }

  return {
    total: baseAC + dexBonus + shieldBonus,
    baseSource,
    dexBonus,
    shieldBonus,
    stealthDisadvantage,
  };
}
