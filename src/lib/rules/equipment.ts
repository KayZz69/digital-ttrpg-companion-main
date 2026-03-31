/**
 * @fileoverview Full equipment rules implementation for D&D 5e 2024 PHB.
 *
 * Provides structured starting equipment packages for all 12 core classes
 * and equipment grants for all 13 backgrounds from the 2024 Player's Handbook.
 *
 * @see 2024 PHB — "Starting Equipment" (each class section, Chapter 7)
 * @see 2024 PHB — Backgrounds (Chapter 4)
 */

import type { BackgroundEquipmentRule, EquipmentPackageItem, EquipmentRule } from "./RulesRegistry";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Equipment registry providing starting equipment lookups for classes
 * and backgrounds.
 */
export interface EquipmentRegistry {
  /** Returns starting equipment rules for a class. */
  getEquipmentRules(classId: string): EquipmentRule | null;
  /** Returns starting equipment rules for a background. */
  getBackgroundEquipmentRules(backgroundId: string): BackgroundEquipmentRule | null;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Shorthand for creating an EquipmentPackageItem. */
function item(itemName: string, quantity?: number): EquipmentPackageItem {
  return quantity != null ? { itemName, quantity } : { itemName };
}

// ---------------------------------------------------------------------------
// Class equipment data
// ---------------------------------------------------------------------------

/**
 * Starting equipment packages per class.
 *
 * @see 2024 PHB — "Starting Equipment" in each class section
 * @see src/data/startingEquipment.ts — authoritative item names and quantities
 */
const CLASS_EQUIPMENT: Readonly<Record<string, EquipmentRule>> = {
  barbarian: {
    classId: "barbarian",
    packages: [
      {
        id: "barbarian-a",
        label: "Package A",
        items: [
          item("Greataxe"),
          item("Handaxe", 2),
          item("Explorer's Pack"),
          item("Javelin", 4),
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
        items: [
          item("Rapier"),
          item("Dagger"),
          item("Leather Armor"),
          item("Entertainer's Pack"),
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
        items: [
          item("Mace"),
          item("Chain Mail"),
          item("Amulet"),
          item("Priest's Pack"),
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
        items: [
          item("Quarterstaff"),
          item("Hide Armor"),
          item("Explorer's Pack"),
          item("Dagger"),
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
        items: [
          item("Chain Mail"),
          item("Longsword"),
          item("Light Crossbow"),
          item("Dungeoneer's Pack"),
        ],
      },
      {
        id: "fighter-b",
        label: "Package B (Ranged)",
        items: [
          item("Studded Leather Armor"),
          item("Longbow"),
          item("Shortsword", 2),
          item("Explorer's Pack"),
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
        items: [
          item("Shortsword"),
          item("Dungeoneer's Pack"),
          item("Dart", 10),
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
        items: [
          item("Chain Mail"),
          item("Longsword"),
          item("Javelin", 5),
          item("Priest's Pack"),
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
        items: [
          item("Studded Leather Armor"),
          item("Longbow"),
          item("Shortsword", 2),
          item("Explorer's Pack"),
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
        items: [
          item("Rapier"),
          item("Shortbow"),
          item("Leather Armor"),
          item("Burglar's Pack"),
          item("Thieves' Tools"),
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
        items: [
          item("Light Crossbow"),
          item("Dagger", 2),
          item("Component Pouch"),
          item("Explorer's Pack"),
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
        items: [
          item("Light Crossbow"),
          item("Leather Armor"),
          item("Component Pouch"),
          item("Scholar's Pack"),
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
        items: [
          item("Quarterstaff"),
          item("Spellbook"),
          item("Component Pouch"),
          item("Scholar's Pack"),
        ],
      },
    ],
    startingGoldGP: 75,
  },
};

// ---------------------------------------------------------------------------
// Background equipment data
// ---------------------------------------------------------------------------

/**
 * Starting equipment granted by each background.
 *
 * @see 2024 PHB — Backgrounds (Chapter 4)
 */
const BACKGROUND_EQUIPMENT: Readonly<Record<string, BackgroundEquipmentRule>> = {
  acolyte: {
    backgroundId: "acolyte",
    items: [
      item("Holy Symbol"),
      item("Prayer Book"),
      item("Vestments"),
    ],
    startingGoldGP: 8,
  },
  charlatan: {
    backgroundId: "charlatan",
    items: [
      item("Disguise Kit"),
      item("Forgery Kit"),
      item("Fine Clothes"),
    ],
    startingGoldGP: 15,
  },
  criminal: {
    backgroundId: "criminal",
    items: [
      item("Crowbar"),
      item("Dark Clothes"),
      item("Thieves' Tools"),
    ],
    startingGoldGP: 15,
  },
  entertainer: {
    backgroundId: "entertainer",
    items: [
      item("Musical Instrument"),
      item("Costume Clothes"),
    ],
    startingGoldGP: 11,
  },
  "folk-hero": {
    backgroundId: "folk-hero",
    items: [
      item("Artisan's Tools"),
      item("Shovel"),
      item("Iron Pot"),
      item("Common Clothes"),
    ],
    startingGoldGP: 10,
  },
  "guild-artisan": {
    backgroundId: "guild-artisan",
    items: [
      item("Artisan's Tools"),
      item("Letter of Introduction"),
      item("Traveler's Clothes"),
    ],
    startingGoldGP: 15,
  },
  hermit: {
    backgroundId: "hermit",
    items: [
      item("Herbalism Kit"),
      item("Blanket"),
      item("Scroll Case"),
      item("Winter Blanket"),
    ],
    startingGoldGP: 5,
  },
  noble: {
    backgroundId: "noble",
    items: [
      item("Signet Ring"),
      item("Fine Clothes"),
      item("Scroll of Pedigree"),
    ],
    startingGoldGP: 25,
  },
  outlander: {
    backgroundId: "outlander",
    items: [
      item("Staff"),
      item("Traveler's Clothes"),
      item("Hunting Trap"),
      item("Trophy"),
    ],
    startingGoldGP: 10,
  },
  sage: {
    backgroundId: "sage",
    items: [
      item("Ink"),
      item("Parchment", 5),
      item("Book"),
      item("Robes"),
    ],
    startingGoldGP: 10,
  },
  sailor: {
    backgroundId: "sailor",
    items: [
      item("Belaying Pin"),
      item("Rope (50 ft)"),
      item("Common Clothes"),
    ],
    startingGoldGP: 10,
  },
  soldier: {
    backgroundId: "soldier",
    items: [
      item("Insignia of Rank"),
      item("Trophy"),
      item("Dice Set"),
      item("Common Clothes"),
    ],
    startingGoldGP: 10,
  },
  urchin: {
    backgroundId: "urchin",
    items: [
      item("Small Knife"),
      item("Map of Home City"),
      item("Pet Mouse"),
      item("Common Clothes"),
    ],
    startingGoldGP: 10,
  },
};

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
      return CLASS_EQUIPMENT[classId.trim().toLowerCase()] ?? null;
    },
    getBackgroundEquipmentRules(backgroundId: string): BackgroundEquipmentRule | null {
      return BACKGROUND_EQUIPMENT[backgroundId.trim().toLowerCase()] ?? null;
    },
  };
}

/**
 * Singleton equipment registry instance.
 * Consumed by getRules() in spells.ts to delegate getEquipmentRules.
 */
export const equipment: EquipmentRegistry = getEquipmentRegistry();
