import {
  getAllAdventuringGear,
  getAllArmor,
  getAllClasses,
  getAllRaces,
  getAllSpells,
  getAllWeapons,
  type AdventuringGear,
  type Armor,
  type Class,
  type Race,
  type Spell,
  type Weapon,
} from "@/data";
import {
  type DnD5eAbilityScores,
  type InventoryItem,
  type PreparedSpell,
  type SavingThrowProficiency,
} from "@/types/character";

export type AbilityKey = keyof DnD5eAbilityScores;

export interface SkillDefinition {
  name: string;
  ability: AbilityKey;
}

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  { name: "Acrobatics", ability: "dexterity" },
  { name: "Animal Handling", ability: "wisdom" },
  { name: "Arcana", ability: "intelligence" },
  { name: "Athletics", ability: "strength" },
  { name: "Deception", ability: "charisma" },
  { name: "History", ability: "intelligence" },
  { name: "Insight", ability: "wisdom" },
  { name: "Intimidation", ability: "charisma" },
  { name: "Investigation", ability: "intelligence" },
  { name: "Medicine", ability: "wisdom" },
  { name: "Nature", ability: "intelligence" },
  { name: "Perception", ability: "wisdom" },
  { name: "Performance", ability: "charisma" },
  { name: "Persuasion", ability: "charisma" },
  { name: "Religion", ability: "intelligence" },
  { name: "Sleight of Hand", ability: "dexterity" },
  { name: "Stealth", ability: "dexterity" },
  { name: "Survival", ability: "wisdom" },
];

const ABILITY_LABEL_MAP: Record<string, AbilityKey> = {
  strength: "strength",
  dexterity: "dexterity",
  constitution: "constitution",
  intelligence: "intelligence",
  wisdom: "wisdom",
  charisma: "charisma",
};

const normalize = (value: string): string => value.trim().toLowerCase();

export function getClassByName(className: string): Class | undefined {
  const normalized = normalize(className);
  return getAllClasses().find((entry) => normalize(entry.name) === normalized);
}

export function getRaceByName(raceName: string): Race | undefined {
  const normalized = normalize(raceName);
  return getAllRaces().find((entry) => normalize(entry.name) === normalized);
}

export function toAbilityKey(ability: string): AbilityKey | undefined {
  return ABILITY_LABEL_MAP[normalize(ability)];
}

export function getClassHitDie(className: string): number {
  return getClassByName(className)?.hitDie ?? 8;
}

export function getClassSpellcastingAbility(className: string): AbilityKey | undefined {
  return getClassByName(className)?.spellcasting?.ability;
}

export function isSpellcastingClass(className: string): boolean {
  return !!getClassByName(className)?.spellcasting;
}

export function getClassSavingThrowKeys(className: string): AbilityKey[] {
  const cls = getClassByName(className);
  if (!cls) {
    return [];
  }

  return cls.savingThrows.map((entry) => toAbilityKey(entry)).filter(Boolean) as AbilityKey[];
}

export function getClassSavingThrowProficiencies(className: string): SavingThrowProficiency {
  const result: SavingThrowProficiency = {};
  getClassSavingThrowKeys(className).forEach((ability) => {
    result[ability] = true;
  });
  return result;
}

export function getClassSkillChoices(className: string): { choose: number; from: string[] } {
  return getClassByName(className)?.skillChoices ?? { choose: 0, from: [] };
}

export function getClassSpells(className: string): Spell[] {
  const normalized = normalize(className);
  return getAllSpells()
    .filter((spell) => spell.classes.some((entry) => normalize(entry) === normalized))
    .sort((a, b) => (a.level === b.level ? a.name.localeCompare(b.name) : a.level - b.level));
}

export function formatSpellComponents(components: Spell["components"]): string {
  const parts: string[] = [];
  if (components.verbal) {
    parts.push("V");
  }
  if (components.somatic) {
    parts.push("S");
  }
  if (components.material) {
    if (typeof components.material === "boolean") {
      parts.push("M");
    } else if (components.material.components) {
      parts.push(`M (${components.material.components})`);
    } else {
      parts.push("M");
    }
  }
  return parts.join(", ");
}

export function toPreparedSpell(spell: Spell, id: string = crypto.randomUUID()): PreparedSpell {
  return {
    id,
    sourceSpellId: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: formatSpellComponents(spell.components),
    duration: spell.duration,
    description: spell.description,
  };
}

export type CompendiumEquipmentType = "weapon" | "armor" | "adventuringGear";

export type CompendiumEquipmentSource = Weapon | Armor | AdventuringGear;

export interface CompendiumEquipmentItem {
  id: string;
  name: string;
  type: CompendiumEquipmentType;
  category: string;
  weight: number;
  costLabel: string;
  description?: string;
  source: CompendiumEquipmentSource;
}

const toCostLabel = (quantity: number, unit: string): string => `${quantity} ${unit}`;

export function getAllCompendiumEquipment(): CompendiumEquipmentItem[] {
  const weaponEntries = getAllWeapons().map((weapon) => ({
    id: weapon.id,
    name: weapon.name,
    type: "weapon" as const,
    category: `${weapon.category} ${weapon.weaponType}`,
    weight: weapon.weight,
    costLabel: toCostLabel(weapon.cost.quantity, weapon.cost.unit),
    description: weapon.description,
    source: weapon,
  }));

  const armorEntries = getAllArmor().map((item) => ({
    id: item.id,
    name: item.name,
    type: "armor" as const,
    category: item.category,
    weight: item.weight,
    costLabel: toCostLabel(item.cost.quantity, item.cost.unit),
    description: item.description,
    source: item,
  }));

  const gearEntries = getAllAdventuringGear().map((item) => ({
    id: item.id,
    name: item.name,
    type: "adventuringGear" as const,
    category: item.category || "general",
    weight: item.weight,
    costLabel: toCostLabel(item.cost.quantity, item.cost.unit),
    description: item.description,
    source: item,
  }));

  return [...weaponEntries, ...armorEntries, ...gearEntries].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function toInventoryItem(
  entry: CompendiumEquipmentItem,
  quantity: number = 1
): InventoryItem {
  return {
    id: crypto.randomUUID(),
    sourceItemId: entry.id,
    sourceItemType: entry.type,
    name: entry.name,
    quantity,
    weight: entry.weight,
    description: entry.description,
    equipped: false,
    equipmentSlot: undefined,
  };
}
