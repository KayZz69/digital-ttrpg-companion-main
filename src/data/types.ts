/**
 * Core data types for D&D 5e game content
 * These interfaces define the structure for races, classes, spells, and items
 */

export interface RaceTrait {
  name: string;
  description: string;
}

export interface Race {
  id: string;
  name: string;
  size: "Small" | "Medium";
  speed: number;
  creatureType: string;
  traits: RaceTrait[];
  abilityScoreIncrease?: string; // e.g., "Choose +2 to one ability and +1 to another"
  languages?: string[];
}

export interface ClassFeature {
  level: number;
  name: string;
  description: string;
}

export interface ClassSpellcasting {
  ability: "intelligence" | "wisdom" | "charisma";
  ritualCasting?: boolean;
  spellcastingFocus?: string;
}

export interface Class {
  id: string;
  name: string;
  hitDie: number;
  primaryAbility: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies?: string[];
  skillChoices: {
    choose: number;
    from: string[];
  };
  spellcasting?: ClassSpellcasting;
  features: ClassFeature[];
  subclasses: string[];
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 for cantrips, 1-9 for spell levels
  school: "Abjuration" | "Conjuration" | "Divination" | "Enchantment" | "Evocation" | "Illusion" | "Necromancy" | "Transmutation";
  castingTime: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean | { required: boolean; components: string };
  };
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevels?: string;
  classes: string[]; // Which classes can learn this spell
}

export interface Equipment {
  id: string;
  name: string;
  type: "weapon" | "armor" | "adventuringGear" | "tool" | "mount" | "tradeGood";
  cost: {
    quantity: number;
    unit: "cp" | "sp" | "gp" | "pp";
  };
  weight: number;
  description?: string;
}

export interface Weapon extends Equipment {
  type: "weapon";
  category: "simple" | "martial";
  weaponType: "melee" | "ranged";
  damage: {
    dice: string; // e.g., "1d8" or "" for non-damaging weapons
    type: "slashing" | "piercing" | "bludgeoning" | "";
  };
  properties: string[]; // e.g., ["finesse", "light", "thrown"]
  range?: {
    normal: number;
    long?: number;
  };
}

export interface Armor extends Equipment {
  type: "armor";
  category: "light" | "medium" | "heavy" | "shield";
  armorClass: string; // e.g., "12 + Dex modifier"
  stealthDisadvantage?: boolean;
  strengthRequirement?: number;
}

export interface AdventuringGear extends Equipment {
  type: "adventuringGear";
  category?: string; // e.g., "container", "light", "healing"
}

