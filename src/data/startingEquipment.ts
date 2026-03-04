import { StartingEquipmentChoice } from "./types";

const CLASS_STARTING_EQUIPMENT: Record<string, StartingEquipmentChoice[]> = {
  barbarian: [
    {
      id: "barbarian-standard",
      label: "Greataxe and explorer's gear",
      items: [
        { itemName: "Greataxe" },
        { itemName: "Handaxe", quantity: 2 },
        { itemName: "Explorer's Pack" },
        { itemName: "Javelin", quantity: 4 },
      ],
    },
  ],
  bard: [
    {
      id: "bard-standard",
      label: "Rapier and entertainer's gear",
      items: [
        { itemName: "Rapier" },
        { itemName: "Dagger" },
        { itemName: "Leather Armor" },
        { itemName: "Entertainer's Pack" },
      ],
    },
  ],
  cleric: [
    {
      id: "cleric-standard",
      label: "Mace and priest's gear",
      items: [
        { itemName: "Mace" },
        { itemName: "Chain Mail" },
        { itemName: "Amulet" },
        { itemName: "Priest's Pack" },
      ],
    },
  ],
  druid: [
    {
      id: "druid-standard",
      label: "Staff and explorer's gear",
      items: [
        { itemName: "Quarterstaff" },
        { itemName: "Hide Armor" },
        { itemName: "Explorer's Pack" },
        { itemName: "Dagger" },
      ],
    },
  ],
  fighter: [
    {
      id: "fighter-standard",
      label: "Martial frontliner kit",
      items: [
        { itemName: "Chain Mail" },
        { itemName: "Longsword" },
        { itemName: "Light Crossbow" },
        { itemName: "Dungeoneer's Pack" },
      ],
    },
  ],
  monk: [
    {
      id: "monk-standard",
      label: "Simple monk kit",
      items: [
        { itemName: "Shortsword" },
        { itemName: "Dungeoneer's Pack" },
        { itemName: "Dart", quantity: 10 },
      ],
    },
  ],
  paladin: [
    {
      id: "paladin-standard",
      label: "Paladin heavy kit",
      items: [
        { itemName: "Chain Mail" },
        { itemName: "Longsword" },
        { itemName: "Javelin", quantity: 5 },
        { itemName: "Priest's Pack" },
      ],
    },
  ],
  ranger: [
    {
      id: "ranger-standard",
      label: "Ranger scout kit",
      items: [
        { itemName: "Studded Leather Armor" },
        { itemName: "Longbow" },
        { itemName: "Shortsword", quantity: 2 },
        { itemName: "Explorer's Pack" },
      ],
    },
  ],
  rogue: [
    {
      id: "rogue-standard",
      label: "Rogue infiltration kit",
      items: [
        { itemName: "Rapier" },
        { itemName: "Shortbow" },
        { itemName: "Leather Armor" },
        { itemName: "Burglar's Pack" },
        { itemName: "Thieves' Tools" },
      ],
    },
  ],
  sorcerer: [
    {
      id: "sorcerer-standard",
      label: "Sorcerer arcane kit",
      items: [
        { itemName: "Light Crossbow" },
        { itemName: "Dagger", quantity: 2 },
        { itemName: "Component Pouch" },
        { itemName: "Explorer's Pack" },
      ],
    },
  ],
  warlock: [
    {
      id: "warlock-standard",
      label: "Warlock pact kit",
      items: [
        { itemName: "Light Crossbow" },
        { itemName: "Leather Armor" },
        { itemName: "Component Pouch" },
        { itemName: "Scholar's Pack" },
      ],
    },
  ],
  wizard: [
    {
      id: "wizard-standard",
      label: "Wizard scholar kit",
      items: [
        { itemName: "Quarterstaff" },
        { itemName: "Spellbook" },
        { itemName: "Component Pouch" },
        { itemName: "Scholar's Pack" },
      ],
    },
  ],
};

const STARTING_GOLD_BUDGETS: Record<string, number> = {
  barbarian: 20,
  bard: 125,
  cleric: 125,
  druid: 50,
  fighter: 150,
  monk: 15,
  paladin: 150,
  ranger: 100,
  rogue: 100,
  sorcerer: 100,
  warlock: 100,
  wizard: 100,
};

export function getStartingEquipmentChoices(classId: string): StartingEquipmentChoice[] {
  return CLASS_STARTING_EQUIPMENT[classId.toLowerCase()] ?? [];
}

export function getStartingGoldBudget(classId: string): number {
  return STARTING_GOLD_BUDGETS[classId.toLowerCase()] ?? 100;
}

