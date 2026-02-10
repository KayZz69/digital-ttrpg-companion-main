import { Race } from "./types";

/**
 * D&D 5e Races (core set used by this app).
 *
 * Generated from local 5etools JSON export.
 */

export const races: Race[] = [
  {
    "id": "aasimar",
    "name": "Aasimar",
    "size": "Medium",
    "speed": 30,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Celestial Resistance",
        "description": "You have resistance to necrotic damage and radiant damage."
      },
      {
        "name": "Darkvision",
        "description": "You can see in dim light within 60 feet of you as if it were bright light and in darkness as if it were dim light. You discern colors in that darkness only as shades of gray."
      },
      {
        "name": "Healing Hands",
        "description": "As an action, you can touch a creature and roll a number of d4s equal to your proficiency bonus. The creature regains a number of hit points equal to the total rolled. Once you use this trait, you can't use it again until you finish a long rest."
      },
      {
        "name": "Light Bearer",
        "description": "You know the light cantrip. Charisma is your spellcasting ability for it."
      },
      {
        "name": "Celestial Revelation",
        "description": "When you reach 3rd level, choose one of the revelation options below. Thereafter, you can use a bonus action to unleash the celestial energy within yourself, gaining the benefits of that revelation. Your transformation lasts for 1 minute or until you end it as a bonus action. Once you transform using your revelation below, you can't use it again until you finish a long rest. Your eyes briefly become pools of darkness, and ghostly, flightless wings sprout from your back temporarily. Creatures other than your allies within 10 feet of you that can see you must succeed on a Charisma saving throw (8 + your proficiency bonus + your Charisma modifier) or become frightened of you until the end of your next turn. Until the transformation ends, once on each of your turns, you can deal extra necrotic damage to one target when you deal damage to it with an attack or a spell. The extra damage equals your proficiency bonus.; Searing light temporarily radiates from your eyes and mouth. For the duration, you shed bright light in a 10-foot radius and dim light for an additional 10 feet, and at the end of each of your turns, each creature within 10 feet of you takes radiant damage equal to your proficiency bonus. Until the transformation ends, once on each of your turns, you can deal extra radiant damage to one target when you deal damage to it with an attack or a spell. The extra damage equals your proficiency bonus.; Two luminous, spectral wings sprout from your back temporarily. Until the transformation ends, you have a flying speed equal to your walking speed, and once on each of your turns, you can deal extra radiant damage to one target when you deal damage to it with an attack or a spell. The extra damage equals your proficiency bonus."
      }
    ]
  },
  {
    "id": "dragonborn",
    "name": "Dragonborn",
    "size": "Medium",
    "speed": 30,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Draconic Ancestry",
        "description": "You have draconic ancestry. Choose one type of dragon from the Draconic Ancestry table. Your breath weapon and damage resistance are determined by the dragon type, as shown in the table."
      },
      {
        "name": "Breath Weapon",
        "description": "You can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type of the exhalation. When you use your breath weapon, each creature in the area of the exhalation must make a saving throw, the type of which is determined by your draconic ancestry. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can't use it again until you complete a short or long rest."
      },
      {
        "name": "Damage Resistance",
        "description": "You have resistance to the damage type associated with your draconic ancestry."
      }
    ],
    "abilityScoreIncrease": "Strength +2, Charisma +1",
    "languages": [
      "Common",
      "Draconic"
    ]
  },
  {
    "id": "dwarf",
    "name": "Dwarf",
    "size": "Medium",
    "speed": 25,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Speed",
        "description": "Your speed is not reduced by wearing heavy armor."
      },
      {
        "name": "Darkvision",
        "description": "Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray."
      },
      {
        "name": "Dwarven Resilience",
        "description": "You have advantage on saving throws against poison, and you have resistance against poison damage."
      },
      {
        "name": "Dwarven Combat Training",
        "description": "You have proficiency with the battleaxe, handaxe, light hammer, and warhammer."
      },
      {
        "name": "Tool Proficiency",
        "description": "You gain proficiency with the artisan's tools of your choice: Smith's tools, brewer's supplies, or mason's tools."
      },
      {
        "name": "Stonecunning",
        "description": "Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus."
      }
    ],
    "abilityScoreIncrease": "Constitution +2",
    "languages": [
      "Common",
      "Dwarvish"
    ]
  },
  {
    "id": "elf",
    "name": "Elf",
    "size": "Medium",
    "speed": 30,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Darkvision",
        "description": "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray."
      },
      {
        "name": "Keen Senses",
        "description": "You have proficiency in the Perception skill."
      },
      {
        "name": "Fey Ancestry",
        "description": "You have advantage on saving throws against being charmed, and magic can't put you to sleep."
      },
      {
        "name": "Trance",
        "description": "Elves don't need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. (The Common word for such meditation is \"trance.\") While meditating, you can dream after a fashion; such dreams are actually mental exercises that have become reflexive through years of practice. After resting in this way, you gain the same benefit that a human does from 8 hours of sleep. If you meditate during a long rest, you finish the rest after only 4 hours. You otherwise obey all the rules for a long rest; only the duration is changed."
      }
    ],
    "abilityScoreIncrease": "Dexterity +2",
    "languages": [
      "Common",
      "Elvish"
    ]
  },
  {
    "id": "gnome",
    "name": "Gnome",
    "size": "Small",
    "speed": 25,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Darkvision",
        "description": "Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray."
      },
      {
        "name": "Gnome Cunning",
        "description": "You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic."
      }
    ],
    "abilityScoreIncrease": "Intelligence +2",
    "languages": [
      "Common",
      "Gnomish"
    ]
  },
  {
    "id": "goliath",
    "name": "Goliath",
    "size": "Medium",
    "speed": 30,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Little Giant",
        "description": "You have proficiency in the Athletics skill, and you count as one size larger when determining your carrying weight and the weight you can push, drag, or lift."
      },
      {
        "name": "Mountain Born",
        "description": "You have resistance to cold damage. You also naturally acclimate to high altitudes, even if you've never been to one. This includes elevations above 20,000 feet."
      },
      {
        "name": "Stone's Endurance",
        "description": "You can supernaturally draw on unyielding stone to shrug off harm. When you take damage, you can use your reaction to roll a d12. Add your Constitution modifier to the number rolled and reduce the damage by that total. You can use this trait a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest."
      }
    ]
  },
  {
    "id": "halfling",
    "name": "Halfling",
    "size": "Small",
    "speed": 25,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Lucky",
        "description": "When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll."
      },
      {
        "name": "Brave",
        "description": "You have advantage on saving throws against being frightened."
      },
      {
        "name": "Halfling Nimbleness",
        "description": "You can move through the space of any creature that is of a size larger than yours."
      }
    ],
    "abilityScoreIncrease": "Dexterity +2",
    "languages": [
      "Common",
      "Halfling"
    ]
  },
  {
    "id": "human",
    "name": "Human",
    "size": "Medium",
    "speed": 30,
    "creatureType": "Humanoid",
    "traits": [],
    "languages": [
      "Common",
      "1 standard language of your choice"
    ]
  },
  {
    "id": "orc",
    "name": "Orc",
    "size": "Medium",
    "speed": 30,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Adrenaline Rush",
        "description": "You can take the Dash action as a bonus action. You can use this trait a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest. Whenever you use this trait, you gain a number of temporary hit points equal to your proficiency bonus."
      },
      {
        "name": "Darkvision",
        "description": "You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You discern colors in that darkness only as shades of gray."
      },
      {
        "name": "Powerful Build",
        "description": "You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift."
      },
      {
        "name": "Relentless Endurance",
        "description": "When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. Once you use this trait, you can't do so again until you finish a long rest."
      }
    ]
  },
  {
    "id": "tiefling",
    "name": "Tiefling",
    "size": "Medium",
    "speed": 30,
    "creatureType": "Humanoid",
    "traits": [
      {
        "name": "Darkvision",
        "description": "Thanks to your infernal heritage, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray."
      },
      {
        "name": "Hellish Resistance",
        "description": "You have resistance to fire damage."
      },
      {
        "name": "Infernal Legacy",
        "description": "You know the thaumaturgy cantrip. Once you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell with this trait; you regain the ability to cast it when you finish a long rest. Once you reach 5th level, you can also cast the darkness spell once per day with this trait; you regain the ability to cast it when you finish a long rest. Charisma is your spellcasting ability for these spells."
      }
    ],
    "abilityScoreIncrease": "Intelligence +1, Charisma +2",
    "languages": [
      "Common",
      "Infernal"
    ]
  }
];

export function getRaceById(id: string): Race | undefined {
  return races.find(race => race.id === id);
}

export function getAllRaces(): Race[] {
  return races;
}
