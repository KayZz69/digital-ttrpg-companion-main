import { Race } from "./types";

/**
 * D&D 5e Races (Species)
 * 
 * Populated with data from Player's Handbook (2024) Chapter 2.
 * Includes all 10 core species with traits and languages.
 * Lineages/heritage options are integrated into traits where applicable.
 */

export const races: Race[] = [
  {
    id: "aasimar",
    name: "Aasimar",
    size: "Medium",
    speed: 30,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Celestial Resistance",
        description: "You have Resistance to Necrotic and Radiant damage.",
      },
      {
        name: "Darkvision",
        description: "You have Darkvision with a range of 60 feet.",
      },
      {
        name: "Healing Hands",
        description: "As an Action, you touch a creature to restore Hit Points equal to 1 + your level. You can use this trait a number of times equal to your Proficiency Bonus, and you regain expended uses when you finish a Long Rest.",
      },
      {
        name: "Light Bearer",
        description: "You know the Light cantrip. Charisma is your spellcasting ability for this spell.",
      },
      {
        name: "Radiant Soul",
        description: "Starting at 3rd level, as a Bonus Action, you shed bright light in a 10-foot radius and dim light for an additional 10 feet for 1 minute. For the duration, once on each of your turns when you hit with a weapon or spell attack, you can deal extra Radiant damage to the target, equal to your level + your Charisma modifier. You can use this trait a number of times equal to your Proficiency Bonus, and you regain expended uses when you finish a Long Rest.",
      },
    ],
    languages: ["Common", "Celestial"],
  },
  {
    id: "dragonborn",
    name: "Dragonborn",
    size: "Medium",
    speed: 30,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Breath Weapon",
        description: "As an Action, you exhale destructive energy. Choose a damage type: Acid, Cold, Fire, Lightning, or Poison. The damage type must be one of the damage types associated with your Draconic Ancestry. Each creature in a 15-foot cone must make a saving throw (Dexterity for line, Constitution for cone), taking damage on a failure (2d6 at 1st level, increasing by 1d6 at 6th, 11th, and 16th level). Half damage on success. You can use this trait a number of times equal to your Proficiency Bonus, regaining uses on a Long Rest.",
      },
      {
        name: "Damage Resistance",
        description: "You have Resistance to the damage type associated with your Draconic Ancestry.",
      },
      {
        name: "Draconic Ancestry",
        description: "Choose Black, Blue, Brass, Bronze, Copper, Gold, Green, Red, Silver, or White. Determines Breath Weapon shape (cone or line) and damage type.",
      },
    ],
    languages: ["Common", "Draconic"],
  },
  {
    id: "dwarf",
    name: "Dwarf",
    size: "Medium",
    speed: 30,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Darkvision",
        description: "You have Darkvision with a range of 60 feet.",
      },
      {
        name: "Dwarven Resilience",
        description: "You have Resistance to Poison damage and Advantage on saving throws you make to avoid or end the Poisoned condition.",
      },
      {
        name: "Dwarven Toughness",
        description: "Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.",
      },
      {
        name: "Stonecunning",
        description: "As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You can use this trait a number of times equal to your Proficiency Bonus, regaining expended uses on a Long Rest.",
      },
    ],
    languages: ["Common", "Dwarvish"],
  },
  {
    id: "elf",
    name: "Elf",
    size: "Medium",
    speed: 30,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Darkvision",
        description: "You have Darkvision with a range of 60 feet.",
      },
      {
        name: "Elven Lineage",
        description: "You are part of a lineage that grants you supernatural abilities. Choose one: High Elf, Wood Elf, or Drow.",
      },
      {
        name: "Fey Ancestry",
        description: "You have Advantage on saving throws you make to avoid or end the Charmed condition.",
      },
      {
        name: "Keen Senses",
        description: "You have proficiency in the Perception skill.",
      },
      {
        name: "Trance",
        description: "You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend it in a meditative trance.",
      },
    ],
    languages: ["Common", "Elvish"],
  },
  {
    id: "gnome",
    name: "Gnome",
    size: "Small",
    speed: 25,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Darkvision",
        description: "You have Darkvision with a range of 60 feet.",
      },
      {
        name: "Gnome Cunning",
        description: "You have Advantage on Intelligence, Wisdom, and Charisma saving throws against magic.",
      },
      {
        name: "Gnomish Lineage",
        description: "Choose one: Forest Gnome or Rock Gnome.",
      },
    ],
    languages: ["Common", "Gnomish"],
  },
  {
    id: "goliath",
    name: "Goliath",
    size: "Medium",
    speed: 30,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Large Form",
        description: "You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.",
      },
      {
        name: "Powerful Build",
        description: "You count as one size larger for the purpose of determining your carrying capacity.",
      },
      {
        name: "Stone's Endurance",
        description: "When you take damage, you can use your Reaction to reduce the damage by 1d12 + your Constitution modifier. You can use this trait a number of times equal to your Proficiency Bonus, regaining uses on a Long Rest.",
      },
    ],
    languages: ["Common", "Giant"],
  },
  {
    id: "halfling",
    name: "Halfling",
    size: "Small",
    speed: 25,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Brave",
        description: "You have Advantage on saving throws you make to avoid or end the Frightened condition.",
      },
      {
        name: "Halfling Nimbleness",
        description: "You can move through the space of any creature larger than you.",
      },
      {
        name: "Halfling Lineage",
        description: "Choose one: Lightfoot or Stout.",
      },
      {
        name: "Lucky",
        description: "Whenever you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die.",
      },
    ],
    languages: ["Common", "Halfling"],
  },
  {
    id: "human",
    name: "Human",
    size: "Medium",
    speed: 30,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Resourceful",
        description: "You gain Heroic Inspiration whenever you finish a Long Rest.",
      },
      {
        name: "Skillful",
        description: "You gain proficiency in one skill of your choice.",
      },
      {
        name: "Versatile",
        description: "You gain an Origin feat of your choice.",
      },
    ],
    languages: ["Common", "One language of your choice"],
  },
  {
    id: "orc",
    name: "Orc",
    size: "Medium",
    speed: 30,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Adrenaline Rush",
        description: "As a Bonus Action, you gain temporary Hit Points equal to your level + your Constitution modifier. You can use this trait a number of times equal to your Proficiency Bonus, regaining uses on a Long Rest.",
      },
      {
        name: "Darkvision",
        description: "You have Darkvision with a range of 60 feet.",
      },
      {
        name: "Menacing",
        description: "You have proficiency in the Intimidation skill.",
      },
    ],
    languages: ["Common", "Orc"],
  },
  {
    id: "tiefling",
    name: "Tiefling",
    size: "Medium",
    speed: 30,
    creatureType: "Humanoid",
    traits: [
      {
        name: "Darkvision",
        description: "You have Darkvision with a range of 60 feet.",
      },
      {
        name: "Hellish Resistance",
        description: "You have Resistance to Fire damage.",
      },
      {
        name: "Infernal Legacy",
        description: "You know the Thaumaturgy cantrip. Once you reach 3rd level, you can cast the Hellish Rebuke spell as a 2nd-level spell once with this trait and regain the ability to do so after a Long Rest. Once you reach 5th level, you can also cast the Darkness spell once with this trait and regain the ability to do so after a Long Rest. Charisma is your spellcasting ability for these spells.",
      },
    ],
    languages: ["Common", "Infernal"],
  },
];

export function getRaceById(id: string): Race | undefined {
  return races.find(race => race.id === id);
}

export function getAllRaces(): Race[] {
  return races;
}