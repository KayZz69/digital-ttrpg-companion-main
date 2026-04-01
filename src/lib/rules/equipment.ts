/**
 * @fileoverview Equipment rules for D&D 5e 2024.
 *
 * Provides structured starting-equipment data for all 12 core classes and
 * 13 backgrounds, plus gold-buy budgets for each class.
 *
 * Rules baseline: 2024 Player's Handbook (D&D 5e 2024)
 *
 * @see 2024 PHB — "Starting Equipment" (each class section, Chapter 3)
 * @see 2024 PHB — "Backgrounds" (Chapter 4)
 */

import type { EquipmentRule } from "./RulesRegistry";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/**
 * Equipment registry interface.
 * Provides lookups for class starting equipment and background equipment.
 */
export interface EquipmentRegistry {
  /** Returns starting equipment rules for a class, or null for unknown classes. */
  getEquipmentRules(classId: string): EquipmentRule | null;
  /** Returns background equipment items, or null for unknown backgrounds. */
  getBackgroundEquipment(backgroundId: string): BackgroundEquipment | null;
  /** Returns all supported class IDs. */
  getSupportedClassIds(): string[];
  /** Returns all supported background IDs. */
  getSupportedBackgroundIds(): string[];
}

/**
 * Equipment granted by a background.
 */
