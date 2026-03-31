/**
 * @fileoverview Equipment rules for D&D 5e 2024.
 *
 * Implements CCR-008: Equipment Rules Foundation.
 * Provides real equipment rules with proper compendium item references
 * for all 12 core classes.
 *
 * @see ROADMAP.md — CCR-008: Equipment rules foundation
 * @see 2024 PHB — "Starting Equipment" (each class section, Chapter 7)
 */

import type { EquipmentRule, PackageItem } from "./RulesRegistry";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Equipment registry interface.
 * Provides equipment rule lookups and helper functions.
 */
export interface EquipmentRegistry {
  /**
   * Returns starting equipment rules for a class.
   * Returns null for unknown classes.
   */
  getEquipmentRules(classId: string): EquipmentRule | null;
}

// ---------------------------------------------------------------------------
// Helper: PackageItem factory
// ---------------------------------------------------------------------------

function pi(itemId: string, itemName: string, quantity: number = 1): PackageItem {
  return { itemId, itemName, quantity };
}

// ---------------------------------------------------------------------------
// Equipment rules data
// ---------------------------------------------------------------------------

/**
 * Starting equipment rules per class with structured item references.
 * Items reference compendium equipment IDs from src/data/equipment.ts.
 *
 * @see 2024 PHB — "Starting Equipment" in each class section
 */
