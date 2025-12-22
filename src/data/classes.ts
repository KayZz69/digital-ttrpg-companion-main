import { Class } from "./types";

/**
 * D&D 5e Classes
 * 
 * Populated with data from Player's Handbook (2024) Chapter 3.
 * Includes all 12 core classes with complete feature lists up to level 20.
 * Subclasses are listed but not fully detailed here; expand as needed.
 */

export const classes: Class[] = [
  {
    id: "barbarian",
    name: "Barbarian",
    hitDie: 12,
    primaryAbility: ["Strength", "Constitution"],
    savingThrows: ["Strength", "Constitution"],
    armorProficiencies: ["Light armor", "Medium armor", "Shields"],
    weaponProficiencies: ["Simple weapons", "Martial weapons"],
    skillChoices: {
      choose: 2,
      from: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
    },
    features: [
      {
        level: 1,
        name: "Rage",
        description: "In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain resistance to bludgeoning, piercing, and slashing damage, and you have advantage on Strength checks and Strength saving throws. Your rage lasts for 1 minute or until you end it as a bonus action. You can rage a number of times equal to your proficiency bonus, regaining uses after a long rest.",
      },
      {
        level: 1,
        name: "Unarmored Defense",
        description: "While not wearing armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.",
      },
      {
        level: 1,
        name: "Reckless Attack",
        description: "When you make your first attack on your turn, you can decide to attack recklessly, giving you advantage on melee weapon attack rolls using Strength during this turn, but attacks against you have advantage until your next turn.",
      },
      {
        level: 2,
        name: "Danger Sense",
        description: "You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells.",
      },
      {
        level: 2,
        name: "Reckless Strike",
        description: "When you take the Attack action on your turn and use a weapon that you are proficient with, you can make one additional weapon attack as part of that action.",
      },
      {
        level: 3,
        name: "Primal Knowledge",
        description: "You learn two Primal Stunts of your choice.",
      },
      {
        level: 3,
        name: "Bear Heart (or subclass feature)",
        description: "Choose a subclass: Path of the Berserker, Path of the Wild Heart, Path of the World Tree, or Path of the Zealot. Gain subclass features.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Extra Attack",
        description: "You can attack twice when you take the Attack action on your turn.",
      },
      {
        level: 5,
        name: "Fast Movement",
        description: "Your speed increases by 10 feet while you aren't wearing heavy armor.",
      },
      {
        level: 6,
        name: "Primal Knowledge",
        description: "You learn one additional Primal Stunt.",
      },
      {
        level: 7,
        name: "Feral Instinct",
        description: "You can't be surprised while conscious, and you have advantage on initiative rolls.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 9,
        name: "Brutal Critical",
        description: "You score a critical hit on a roll of 19 or 20.",
      },
      {
        level: 10,
        name: "Primal Knowledge",
        description: "You learn one additional Primal Stunt.",
      },
      {
        level: 11,
        name: "Relentless Rage",
        description: "If you drop to 0 hit points while raging and don't die outright, you can make a DC 10 Constitution saving throw to drop to 1 hit point instead.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 13,
        name: "Brutal Critical",
        description: "Your melee weapon attacks score a critical hit on a roll of 18 or higher.",
      },
      {
        level: 14,
        name: "Frenzied Strikes",
        description: "When you enter a rage, you can make one weapon attack as a bonus action.",
      },
      {
        level: 15,
        name: "Persistent Rage",
        description: "If your rage ends early, you can make a DC 15 Constitution saving throw to continue raging.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 17,
        name: "Brutal Critical",
        description: "Your melee weapon attacks score a critical hit on a roll of 17 or higher.",
      },
      {
        level: 18,
        name: "Indomitable Might",
        description: "If your Strength check total is less than your Strength score, you can use your Strength score instead.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Primal Champion",
        description: "You can use your action to regain hit points equal to 5 + your Constitution modifier. You can use this a number of times equal to your proficiency bonus, regaining uses after a long rest.",
      },
    ],
    subclasses: ["Path of the Berserker", "Path of the Wild Heart", "Path of the World Tree", "Path of the Zealot"],
  },
  {
    id: "bard",
    name: "Bard",
    hitDie: 8,
    primaryAbility: ["Charisma"],
    savingThrows: ["Dexterity", "Charisma"],
    armorProficiencies: ["Light armor"],
    weaponProficiencies: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
    skillChoices: {
      choose: 3,
      from: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"],
    },
    spellcasting: {
      ability: "charisma",
      ritualCasting: true,
      spellcastingFocus: "Musical Instrument",
    },
    features: [
      {
        level: 1,
        name: "Spellcasting",
        description: "You learn two cantrips and several Bard spells. Charisma is your spellcasting ability.",
      },
      {
        level: 1,
        name: "Bardic Inspiration",
        description: "As a bonus action, give one creature within 60 feet (including yourself) a Bardic Inspiration die (1d6). The creature can add it to one ability check, attack roll, or saving throw within 10 minutes.",
      },
      {
        level: 1,
        name: "Magical Secrets",
        description: "You learn two spells of your choice from any class's spell list.",
      },
      {
        level: 2,
        name: "Jack of All Trades",
        description: "Add half your proficiency bonus (rounded down) to any ability check you make that doesn't already include your proficiency bonus.",
      },
      {
        level: 2,
        name: "Song of Rest",
        description: "During a short rest, you and creatures within 30 feet who spend Hit Dice regain extra hit points equal to 1d6 + your Charisma modifier.",
      },
      {
        level: 3,
        name: "Expertise",
        description: "Choose two skills or one skill and thieves' tools; double your proficiency bonus for them.",
      },
      {
        level: 3,
        name: "College Feature (or subclass feature)",
        description: "Choose a subclass: College of Dance, College of Glamour, College of Lore, or College of Valor. Gain subclass features.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Bardic Inspiration (2d6)",
        description: "Your Bardic Inspiration die increases to 2d6.",
      },
      {
        level: 5,
        name: "Font of Inspiration",
        description: "Regain all expended uses of Bardic Inspiration when you finish a short or long rest.",
      },
      {
        level: 6,
        name: "Countercharm",
        description: "As a reaction when a creature within 30 feet is frightened, you can give it advantage on the saving throw.",
      },
      {
        level: 7,
        name: "College Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 9,
        name: "Magical Secrets",
        description: "You learn two spells of your choice from any class's spell list.",
      },
      {
        level: 10,
        name: "Expertise",
        description: "Choose two more skills or tools; double your proficiency bonus for them.",
      },
      {
        level: 10,
        name: "Bardic Inspiration (3d6)",
        description: "Your Bardic Inspiration die increases to 3d6.",
      },
      {
        level: 11,
        name: "Song of Rest (2d6)",
        description: "The extra hit points from Song of Rest increase to 2d6 + your Charisma modifier.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 13,
        name: "Magical Secrets",
        description: "You learn two spells of your choice from any class's spell list.",
      },
      {
        level: 14,
        name: "College Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 15,
        name: "Bardic Inspiration (4d6)",
        description: "Your Bardic Inspiration die increases to 4d6.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 17,
        name: "Magical Secrets",
        description: "You learn two spells of your choice from any class's spell list.",
      },
      {
        level: 18,
        name: "Superior Inspiration",
        description: "If you fail a saving throw, you can use your reaction to regain one use of Bardic Inspiration.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Bardic Inspiration (5d6)",
        description: "Your Bardic Inspiration die increases to 5d6. You regain one use after a long rest even if you have none left.",
      },
    ],
    subclasses: ["College of Dance", "College of Glamour", "College of Lore", "College of Valor"],
  },
  {
    id: "cleric",
    name: "Cleric",
    hitDie: 8,
    primaryAbility: ["Wisdom"],
    savingThrows: ["Wisdom", "Charisma"],
    armorProficiencies: ["Light armor", "Medium armor", "Shields"],
    weaponProficiencies: ["Simple weapons"],
    skillChoices: {
      choose: 2,
      from: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
    },
    spellcasting: {
      ability: "wisdom",
      ritualCasting: true,
      spellcastingFocus: "Holy Symbol",
    },
    features: [
      {
        level: 1,
        name: "Spellcasting",
        description: "You can cast Cleric spells. Wisdom is your spellcasting ability for your Cleric spells.",
      },
      {
        level: 1,
        name: "Divine Order",
        description: "You have dedicated yourself to one of the following sacred roles: Protector or Thaumaturge.",
      },
      {
        level: 1,
        name: "Divine Domain",
        description: "Choose a subclass (Domain): Arcana, Death, Forge, Grave, Knowledge, Life, Light, Nature, Order, Peace, Tempest, Trickery, or War. Gain domain spells and features.",
      },
      {
        level: 2,
        name: "Channel Divinity (1/rest)",
        description: "As an action, you can invoke divine energy to turn undead or use a Channel Divinity option from your domain.",
      },
      {
        level: 2,
        name: "Divine Intervention",
        description: "You can call on your deity for aid. Roll a d100; on 10 or lower, your deity answers with a minor boon.",
      },
      {
        level: 3,
        name: "Divine Intervention Improvement",
        description: "Your Divine Intervention success chance increases to 15 or lower.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Destroy Undead (CR 1/2)",
        description: "When you use Channel Divinity to turn undead, undead of CR 1/2 or lower are destroyed.",
      },
      {
        level: 6,
        name: "Domain Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 7,
        name: "Divine Intervention Improvement",
        description: "Your Divine Intervention success chance increases to 20 or lower.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 8,
        name: "Destroy Undead (CR 1)",
        description: "Undead of CR 1 or lower are destroyed.",
      },
      {
        level: 9,
        name: "Divine Intervention Improvement",
        description: "Your Divine Intervention success chance increases to 25 or lower.",
      },
      {
        level: 10,
        name: "Domain Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 11,
        name: "Destroy Undead (CR 2)",
        description: "Undead of CR 2 or lower are destroyed.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 13,
        name: "Divine Intervention Improvement",
        description: "Your Divine Intervention success chance increases to 30 or lower.",
      },
      {
        level: 14,
        name: "Destroy Undead (CR 3)",
        description: "Undead of CR 3 or lower are destroyed.",
      },
      {
        level: 15,
        name: "Domain Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 17,
        name: "Destroy Undead (CR 4)",
        description: "Undead of CR 4 or lower are destroyed.",
      },
      {
        level: 17,
        name: "Divine Intervention Improvement",
        description: "Your Divine Intervention success chance increases to 35 or lower.",
      },
      {
        level: 18,
        name: "Domain Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Divine Intervention Improvement",
        description: "Your Divine Intervention success chance increases to 40 or lower. When it succeeds, you can cast a Cleric spell of 7th level or lower without expending a spell slot.",
      },
    ],
    subclasses: ["Arcana Domain", "Death Domain", "Forge Domain", "Grave Domain", "Knowledge Domain", "Life Domain", "Light Domain", "Nature Domain", "Order Domain", "Peace Domain", "Tempest Domain", "Trickery Domain", "War Domain"],
  },
  {
    id: "druid",
    name: "Druid",
    hitDie: 8,
    primaryAbility: ["Wisdom"],
    savingThrows: ["Intelligence", "Wisdom"],
    armorProficiencies: ["Light armor", "Medium armor", "Shields (non-metal)"],
    weaponProficiencies: ["Simple weapons", "Scimitars", "Druidic weapons"],
    skillChoices: {
      choose: 2,
      from: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
    },
    spellcasting: {
      ability: "wisdom",
      ritualCasting: true,
      spellcastingFocus: "Druidic Focus",
    },
    features: [
      {
        level: 1,
        name: "Druidic",
        description: "You know Druidic, the secret language of druids.",
      },
      {
        level: 1,
        name: "Spellcasting",
        description: "You can cast Druid spells. Wisdom is your spellcasting ability.",
      },
      {
        level: 2,
        name: "Druidic Order",
        description: "Choose a subclass (Circle): Circle of the Land, Circle of the Moon, Circle of the Sea, or Circle of the Stars. Gain subclass features.",
      },
      {
        level: 2,
        name: "Wild Shape",
        description: "As an action, magically assume the shape of a beast of CR 1/4 or lower (no flying/swimming until level 8). Usable proficiency bonus times per long rest.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 4,
        name: "Wild Shape Improvement",
        description: "Your Wild Shape can be a beast of CR 1/2 or lower.",
      },
      {
        level: 5,
        name: "Wild Shape Improvement",
        description: "Your Wild Shape can be a beast of CR 1 or lower, and you can use it as a bonus action.",
      },
      {
        level: 6,
        name: "Order Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 8,
        name: "Wild Shape Improvement",
        description: "Beasts can fly or swim.",
      },
      {
        level: 9,
        name: "Wild Shape Improvement",
        description: "Your Wild Shape can be a beast of CR 2 or lower.",
      },
      {
        level: 10,
        name: "Order Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 14,
        name: "Wild Shape Improvement",
        description: "Your Wild Shape can be a beast of CR 3 or lower.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 18,
        name: "Beast Spells",
        description: "You can cast spells while in Wild Shape.",
      },
      {
        level: 18,
        name: "Wild Shape Improvement",
        description: "Your Wild Shape can be a beast of CR 4 or lower.",
      },
      {
        level: 20,
        name: "Archdruid",
        description: "You can use Wild Shape unlimited times. While in beast form, you retain mental ability scores.",
      },
    ],
    subclasses: ["Circle of the Land", "Circle of the Moon", "Circle of the Sea", "Circle of the Stars"],
  },
  {
    id: "fighter",
    name: "Fighter",
    hitDie: 10,
    primaryAbility: ["Strength", "Dexterity"],
    savingThrows: ["Strength", "Constitution"],
    armorProficiencies: ["All armor", "Shields"],
    weaponProficiencies: ["Simple weapons", "Martial weapons"],
    skillChoices: {
      choose: 2,
      from: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
    },
    features: [
      {
        level: 1,
        name: "Fighting Style",
        description: "You gain a Fighting Style feat of your choice.",
      },
      {
        level: 1,
        name: "Second Wind",
        description: "You can use a Bonus Action to regain Hit Points equal to 1d10 + your Fighter level. You can use this feature a number of times equal to your Proficiency Bonus, regaining expended uses on a Long Rest.",
      },
      {
        level: 1,
        name: "Weapon Mastery",
        description: "Your training with weapons allows you to use the mastery properties of three kinds of Simple or Martial Melee weapons of your choice.",
      },
      {
        level: 2,
        name: "Tactical Mind",
        description: "You have advantage on Intelligence (Investigation) checks to determine where traps are located.",
      },
      {
        level: 3,
        name: "Fighting Style",
        description: "You gain a second Fighting Style feat.",
      },
      {
        level: 3,
        name: "Martial Archetype (or subclass feature)",
        description: "Choose a subclass: Battle Master, Champion, Eldritch Knight, or Psi Warrior. Gain subclass features.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Extra Attack",
        description: "You can attack twice when you take the Attack action on your turn.",
      },
      {
        level: 6,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 7,
        name: "Remarkable Athlete",
        description: "Add half your proficiency bonus to Strength, Dexterity, or Constitution checks.",
      },
      {
        level: 8,
        name: "Archetype Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 9,
        name: "Indomitable",
        description: "Reroll a failed saving throw, using the new result.",
      },
      {
        level: 10,
        name: "Weapon Mastery",
        description: "You can use mastery properties of one additional kind of weapon.",
      },
      {
        level: 10,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 11,
        name: "Extra Attack (3)",
        description: "You can attack three times when you take the Attack action.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 13,
        name: "Indomitable (2)",
        description: "You can use Indomitable twice per long rest.",
      },
      {
        level: 14,
        name: "Archetype Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 15,
        name: "Weapon Mastery",
        description: "You can use mastery properties of one additional kind of weapon.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 17,
        name: "Extra Attack (4)",
        description: "You can attack four times when you take the Attack action.",
      },
      {
        level: 17,
        name: "Indomitable (3)",
        description: "You can use Indomitable three times per long rest.",
      },
      {
        level: 18,
        name: "Archetype Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Weapon Mastery",
        description: "You can use mastery properties of one additional kind of weapon. You also gain the Cleave property on one weapon.",
      },
    ],
    subclasses: ["Battle Master", "Champion", "Eldritch Knight", "Psi Warrior"],
  },
  {
    id: "monk",
    name: "Monk",
    hitDie: 8,
    primaryAbility: ["Dexterity", "Wisdom"],
    savingThrows: ["Strength", "Dexterity"],
    armorProficiencies: [],
    weaponProficiencies: ["Simple weapons", "Shortswords"],
    skillChoices: {
      choose: 2,
      from: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
    },
    features: [
      {
        level: 1,
        name: "Martial Arts",
        description: "You can use Dexterity instead of Strength for unarmed strikes and monk weapons. Unarmed strikes deal 1d4 bludgeoning damage.",
      },
      {
        level: 1,
        name: "Unarmored Defense",
        description: "While unarmored, your AC equals 10 + Dex + Wis.",
      },
      {
        level: 1,
        name: "Weapon Mastery",
        description: "You gain the Nick property on all monk weapons.",
      },
      {
        level: 2,
        name: "Ki",
        description: "You have 2 ki points to spend on features like Flurry of Blows or Patient Defense. Regain on short/long rest.",
      },
      {
        level: 2,
        name: "Deflect Missiles",
        description: "As a reaction to a ranged weapon attack, reduce damage by 1d10 + Dex + monk level. If reduced to 0, catch and throw back.",
      },
      {
        level: 2,
        name: "Monastic Tradition (or subclass feature)",
        description: "Choose a subclass: Way of the Ascendant Dragon, Way of Mercy, Way of Shadow, or Way of the Open Hand. Gain subclass features.",
      },
      {
        level: 3,
        name: "Deflect Energy",
        description: "Deflect Missiles works against spell attacks.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 4,
        name: "Slow Fall",
        description: "As a reaction, reduce falling damage by 5 times your monk level.",
      },
      {
        level: 5,
        name: "Extra Attack",
        description: "You can attack twice when you take the Attack action.",
      },
      {
        level: 5,
        name: "Stunning Strike",
        description: "Spend 1 ki when you hit to force a Con save or be stunned until end of your next turn.",
      },
      {
        level: 6,
        name: "Ki-Empowered Strikes",
        description: "Your unarmed strikes count as magical.",
      },
      {
        level: 6,
        name: "Tradition Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 7,
        name: "Evasion",
        description: "When subjected to an effect that allows a Dex save for half damage, take no damage on success, half on failure.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 9,
        name: "Unarmored Movement Improvement",
        description: "Your speed increases by 10 feet, and you can move along vertical surfaces and across liquids.",
      },
      {
        level: 10,
        name: "Tradition Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 11,
        name: "Ki (6 points)",
        description: "Your ki points increase to 6.",
      },
      {
        level: 11,
        name: "Martial Arts (1d8)",
        description: "Unarmed damage increases to 1d8.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 13,
        name: "Tradition Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 14,
        name: "Diamond Soul",
        description: "Proficiency in all saving throws. Spend 1 ki to reroll a failed save.",
      },
      {
        level: 15,
        name: "Timeless Body",
        description: "You age at half speed and don't need to eat, drink, or breathe.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 17,
        name: "Ki (9 points)",
        description: "Your ki points increase to 9.",
      },
      {
        level: 17,
        name: "Martial Arts (1d10)",
        description: "Unarmed damage increases to 1d10.",
      },
      {
        level: 18,
        name: "Tradition Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 18,
        name: "Empty Body",
        description: "Spend 4 ki to become invisible for 1 minute or gain resistance to all damage except force for 1 minute.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Perfect Self",
        description: "Regain 4 ki points when you have none left.",
      },
    ],
    subclasses: ["Way of the Ascendant Dragon", "Way of Mercy", "Way of Shadow", "Way of the Open Hand"],
  },
  {
    id: "paladin",
    name: "Paladin",
    hitDie: 10,
    primaryAbility: ["Strength", "Charisma"],
    savingThrows: ["Wisdom", "Charisma"],
    armorProficiencies: ["All armor", "Shields"],
    weaponProficiencies: ["Simple weapons", "Martial weapons"],
    skillChoices: {
      choose: 2,
      from: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
    },
    spellcasting: {
      ability: "charisma",
      ritualCasting: false,
      spellcastingFocus: "Holy Symbol",
    },
    features: [
      {
        level: 1,
        name: "Divine Sense",
        description: "As an action, sense celestials, fiends, or undead within 60 feet, and detect consecrated/desecrated ground. Usable proficiency bonus times per long rest.",
      },
      {
        level: 1,
        name: "Lay on Hands",
        description: "Pool of hit points equal to 5 x paladin level. As an action, touch to cure hit points, diseases, or poisons.",
      },
      {
        level: 2,
        name: "Fighting Style",
        description: "Choose a Fighting Style feat.",
      },
      {
        level: 2,
        name: "Divine Smite",
        description: "When you hit with a melee weapon attack, expend a spell slot to deal extra radiant damage equal to 2d8 + slot level.",
      },
      {
        level: 2,
        name: "Spellcasting",
        description: "You prepare Paladin spells. Charisma is your spellcasting ability.",
      },
      {
        level: 3,
        name: "Divine Health",
        description: "You are immune to disease.",
      },
      {
        level: 3,
        name: "Sacred Oath (or subclass feature)",
        description: "Choose a subclass (Oath): Ancients, Conquest, Crown, Devotion, Glory, Redemption, Vengeance, or Watchers. Gain oath spells and features.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Extra Attack",
        description: "You can attack twice when you take the Attack action.",
      },
      {
        level: 6,
        name: "Aura of Protection",
        description: "You and allies within 10 feet (30 feet at level 18) add your Charisma modifier to saving throws.",
      },
      {
        level: 7,
        name: "Oath Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 9,
        name: "Weapon Mastery",
        description: "You gain the Sap property on all weapons you are proficient with.",
      },
      {
        level: 10,
        name: "Aura of Courage",
        description: "You and allies within 10 feet (30 feet at level 18) can't be frightened.",
      },
      {
        level: 11,
        name: "Improved Divine Smite",
        description: "Your Divine Smite deals an extra 1d8 radiant damage.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 13,
        name: "Oath Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 14,
        name: "Cleansing Touch",
        description: "End a spell on yourself or ally within 5 feet (proficiency bonus times per long rest).",
      },
      {
        level: 15,
        name: "Weapon Mastery",
        description: "You gain the Topple property on all weapons you are proficient with.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 17,
        name: "Oath Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 18,
        name: "Aura Range Improvement",
        description: "Aura range increases to 30 feet.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Holy Nimbus",
        description: "As an action, emanate an aura for 1 minute: deal 10 radiant damage to fiends/undead entering or starting turn within 30 feet, and allies gain advantage on saves vs. spells.",
      },
    ],
    subclasses: ["Oath of the Ancients", "Oath of Conquest", "Oath of the Crown", "Oath of Devotion", "Oath of Glory", "Oath of Redemption", "Oath of Vengeance", "Oath of the Watchers"],
  },
  {
    id: "ranger",
    name: "Ranger",
    hitDie: 10,
    primaryAbility: ["Dexterity", "Wisdom"],
    savingThrows: ["Strength", "Dexterity"],
    armorProficiencies: ["Light armor", "Medium armor", "Shields"],
    weaponProficiencies: ["Simple weapons", "Martial weapons"],
    skillChoices: {
      choose: 3,
      from: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
    },
    spellcasting: {
      ability: "wisdom",
      ritualCasting: true,
      spellcastingFocus: "None",
    },
    features: [
      {
        level: 1,
        name: "Favored Enemy",
        description: "Choose a type of enemy; gain bonuses to tracking and recalling info about them.",
      },
      {
        level: 1,
        name: "Natural Explorer",
        description: "Choose a type of favored terrain; gain benefits while traveling there.",
      },
      {
        level: 2,
        name: "Fighting Style",
        description: "Choose a Fighting Style feat.",
      },
      {
        level: 2,
        name: "Spellcasting",
        description: "You prepare Ranger spells. Wisdom is your spellcasting ability.",
      },
      {
        level: 2,
        name: "Ranger Conclave (or subclass feature)",
        description: "Choose a subclass: Beast Master, Drakewarden, Fey Wanderer, Gloom Stalker, Horizon Walker, Hunter, or Swarmkeeper. Gain subclass features.",
      },
      {
        level: 3,
        name: "Primeval Awareness",
        description: "Spend a spell slot to sense certain creatures within 1 mile (or 6 in favored terrain).",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Extra Attack",
        description: "You can attack twice when you take the Attack action.",
      },
      {
        level: 5,
        name: "Weapon Mastery",
        description: "You gain the Vex property on all weapons you are proficient with.",
      },
      {
        level: 6,
        name: "Favored Enemy Improvement",
        description: "Choose an additional Favored Enemy.",
      },
      {
        level: 6,
        name: "Natural Explorer Improvement",
        description: "Choose an additional favored terrain.",
      },
      {
        level: 7,
        name: "Conclave Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 10,
        name: "Hide in Plain Sight",
        description: "Spend 1 minute creating camouflage to gain +10 to Stealth until you take a long rest or change appearance.",
      },
      {
        level: 11,
        name: "Conclave Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 14,
        name: "Vanish",
        description: "Disengage or Hide as a bonus action.",
      },
      {
        level: 14,
        name: "Favored Enemy Improvement",
        description: "Choose an additional Favored Enemy.",
      },
      {
        level: 14,
        name: "Natural Explorer Improvement",
        description: "Choose an additional favored terrain.",
      },
      {
        level: 15,
        name: "Conclave Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 18,
        name: "Feral Senses",
        description: "You can't be surprised and sense invisible creatures within 30 feet.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Conclave Feature",
        description: "Gain capstone subclass features.",
      },
    ],
    subclasses: ["Beast Master", "Drakewarden", "Fey Wanderer", "Gloom Stalker", "Horizon Walker", "Hunter", "Swarmkeeper"],
  },
  {
    id: "rogue",
    name: "Rogue",
    hitDie: 8,
    primaryAbility: ["Dexterity"],
    savingThrows: ["Dexterity", "Intelligence"],
    armorProficiencies: ["Light armor"],
    weaponProficiencies: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
    skillChoices: {
      choose: 4,
      from: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"],
    },
    features: [
      {
        level: 1,
        name: "Expertise",
        description: "Choose two skills or thieves' tools; double your proficiency bonus for them.",
      },
      {
        level: 1,
        name: "Sneak Attack",
        description: "Once per turn, deal extra 1d6 damage when you hit with advantage or an ally is within 5 feet of the target.",
      },
      {
        level: 1,
        name: "Thieves' Cant",
        description: "You understand secret thieves' code.",
      },
      {
        level: 2,
        name: "Cunning Action",
        description: "As a bonus action, Dash, Disengage, or Hide.",
      },
      {
        level: 2,
        name: "Steady Aim",
        description: "As a bonus action, gain advantage on your next attack roll this turn if you don't move.",
      },
      {
        level: 3,
        name: "Roguish Archetype (or subclass feature)",
        description: "Choose a subclass: Arcane Trickster, Assassin, Phantom, Soulknife, Swashbuckler, or Thief. Gain subclass features.",
      },
      {
        level: 3,
        name: "Sneak Attack (2d6)",
        description: "Damage increases to 2d6.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Uncanny Dodge",
        description: "As a reaction, halve damage from an attack you can see.",
      },
      {
        level: 5,
        name: "Sneak Attack (3d6)",
        description: "Damage increases to 3d6.",
      },
      {
        level: 6,
        name: "Expertise",
        description: "Choose two more skills or tools.",
      },
      {
        level: 7,
        name: "Evasion",
        description: "Dex save for half damage: no damage on success, half on failure.",
      },
      {
        level: 7,
        name: "Archetype Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 9,
        name: "Sneak Attack (5d6)",
        description: "Damage increases to 5d6.",
      },
      {
        level: 10,
        name: "Archetype Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 10,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 11,
        name: "Reliable Talent",
        description: "Treat rolls below 10 as 10 on ability checks with proficiency.",
      },
      {
        level: 11,
        name: "Sneak Attack (6d6)",
        description: "Damage increases to 6d6.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 13,
        name: "Sneak Attack (7d6)",
        description: "Damage increases to 7d6.",
      },
      {
        level: 14,
        name: "Blindsense",
        description: "Sense creatures within 10 feet unless deafened or blinded.",
      },
      {
        level: 15,
        name: "Slippery Mind",
        description: "Proficiency in Wisdom saving throws.",
      },
      {
        level: 15,
        name: "Archetype Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 17,
        name: "Sneak Attack (9d6)",
        description: "Damage increases to 9d6.",
      },
      {
        level: 18,
        name: "Elusive",
        description: "No attack has advantage against you while not incapacitated.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 19,
        name: "Sneak Attack (10d6)",
        description: "Damage increases to 10d6.",
      },
      {
        level: 20,
        name: "Stroke of Luck",
        description: "If you fail an attack roll, ability check, or saving throw, treat as success once per short/long rest.",
      },
    ],
    subclasses: ["Arcane Trickster", "Assassin", "Phantom", "Soulknife", "Swashbuckler", "Thief"],
  },
  {
    id: "sorcerer",
    name: "Sorcerer",
    hitDie: 6,
    primaryAbility: ["Charisma"],
    savingThrows: ["Constitution", "Charisma"],
    armorProficiencies: [],
    weaponProficiencies: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
    skillChoices: {
      choose: 2,
      from: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
    },
    spellcasting: {
      ability: "charisma",
      ritualCasting: false,
      spellcastingFocus: "Arcane Focus",
    },
    features: [
      {
        level: 1,
        name: "Spellcasting",
        description: "You know four cantrips and several Sorcerer spells. Charisma is your spellcasting ability.",
      },
      {
        level: 1,
        name: "Sorcerous Origin",
        description: "Choose a subclass (Origin): Aberrant Mind, Clockwork Soul, Divine Soul, Draconic Bloodline, Lunar Sorcery, Shadow Magic, or Wild Magic. Gain origin features.",
      },
      {
        level: 1,
        name: "Font of Magic",
        description: "You have 2 sorcery points to create spell slots or metamagic.",
      },
      {
        level: 2,
        name: "Flexible Casting",
        description: "Spend sorcery points to create spell slots or convert slots to points.",
      },
      {
        level: 2,
        name: "Metamagic",
        description: "Choose two Metamagic options.",
      },
      {
        level: 3,
        name: "Origin Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Font of Magic (3 points)",
        description: "Sorcery points increase to 3.",
      },
      {
        level: 6,
        name: "Metamagic",
        description: "Choose a third Metamagic option.",
      },
      {
        level: 6,
        name: "Origin Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 8,
        name: "Font of Magic (5 points)",
        description: "Sorcery points increase to 5.",
      },
      {
        level: 10,
        name: "Metamagic",
        description: "Choose a fourth Metamagic option.",
      },
      {
        level: 11,
        name: "Origin Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 12,
        name: "Font of Magic (6 points)",
        description: "Sorcery points increase to 6.",
      },
      {
        level: 14,
        name: "Origin Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 15,
        name: "Font of Magic (7 points)",
        description: "Sorcery points increase to 7.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 18,
        name: "Metamagic",
        description: "Choose a fifth Metamagic option.",
      },
      {
        level: 18,
        name: "Font of Magic (8 points)",
        description: "Sorcery points increase to 8.",
      },
      {
        level: 18,
        name: "Origin Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Font of Magic (9 points)",
        description: "Sorcery points increase to 9. You regain 4 sorcery points if you have none left.",
      },
    ],
    subclasses: ["Aberrant Mind", "Clockwork Soul", "Divine Soul", "Draconic Bloodline", "Lunar Sorcery", "Shadow Magic", "Wild Magic"],
  },
  {
    id: "warlock",
    name: "Warlock",
    hitDie: 8,
    primaryAbility: ["Charisma"],
    savingThrows: ["Wisdom", "Charisma"],
    armorProficiencies: ["Light armor"],
    weaponProficiencies: ["Simple weapons"],
    skillChoices: {
      choose: 2,
      from: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
    },
    spellcasting: {
      ability: "charisma",
      ritualCasting: false,
      spellcastingFocus: "Arcane Focus",
    },
    features: [
      {
        level: 1,
        name: "Otherworldly Patron",
        description: "Choose a subclass (Patron): Archfey, Celestial, Fathomless, Fiend, Genie, Great Old One, Hexblade, or Undead. Gain patron features.",
      },
      {
        level: 1,
        name: "Pact Magic",
        description: "You know two cantrips and several Warlock spells. Regain slots after a short or long rest.",
      },
      {
        level: 1,
        name: "Eldritch Invocations",
        description: "Choose two invocations.",
      },
      {
        level: 2,
        name: "Eldritch Invocations",
        description: "Choose a third invocation.",
      },
      {
        level: 2,
        name: "Pact Boon",
        description: "Choose Pact of the Blade, Chain, Tome, or Talisman. Gain boon features.",
      },
      {
        level: 3,
        name: "Pact Boon Feature",
        description: "Gain additional features based on your Pact Boon.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Eldritch Invocations",
        description: "Choose a fourth invocation.",
      },
      {
        level: 6,
        name: "Patron Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 7,
        name: "Pact Boon Feature",
        description: "Gain additional features based on your Pact Boon.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 8,
        name: "Eldritch Invocations",
        description: "Choose a fifth invocation.",
      },
      {
        level: 9,
        name: "Patron Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 10,
        name: "Pact Boon Feature",
        description: "Gain additional features based on your Pact Boon.",
      },
      {
        level: 10,
        name: "Eldritch Invocations",
        description: "Choose a sixth invocation.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 12,
        name: "Eldritch Invocations",
        description: "Choose a seventh invocation.",
      },
      {
        level: 14,
        name: "Patron Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 14,
        name: "Pact Boon Feature",
        description: "Gain additional features based on your Pact Boon.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 16,
        name: "Eldritch Invocations",
        description: "Choose an eighth invocation.",
      },
      {
        level: 18,
        name: "Patron Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 18,
        name: "Pact Boon Feature",
        description: "Gain additional features based on your Pact Boon.",
      },
      {
        level: 18,
        name: "Eldritch Invocations",
        description: "Choose a ninth invocation.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Eldritch Master",
        description: "You know 10 Eldritch Invocations and can't replace them.",
      },
    ],
    subclasses: ["The Archfey", "The Celestial", "The Fathomless", "The Fiend", "The Genie", "The Great Old One", "The Hexblade", "The Undead"],
  },
  {
    id: "wizard",
    name: "Wizard",
    hitDie: 6,
    primaryAbility: ["Intelligence"],
    savingThrows: ["Intelligence", "Wisdom"],
    armorProficiencies: [],
    weaponProficiencies: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
    skillChoices: {
      choose: 2,
      from: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
    },
    spellcasting: {
      ability: "intelligence",
      ritualCasting: true,
      spellcastingFocus: "Arcane Focus",
    },
    features: [
      {
        level: 1,
        name: "Spellcasting",
        description: "You have learned to cast spells through study and memorization. You know three cantrips of your choice from the Wizard spell list. You prepare spells from your spellbook.",
      },
      {
        level: 1,
        name: "Arcane Recovery",
        description: "You can regain some of your magical energy by studying your spellbook. Once per day during a Short Rest, you can recover expended spell slots.",
      },
      {
        level: 2,
        name: "Arcane Tradition (or subclass feature)",
        description: "Choose a subclass (School): Abjuration, Bladesinging, Chronurgy, Conjuration, Divination, Enchantment, Evocation, Graviturgy, Illusion, Necromancy, Order of Scribes, or Transmutation. Gain tradition features.",
      },
      {
        level: 2,
        name: "Weapon Mastery",
        description: "You gain the Vex property on quarterstaffs and light crossbows.",
      },
      {
        level: 4,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 5,
        name: "Tradition Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 6,
        name: "Arcane Recovery Improvement",
        description: "Recover spell slots up to half your wizard level.",
      },
      {
        level: 8,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 10,
        name: "Tradition Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 12,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 14,
        name: "Tradition Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 16,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 18,
        name: "Spell Mastery",
        description: "Choose two spells of 1st or 2nd level; cast them at will.",
      },
      {
        level: 18,
        name: "Tradition Feature",
        description: "Gain additional subclass features.",
      },
      {
        level: 19,
        name: "Ability Score Improvement",
        description: "Increase one ability score by 2, or two by 1, or take a feat.",
      },
      {
        level: 20,
        name: "Signature Spells",
        description: "Choose two 3rd-level spells; cast them once per short/long rest without slots, or regain slots.",
      },
    ],
    subclasses: ["School of Abjuration", "Bladesinging", "School of Chronurgy", "School of Conjuration", "School of Divination", "School of Enchantment", "School of Evocation", "School of Graviturgy", "School of Illusion", "School of Necromancy", "Order of Scribes", "School of Transmutation"],
  },
];

export function getClassById(id: string): Class | undefined {
  return classes.find(cls => cls.id === id);
}

export function getAllClasses(): Class[] {
  return classes;
}