export interface BackgroundEquipment {
  readonly backgroundId: string;
  readonly label: string;
  readonly items: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Class starting equipment (2024 PHB)
// ---------------------------------------------------------------------------

/**
 * Starting equipment packages per class.
 * Each class has 1-2 curated packages reflecting 2024 PHB starting equipment.
 * Gold-buy budgets sourced from startingEquipment.ts STARTING_GOLD_BUDGETS.
 *
 * @see 2024 PHB — Chapter 3, each class "Starting Equipment" section
 */
const CLASS_EQUIPMENT: Readonly<Record<string, EquipmentRule>> = {
  barbarian: {
    classId: "barbarian",
    packages: [
      {
        id: "barbarian-a",
        label: "Greataxe and explorer's gear",
        items: ["Greataxe", "4 Javelins", "Explorer's Pack", "Handaxe", "Handaxe"],
      },
      {
        id: "barbarian-b",
        label: "Two-weapon fighting kit",
        items: ["Two Handaxes", "4 Javelins", "Explorer's Pack", "Greataxe"],
      },
    ],
    startingGoldGP: 20,
  },
  bard: {
    classId: "bard",
    packages: [
      {
        id: "bard-a",
        label: "Rapier and entertainer's gear",
        items: ["Rapier", "Dagger", "Leather Armor", "Entertainer's Pack", "Musical Instrument"],
      },
      {
        id: "bard-b",
        label: "Longsword and diplomat's gear",
        items: ["Longsword", "Dagger", "Leather Armor", "Diplomat's Pack", "Musical Instrument"],
      },
    ],
    startingGoldGP: 125,
  },
  cleric: {
    classId: "cleric",
    packages: [
      {
        id: "cleric-a",
        label: "Mace and priest's gear",
        items: ["Mace", "Chain Mail", "Holy Symbol", "Priest's Pack", "Shield"],
      },
      {
        id: "cleric-b",
        label: "Warhammer and explorer's gear",
        items: ["Warhammer", "Scale Mail", "Holy Symbol", "Explorer's Pack", "Shield", "Light Crossbow", "20 Bolts"],
      },
    ],
    startingGoldGP: 125,
  },
  druid: {
    classId: "druid",
    packages: [
      {
        id: "druid-a",
        label: "Staff and explorer's gear",
        items: ["Quarterstaff", "Hide Armor", "Explorer's Pack", "Druidic Focus", "Dagger"],
      },
      {
        id: "druid-b",
        label: "Scimitar and wooden shield",
        items: ["Scimitar", "Wooden Shield", "Leather Armor", "Explorer's Pack", "Druidic Focus"],
      },
    ],
    startingGoldGP: 50,
  },
  fighter: {
    classId: "fighter",
    packages: [
      {
        id: "fighter-a",
        label: "Martial frontliner kit",
        items: ["Chain Mail", "Longsword", "Shield", "Light Crossbow", "20 Bolts", "Dungeoneer's Pack"],
      },
      {
        id: "fighter-b",
        label: "Ranged combat kit",
        items: ["Leather Armor", "Longbow", "20 Arrows", "Two Handaxes", "Dungeoneer's Pack"],
      },
    ],
    startingGoldGP: 150,
  },
  monk: {
    classId: "monk",
    packages: [
      {
        id: "monk-a",
        label: "Simple monk kit",
        items: ["Shortsword", "Dungeoneer's Pack", "10 Darts"],
      },
      {
        id: "monk-b",
        label: "Spear and explorer's gear",
        items: ["Spear", "Explorer's Pack", "10 Darts"],
      },
    ],
    startingGoldGP: 15,
  },
  paladin: {
    classId: "paladin",
    packages: [
      {
        id: "paladin-a",
        label: "Paladin heavy kit",
        items: ["Chain Mail", "Longsword", "Shield", "5 Javelins", "Priest's Pack", "Holy Symbol"],
      },
      {
        id: "paladin-b",
        label: "Paladin two-handed kit",
        items: ["Chain Mail", "Greatsword", "5 Javelins", "Explorer's Pack", "Holy Symbol"],
      },
    ],
    startingGoldGP: 150,
  },
  ranger: {
    classId: "ranger",
    packages: [
      {
        id: "ranger-a",
        label: "Ranger scout kit",
        items: ["Studded Leather Armor", "Longbow", "20 Arrows", "Two Shortswords", "Explorer's Pack"],
      },
      {
        id: "ranger-b",
        label: "Ranger melee kit",
        items: ["Scale Mail", "Two Shortswords", "Dungeoneer's Pack", "Longbow", "20 Arrows"],
      },
    ],
    startingGoldGP: 100,
  },
  rogue: {
    classId: "rogue",
    packages: [
      {
        id: "rogue-a",
        label: "Rogue infiltration kit",
        items: ["Rapier", "Shortbow", "20 Arrows", "Burglar's Pack", "Leather Armor", "Two Daggers", "Thieves' Tools"],
      },
      {
        id: "rogue-b",
        label: "Rogue duelist kit",
        items: ["Shortsword", "Shortbow", "20 Arrows", "Explorer's Pack", "Leather Armor", "Two Daggers", "Thieves' Tools"],
      },
    ],
    startingGoldGP: 100,
  },
  sorcerer: {
    classId: "sorcerer",
    packages: [
      {
        id: "sorcerer-a",
        label: "Sorcerer arcane kit",
        items: ["Light Crossbow", "20 Bolts", "Component Pouch", "Explorer's Pack", "Two Daggers"],
      },
      {
        id: "sorcerer-b",
        label: "Sorcerer focus kit",
        items: ["Quarterstaff", "Arcane Focus", "Dungeoneer's Pack", "Two Daggers"],
      },
    ],
    startingGoldGP: 100,
  },
  warlock: {
    classId: "warlock",
    packages: [
      {
        id: "warlock-a",
        label: "Warlock pact kit",
        items: ["Light Crossbow", "20 Bolts", "Leather Armor", "Component Pouch", "Scholar's Pack", "Two Daggers"],
      },
      {
        id: "warlock-b",
        label: "Warlock arcane kit",
        items: ["Quarterstaff", "Arcane Focus", "Leather Armor", "Dungeoneer's Pack", "Two Daggers"],
      },
    ],
    startingGoldGP: 100,
  },
  wizard: {
    classId: "wizard",
    packages: [
      {
        id: "wizard-a",
        label: "Wizard scholar kit",
        items: ["Quarterstaff", "Arcane Focus", "Scholar's Pack", "Spellbook"],
      },
      {
        id: "wizard-b",
        label: "Wizard component kit",
        items: ["Dagger", "Component Pouch", "Explorer's Pack", "Spellbook"],
      },
    ],
    startingGoldGP: 100,
  },
};

// ---------------------------------------------------------------------------
// Background equipment (2024 PHB)
// ---------------------------------------------------------------------------

/**
 * Equipment granted by each background.
 * Includes tools and basic gear per 2024 PHB Chapter 4.
 *
 * @see 2024 PHB — "Backgrounds", Chapter 4
 */
const BACKGROUND_EQUIPMENT: Readonly<Record<string, BackgroundEquipment>> = {
  acolyte: {
    backgroundId: "acolyte",
    label: "Acolyte equipment",
    items: ["Holy Symbol", "Prayer Book", "5 Sticks of Incense", "Vestments", "Common Clothes", "Belt Pouch with 15 GP"],
  },
  charlatan: {
    backgroundId: "charlatan",
    label: "Charlatan equipment",
    items: ["Fine Clothes", "Disguise Kit", "Con Tools (weighted dice, marked cards)", "Belt Pouch with 15 GP"],
  },
  criminal: {
    backgroundId: "criminal",
    label: "Criminal equipment",
    items: ["Crowbar", "Dark Common Clothes with Hood", "Thieves' Tools", "Belt Pouch with 15 GP"],
  },
  entertainer: {
    backgroundId: "entertainer",
    label: "Entertainer equipment",
    items: ["Musical Instrument", "Costume Clothes", "Favor of an Admirer", "Belt Pouch with 15 GP"],
  },
  "folk-hero": {
    backgroundId: "folk-hero",
    label: "Folk Hero equipment",
    items: ["Artisan's Tools", "Shovel", "Iron Pot", "Common Clothes", "Belt Pouch with 10 GP"],
  },
  "guild-artisan": {
    backgroundId: "guild-artisan",
    label: "Guild Artisan equipment",
    items: ["Artisan's Tools", "Letter of Introduction from Guild", "Traveler's Clothes", "Belt Pouch with 15 GP"],
  },
  hermit: {
    backgroundId: "hermit",
    label: "Hermit equipment",
    items: ["Herbalism Kit", "Scroll Case with Notes", "Winter Blanket", "Common Clothes", "Belt Pouch with 5 GP"],
  },
  noble: {
    backgroundId: "noble",
    label: "Noble equipment",
    items: ["Fine Clothes", "Signet Ring", "Scroll of Pedigree", "Belt Pouch with 25 GP"],
  },
  outlander: {
    backgroundId: "outlander",
    label: "Outlander equipment",
    items: ["Staff", "Hunting Trap", "Trophy from Animal", "Traveler's Clothes", "Belt Pouch with 10 GP"],
  },
  sage: {
    backgroundId: "sage",
    label: "Sage equipment",
    items: ["Ink and Quill", "Small Knife", "Letter from Colleague", "Common Clothes", "Belt Pouch with 10 GP"],
  },
  sailor: {
    backgroundId: "sailor",
    label: "Sailor equipment",
    items: ["Belaying Pin (club)", "50 Feet of Silk Rope", "Lucky Charm", "Common Clothes", "Belt Pouch with 10 GP"],
  },
  soldier: {
    backgroundId: "soldier",
    label: "Soldier equipment",
    items: ["Insignia of Rank", "Trophy from Fallen Enemy", "Bone Dice or Deck of Cards", "Common Clothes", "Belt Pouch with 10 GP"],
  },
  urchin: {
    backgroundId: "urchin",
    label: "Urchin equipment",
    items: ["Small Knife", "Map of Home City", "Pet Mouse", "Token of Parents", "Common Clothes", "Belt Pouch with 10 GP"],
  },
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** All supported class IDs (sorted alphabetically). */
const SUPPORTED_CLASS_IDS: readonly string[] = Object.keys(CLASS_EQUIPMENT).sort();

/** All supported background IDs (sorted alphabetically). */
const SUPPORTED_BACKGROUND_IDS: readonly string[] = Object.keys(BACKGROUND_EQUIPMENT).sort();

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

    getBackgroundEquipment(backgroundId: string): BackgroundEquipment | null {
      return BACKGROUND_EQUIPMENT[backgroundId.trim().toLowerCase()] ?? null;
    },

    getSupportedClassIds(): string[] {
      return [...SUPPORTED_CLASS_IDS];
    },

    getSupportedBackgroundIds(): string[] {
      return [...SUPPORTED_BACKGROUND_IDS];
    },
  };
}

/**
 * Singleton equipment registry instance.
 * Consumed by getRules() in spells.ts to delegate getEquipmentRules.
 */
export const equipment: EquipmentRegistry = getEquipmentRegistry();
