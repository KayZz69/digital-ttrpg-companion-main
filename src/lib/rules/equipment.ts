/**
 * @fileoverview Equipment rules stub for D&D 5e 2024.
 *
 * Full implementation is deferred to CCR-007 (Equipment rules rewrite).
 * This stub satisfies the RulesRegistry.getEquipmentRules contract and
 * provides class stubs so consumers can reference valid class IDs.
 *
 * @see ROADMAP.md — CCR-007: Equipment rules, starting equipment rewrite
 * @see 2024 PHB — "Starting Equipment" (each class section, Chapter 7)
 */

import type { EquipmentRule } from "./RulesRegistry";

// ---------------------------------------------------------------------------
// Interface (extensible per CCR-007)
// ---------------------------------------------------------------------------

/**
 * Stub equipment registry interface.
 * Extend this in CCR-007 when full item linking is implemented.
 */
export interface EquipmentRegistry {
  /**
   * Returns starting equipment rules for a class.
   * Returns null for unknown classes or until CCR-007 is implemented.
   */
  getEquipmentRules(classId: string): EquipmentRule | null;
}

// ---------------------------------------------------------------------------
// Stub data
// ---------------------------------------------------------------------------

/**
 * Minimal starting equipment stubs per class.
 * Items are display-only strings; full item linking deferred to CCR-007.
 *
 * @see 2024 PHB — "Starting Equipment" in each class section
 */
const EQUIPMENT_STUBS: Readonly<Record<string, EquipmentRule>> = {
  barbarian: {
    classId: "barbarian",
    packages: [
      {
        id: "barbarian-a",
        label: "Package A",
        items: ["Greataxe", "4 Handaxes", "Explorer's Pack", "15 GP"],
      },
    ],
    startingGoldGP: 75, // Default 75 gp (approximated, full rules in CCR-007)
  },
  bard: {
    classId: "bard",
    packages: [
      {
        id: "bard-a",
        label: "Package A",
        items: ["Rapier", "Diplomat's Pack", "Lute", "Leather Armor", "Dagger"],
      },
    ],
    startingGoldGP: 125, // 2024 PHB: 5d4 × 10 gp average
  },
  cleric: {
    classId: "cleric",
    packages: [
      {
        id: "cleric-a",
        label: "Package A",
        items: ["Mace", "Scale Mail", "Light Crossbow", "20 Bolts", "Priest's Pack", "Shield", "Holy Symbol"],
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
        items: ["Wooden Shield", "Scimitar", "Explorer's Pack", "Druidic Focus"],
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
        items: ["Chain Mail", "Martial Weapon", "Shield", "Light Crossbow", "20 Bolts", "Dungeoneer's Pack"],
      },
      {
        id: "fighter-b",
        label: "Package B (Ranged)",
        items: ["Leather Armor", "Longbow", "20 Arrows", "Two Handaxes", "Dungeoneer's Pack"],
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
        items: ["Martial Weapon", "Shield", "5 Javelins", "Priest's Pack", "Chain Mail", "Holy Symbol"],
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
        items: ["Scale Mail", "Two Shortswords", "Dungeoneer's Pack", "Longbow", "20 Arrows"],
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
        items: ["Rapier", "Shortbow", "20 Arrows", "Burglar's Pack", "Leather Armor", "Two Daggers", "Thieves' Tools"],
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
        items: ["Light Crossbow", "20 Bolts", "Arcane Focus", "Dungeoneer's Pack", "Two Daggers"],
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
        items: ["Light Crossbow", "20 Bolts", "Arcane Focus", "Scholar's Pack", "Leather Armor", "Two Daggers"],
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
        items: ["Quarterstaff", "Arcane Focus", "Scholar's Pack", "Spellbook"],
      },
    ],
    startingGoldGP: 75,
  },
};

// ---------------------------------------------------------------------------
// Registry factory
// ---------------------------------------------------------------------------

/**
 * Returns the equipment rules registry stub.
 *
 * Full implementation deferred to CCR-007.
 *
 * @pure
 */
export function getEquipmentRegistry(): EquipmentRegistry {
  return {
    getEquipmentRules(classId: string): EquipmentRule | null {
      return EQUIPMENT_STUBS[classId.trim().toLowerCase()] ?? null;
    },
  };
}