const EQUIPMENT_RULES: Readonly<Record<string, EquipmentRule>> = {
  barbarian: {
    classId: "barbarian",
    packages: [
      {
        id: "barbarian-a",
        label: "Package A",
        items: ["Greataxe", "4 Handaxes", "Explorer's Pack", "15 GP"],
        packageItems: [
          pi("greataxe", "Greataxe"),
          pi("handaxe", "Handaxe", 4),
          pi("explorers-pack-g", "Explorer's Pack"),
        ],
      },
    ],
    startingGoldGP: 75,
  },
  bard: {
    classId: "bard",
    packages: [
      {
        id: "bard-a",
        label: "Package A",
        items: ["Rapier", "Diplomat's Pack", "Leather Armor", "Dagger"],
        packageItems: [
          pi("rapier", "Rapier"),
          pi("diplomats-pack-g", "Diplomat's Pack"),
          pi("leather-armor", "Leather Armor"),
          pi("dagger", "Dagger"),
        ],
      },
    ],
    startingGoldGP: 125,
  },
  cleric: {
    classId: "cleric",
    packages: [
      {
        id: "cleric-a",
        label: "Package A",
        items: ["Mace", "Scale Mail", "Light Crossbow", "Priest's Pack", "Amulet"],
        packageItems: [
          pi("mace", "Mace"),
          pi("scale-mail", "Scale Mail"),
          pi("light-crossbow", "Light Crossbow"),
          pi("priests-pack-g", "Priest's Pack"),
          pi("amulet-scf", "Amulet"),
        ],
      },
    ],
    startingGoldGP: 125,
  },
  druid: {
    classId: "druid",
    packages: [
      {
        id: "druid-a",
        label: "Package A",
        items: ["Quarterstaff", "Hide Armor", "Explorer's Pack", "Sprig of Mistletoe"],
        packageItems: [
          pi("quarterstaff", "Quarterstaff"),
          pi("hide-armor", "Hide Armor"),
          pi("explorers-pack-g", "Explorer's Pack"),
          pi("sprig-of-mistletoe-scf", "Sprig of Mistletoe"),
        ],
      },
    ],
    startingGoldGP: 50,
  },
  fighter: {
    classId: "fighter",
    packages: [
      {
        id: "fighter-a",
        label: "Package A (Martial)",
        items: ["Chain Mail", "Longsword", "Light Crossbow", "Dungeoneer's Pack"],
        packageItems: [
          pi("chain-mail", "Chain Mail"),
          pi("longsword", "Longsword"),
          pi("light-crossbow", "Light Crossbow"),
          pi("dungeoneers-pack-g", "Dungeoneer's Pack"),
        ],
      },
      {
        id: "fighter-b",
        label: "Package B (Ranged)",
        items: ["Leather Armor", "Longbow", "Two Handaxes", "Dungeoneer's Pack"],
        packageItems: [
          pi("leather-armor", "Leather Armor"),
          pi("longbow", "Longbow"),
          pi("handaxe", "Handaxe", 2),
          pi("dungeoneers-pack-g", "Dungeoneer's Pack"),
        ],
      },
    ],
    startingGoldGP: 175,
  },
  monk: {
    classId: "monk",
    packages: [
      {
        id: "monk-a",
        label: "Package A",
        items: ["Shortsword", "Dungeoneer's Pack", "10 Darts"],
        packageItems: [
          pi("shortsword", "Shortsword"),
          pi("dungeoneers-pack-g", "Dungeoneer's Pack"),
          pi("dart", "Dart", 10),
        ],
      },
    ],
    startingGoldGP: 12,
  },
  paladin: {
    classId: "paladin",
    packages: [
      {
        id: "paladin-a",
        label: "Package A",
        items: ["Chain Mail", "Longsword", "5 Javelins", "Priest's Pack", "Emblem"],
        packageItems: [
          pi("chain-mail", "Chain Mail"),
          pi("longsword", "Longsword"),
          pi("javelin", "Javelin", 5),
          pi("priests-pack-g", "Priest's Pack"),
          pi("emblem-scf", "Emblem"),
        ],
      },
    ],
    startingGoldGP: 175,
  },
  ranger: {
    classId: "ranger",
    packages: [
      {
        id: "ranger-a",
        label: "Package A",
        items: ["Scale Mail", "Two Shortswords", "Dungeoneer's Pack", "Longbow"],
        packageItems: [
          pi("scale-mail", "Scale Mail"),
          pi("shortsword", "Shortsword", 2),
          pi("dungeoneers-pack-g", "Dungeoneer's Pack"),
          pi("longbow", "Longbow"),
        ],
      },
    ],
    startingGoldGP: 125,
  },
  rogue: {
    classId: "rogue",
    packages: [
      {
        id: "rogue-a",
        label: "Package A",
        items: ["Rapier", "Shortbow", "Burglar's Pack", "Leather Armor", "Two Daggers", "Thieves' Tools"],
        packageItems: [
          pi("rapier", "Rapier"),
          pi("shortbow", "Shortbow"),
          pi("burglars-pack-g", "Burglar's Pack"),
          pi("leather-armor", "Leather Armor"),
          pi("dagger", "Dagger", 2),
          pi("thieves-tools-t", "Thieves' Tools"),
        ],
      },
    ],
    startingGoldGP: 100,
  },
  sorcerer: {
    classId: "sorcerer",
    packages: [
      {
        id: "sorcerer-a",
        label: "Package A",
        items: ["Light Crossbow", "Component Pouch", "Dungeoneer's Pack", "Two Daggers"],
        packageItems: [
          pi("light-crossbow", "Light Crossbow"),
          pi("component-pouch-g", "Component Pouch"),
          pi("dungeoneers-pack-g", "Dungeoneer's Pack"),
          pi("dagger", "Dagger", 2),
        ],
      },
    ],
    startingGoldGP: 75,
  },
  warlock: {
    classId: "warlock",
    packages: [
      {
        id: "warlock-a",
        label: "Package A",
        items: ["Light Crossbow", "Component Pouch", "Scholar's Pack", "Leather Armor", "Two Daggers"],
        packageItems: [
          pi("light-crossbow", "Light Crossbow"),
          pi("component-pouch-g", "Component Pouch"),
          pi("scholars-pack-g", "Scholar's Pack"),
          pi("leather-armor", "Leather Armor"),
          pi("dagger", "Dagger", 2),
        ],
      },
    ],
    startingGoldGP: 100,
  },
  wizard: {
    classId: "wizard",
    packages: [
      {
        id: "wizard-a",
        label: "Package A",
        items: ["Quarterstaff", "Component Pouch", "Scholar's Pack", "Spellbook"],
        packageItems: [
          pi("quarterstaff", "Quarterstaff"),
          pi("component-pouch-g", "Component Pouch"),
          pi("scholars-pack-g", "Scholar's Pack"),
          pi("spellbook-g", "Spellbook"),
        ],
      },
    ],
    startingGoldGP: 75,
  },
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Returns the structured package items for a specific class package.
 *
 * @param classId   — lowercase class identifier (e.g. "fighter")
 * @param packageId — package identifier (e.g. "fighter-a")
 * @returns Array of PackageItem, or empty array if not found
 * @pure
 */
export function getEquipmentPackageItems(classId: string, packageId: string): ReadonlyArray<PackageItem> {
  const rule = EQUIPMENT_RULES[classId.trim().toLowerCase()];
  if (!rule) {
    return [];
  }
  const pkg = rule.packages.find((p) => p.id === packageId);
  return pkg?.packageItems ?? [];
}

/**
 * Returns package items ready for inventory creation.
 * This is a convenience alias — returns the same data as getEquipmentPackageItems
 * but as a mutable array for downstream consumers to map into InventoryItems.
 *
 * @param classId   — lowercase class identifier
 * @param packageId — package identifier
 * @returns Mutable array of PackageItem descriptors
 * @pure
 */
export function resolvePackageToInventory(
  classId: string,
  packageId: string,
): PackageItem[] {
  return [...getEquipmentPackageItems(classId, packageId)];
}

/**
 * Validates whether a total equipment cost is within a class's gold budget.
 *
 * @param classId    — lowercase class identifier
 * @param totalCostGp — total cost in gold pieces
 * @returns true if within budget, false if over budget or class not found
 * @pure
 */
export function validateEquipmentBudget(classId: string, totalCostGp: number): boolean {
  const rule = EQUIPMENT_RULES[classId.trim().toLowerCase()];
  if (!rule) {
    return false;
  }
  return totalCostGp <= rule.startingGoldGP;
}

// ---------------------------------------------------------------------------
// Registry factory
// ---------------------------------------------------------------------------

/**
 * Returns the equipment rules registry.
 *
 * @pure
 */
export function getEquipmentRegistry(): EquipmentRegistry {
  return {
    getEquipmentRules(classId: string): EquipmentRule | null {
      return EQUIPMENT_RULES[classId.trim().toLowerCase()] ?? null;
    },
  };
}

/**
 * Singleton equipment registry instance.
 * Consumed by getRules() in spells.ts to delegate getEquipmentRules.
 */
export const equipment: EquipmentRegistry = getEquipmentRegistry();
