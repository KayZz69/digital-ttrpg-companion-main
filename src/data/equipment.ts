import { Weapon, Armor, AdventuringGear } from "./types";

/**
 * D&D 5e Equipment.
 *
 * Generated from local 5etools JSON export (PHB source list).
 */

export const weapons: Weapon[] = [
  {
    "id": "battleaxe",
    "name": "Battleaxe",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d8",
      "type": "slashing"
    },
    "properties": [
      "Versatile (1d10)"
    ],
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 4
  },
  {
    "id": "blowgun",
    "name": "Blowgun",
    "type": "weapon",
    "category": "martial",
    "weaponType": "ranged",
    "damage": {
      "dice": "1",
      "type": "piercing"
    },
    "properties": [
      "Ammunition",
      "Loading"
    ],
    "range": {
      "normal": 25,
      "long": 100
    },
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 1
  },
  {
    "id": "club",
    "name": "Club",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d4",
      "type": "bludgeoning"
    },
    "properties": [
      "Light"
    ],
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 2
  },
  {
    "id": "dagger",
    "name": "Dagger",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d4",
      "type": "piercing"
    },
    "properties": [
      "Finesse",
      "Light",
      "Thrown (20/60)"
    ],
    "range": {
      "normal": 20,
      "long": 60
    },
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "dart",
    "name": "Dart",
    "type": "weapon",
    "category": "simple",
    "weaponType": "ranged",
    "damage": {
      "dice": "1d4",
      "type": "piercing"
    },
    "properties": [
      "Finesse",
      "Thrown (20/60)"
    ],
    "range": {
      "normal": 20,
      "long": 60
    },
    "cost": {
      "quantity": 5,
      "unit": "cp"
    },
    "weight": 0.25
  },
  {
    "id": "flail",
    "name": "Flail",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d8",
      "type": "bludgeoning"
    },
    "properties": [],
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 2
  },
  {
    "id": "glaive",
    "name": "Glaive",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d10",
      "type": "slashing"
    },
    "properties": [
      "Heavy",
      "Reach",
      "Two-Handed"
    ],
    "cost": {
      "quantity": 2,
      "unit": "pp"
    },
    "weight": 6
  },
  {
    "id": "greataxe",
    "name": "Greataxe",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d12",
      "type": "slashing"
    },
    "properties": [
      "Heavy",
      "Two-Handed"
    ],
    "cost": {
      "quantity": 3,
      "unit": "pp"
    },
    "weight": 7
  },
  {
    "id": "greatclub",
    "name": "Greatclub",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d8",
      "type": "bludgeoning"
    },
    "properties": [
      "Two-Handed"
    ],
    "cost": {
      "quantity": 2,
      "unit": "sp"
    },
    "weight": 10
  },
  {
    "id": "greatsword",
    "name": "Greatsword",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "2d6",
      "type": "slashing"
    },
    "properties": [
      "Heavy",
      "Two-Handed"
    ],
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 6
  },
  {
    "id": "halberd",
    "name": "Halberd",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d10",
      "type": "slashing"
    },
    "properties": [
      "Heavy",
      "Reach",
      "Two-Handed"
    ],
    "cost": {
      "quantity": 2,
      "unit": "pp"
    },
    "weight": 6
  },
  {
    "id": "hand-crossbow",
    "name": "Hand Crossbow",
    "type": "weapon",
    "category": "martial",
    "weaponType": "ranged",
    "damage": {
      "dice": "1d6",
      "type": "piercing"
    },
    "properties": [
      "Ammunition",
      "Light",
      "Loading"
    ],
    "range": {
      "normal": 30,
      "long": 120
    },
    "cost": {
      "quantity": 75,
      "unit": "gp"
    },
    "weight": 3
  },
  {
    "id": "handaxe",
    "name": "Handaxe",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d6",
      "type": "slashing"
    },
    "properties": [
      "Light",
      "Thrown (20/60)"
    ],
    "range": {
      "normal": 20,
      "long": 60
    },
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "heavy-crossbow",
    "name": "Heavy Crossbow",
    "type": "weapon",
    "category": "martial",
    "weaponType": "ranged",
    "damage": {
      "dice": "1d10",
      "type": "piercing"
    },
    "properties": [
      "Ammunition",
      "Heavy",
      "Loading",
      "Two-Handed"
    ],
    "range": {
      "normal": 100,
      "long": 400
    },
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 18
  },
  {
    "id": "javelin",
    "name": "Javelin",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d6",
      "type": "piercing"
    },
    "properties": [
      "Thrown (30/120)"
    ],
    "range": {
      "normal": 30,
      "long": 120
    },
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 2
  },
  {
    "id": "lance",
    "name": "Lance",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d12",
      "type": "piercing"
    },
    "properties": [
      "Reach",
      "S"
    ],
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 6,
    "description": "You have disadvantage when you use a lance to attack a target within 5 feet of you. Also, a lance requires two hands to wield when you aren't mounted."
  },
  {
    "id": "light-crossbow",
    "name": "Light Crossbow",
    "type": "weapon",
    "category": "simple",
    "weaponType": "ranged",
    "damage": {
      "dice": "1d8",
      "type": "piercing"
    },
    "properties": [
      "Ammunition",
      "Loading",
      "Two-Handed"
    ],
    "range": {
      "normal": 80,
      "long": 320
    },
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 5
  },
  {
    "id": "light-hammer",
    "name": "Light Hammer",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d4",
      "type": "bludgeoning"
    },
    "properties": [
      "Light",
      "Thrown (20/60)"
    ],
    "range": {
      "normal": 20,
      "long": 60
    },
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "longbow",
    "name": "Longbow",
    "type": "weapon",
    "category": "martial",
    "weaponType": "ranged",
    "damage": {
      "dice": "1d8",
      "type": "piercing"
    },
    "properties": [
      "Ammunition",
      "Heavy",
      "Two-Handed"
    ],
    "range": {
      "normal": 150,
      "long": 600
    },
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 2
  },
  {
    "id": "longsword",
    "name": "Longsword",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d8",
      "type": "slashing"
    },
    "properties": [
      "Versatile (1d10)"
    ],
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 3
  },
  {
    "id": "mace",
    "name": "Mace",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d6",
      "type": "bludgeoning"
    },
    "properties": [],
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 4
  },
  {
    "id": "maul",
    "name": "Maul",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "2d6",
      "type": "bludgeoning"
    },
    "properties": [
      "Heavy",
      "Two-Handed"
    ],
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 10
  },
  {
    "id": "morningstar",
    "name": "Morningstar",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d8",
      "type": "piercing"
    },
    "properties": [],
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 4
  },
  {
    "id": "net",
    "name": "Net",
    "type": "weapon",
    "category": "martial",
    "weaponType": "ranged",
    "damage": {
      "dice": "",
      "type": ""
    },
    "properties": [
      "S",
      "Thrown (5/15)"
    ],
    "range": {
      "normal": 5,
      "long": 15
    },
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 3,
    "description": "A Large or smaller creature hit by a net is restrained until it is freed. A net has no effect on creatures that are formless, or creatures that are Huge or larger. A creature can use its action to make a 10 Strength check, freeing itself or another creature within its reach on a success. Dealing 5 slashing damage to the net (AC 10) also frees the creature without harming it, ending the effect and destroying the net. When you use an action, bonus action, or reaction to attack with a net, you can make only one attack regardless of the number of attacks you can normally make."
  },
  {
    "id": "pike",
    "name": "Pike",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d10",
      "type": "piercing"
    },
    "properties": [
      "Heavy",
      "Reach",
      "Two-Handed"
    ],
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 18
  },
  {
    "id": "quarterstaff",
    "name": "Quarterstaff",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d6",
      "type": "bludgeoning"
    },
    "properties": [
      "Versatile (1d8)"
    ],
    "cost": {
      "quantity": 2,
      "unit": "sp"
    },
    "weight": 4
  },
  {
    "id": "rapier",
    "name": "Rapier",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d8",
      "type": "piercing"
    },
    "properties": [
      "Finesse"
    ],
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "scimitar",
    "name": "Scimitar",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d6",
      "type": "slashing"
    },
    "properties": [
      "Finesse",
      "Light"
    ],
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 3
  },
  {
    "id": "shortbow",
    "name": "Shortbow",
    "type": "weapon",
    "category": "simple",
    "weaponType": "ranged",
    "damage": {
      "dice": "1d6",
      "type": "piercing"
    },
    "properties": [
      "Ammunition",
      "Two-Handed"
    ],
    "range": {
      "normal": 80,
      "long": 320
    },
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "shortsword",
    "name": "Shortsword",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d6",
      "type": "piercing"
    },
    "properties": [
      "Finesse",
      "Light"
    ],
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 2
  },
  {
    "id": "sickle",
    "name": "Sickle",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d4",
      "type": "slashing"
    },
    "properties": [
      "Light"
    ],
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "sling",
    "name": "Sling",
    "type": "weapon",
    "category": "simple",
    "weaponType": "ranged",
    "damage": {
      "dice": "1d4",
      "type": "bludgeoning"
    },
    "properties": [
      "Ammunition"
    ],
    "range": {
      "normal": 30,
      "long": 120
    },
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "spear",
    "name": "Spear",
    "type": "weapon",
    "category": "simple",
    "weaponType": "melee",
    "damage": {
      "dice": "1d6",
      "type": "piercing"
    },
    "properties": [
      "Thrown (20/60)",
      "Versatile (1d8)"
    ],
    "range": {
      "normal": 20,
      "long": 60
    },
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 3
  },
  {
    "id": "trident",
    "name": "Trident",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d6",
      "type": "piercing"
    },
    "properties": [
      "Thrown (20/60)",
      "Versatile (1d8)"
    ],
    "range": {
      "normal": 20,
      "long": 60
    },
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 4
  },
  {
    "id": "war-pick",
    "name": "War Pick",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d8",
      "type": "piercing"
    },
    "properties": [],
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "warhammer",
    "name": "Warhammer",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d8",
      "type": "bludgeoning"
    },
    "properties": [
      "Versatile (1d10)"
    ],
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "whip",
    "name": "Whip",
    "type": "weapon",
    "category": "martial",
    "weaponType": "melee",
    "damage": {
      "dice": "1d4",
      "type": "slashing"
    },
    "properties": [
      "Finesse",
      "Reach"
    ],
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 3
  }
];

export const armor: Armor[] = [
  {
    "id": "breastplate",
    "name": "Breastplate",
    "type": "armor",
    "category": "medium",
    "armorClass": "14 + Dex modifier (max 2)",
    "cost": {
      "quantity": 40,
      "unit": "pp"
    },
    "weight": 20,
    "description": "This armor consists of a fitted metal chest piece worn with supple leather. Although it leaves the legs and arms relatively unprotected, this armor provides good protection for the wearer's vital organs while leaving the wearer relatively unencumbered."
  },
  {
    "id": "chain-mail",
    "name": "Chain Mail",
    "type": "armor",
    "category": "heavy",
    "armorClass": "16",
    "stealthDisadvantage": true,
    "strengthRequirement": 13,
    "cost": {
      "quantity": 75,
      "unit": "gp"
    },
    "weight": 55,
    "description": "Made of interlocking metal rings, chain mail includes a layer of quilted fabric worn underneath the mail to prevent chafing and to cushion the impact of blows. The suit includes gauntlets."
  },
  {
    "id": "chain-shirt",
    "name": "Chain Shirt",
    "type": "armor",
    "category": "medium",
    "armorClass": "13 + Dex modifier (max 2)",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 20,
    "description": "Made of interlocking metal rings, a chain shirt is worn between layers of clothing or leather. This armor offers modest protection to the wearer's upper body and allows the sound of the rings rubbing against one another to be muffled by outer layers."
  },
  {
    "id": "half-plate-armor",
    "name": "Half Plate Armor",
    "type": "armor",
    "category": "medium",
    "armorClass": "15 + Dex modifier (max 2)",
    "stealthDisadvantage": true,
    "cost": {
      "quantity": 75,
      "unit": "pp"
    },
    "weight": 40,
    "description": "Half plate consists of shaped metal plates that cover most of the wearer's body. It does not include leg protection beyond simple greaves that are attached with leather straps."
  },
  {
    "id": "hide-armor",
    "name": "Hide Armor",
    "type": "armor",
    "category": "medium",
    "armorClass": "12 + Dex modifier (max 2)",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 12,
    "description": "This crude armor consists of thick furs and pelts. It is commonly worn by barbarian tribes, evil humanoids, and other folk who lack access to the tools and materials needed to create better armor."
  },
  {
    "id": "leather-armor",
    "name": "Leather Armor",
    "type": "armor",
    "category": "light",
    "armorClass": "11 + Dex modifier",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 10,
    "description": "The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil. The rest of the armor is made of softer and more flexible materials."
  },
  {
    "id": "padded-armor",
    "name": "Padded Armor",
    "type": "armor",
    "category": "light",
    "armorClass": "11 + Dex modifier",
    "stealthDisadvantage": true,
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 8,
    "description": "Padded armor consists of quilted layers of cloth and batting."
  },
  {
    "id": "plate-armor",
    "name": "Plate Armor",
    "type": "armor",
    "category": "heavy",
    "armorClass": "18",
    "stealthDisadvantage": true,
    "strengthRequirement": 15,
    "cost": {
      "quantity": 150,
      "unit": "pp"
    },
    "weight": 65,
    "description": "Plate consists of shaped, interlocking metal plates to cover the entire body. A suit of plate includes gauntlets, heavy leather boots, a visored helmet, and thick layers of padding underneath the armor. Buckles and straps distribute the weight over the body."
  },
  {
    "id": "ring-mail",
    "name": "Ring Mail",
    "type": "armor",
    "category": "heavy",
    "armorClass": "14",
    "stealthDisadvantage": true,
    "cost": {
      "quantity": 3,
      "unit": "pp"
    },
    "weight": 40,
    "description": "This armor is leather armor with heavy rings sewn into it. The rings help reinforce the armor against blows from swords and axes. Ring mail is inferior to chain mail, and it's usually worn only by those who can't afford better armor."
  },
  {
    "id": "scale-mail",
    "name": "Scale Mail",
    "type": "armor",
    "category": "medium",
    "armorClass": "14 + Dex modifier (max 2)",
    "stealthDisadvantage": true,
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 45,
    "description": "This armor consists of a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish. The suit includes gauntlets."
  },
  {
    "id": "splint-armor",
    "name": "Splint Armor",
    "type": "armor",
    "category": "heavy",
    "armorClass": "17",
    "stealthDisadvantage": true,
    "strengthRequirement": 15,
    "cost": {
      "quantity": 20,
      "unit": "pp"
    },
    "weight": 60,
    "description": "This armor is made of narrow vertical strips of metal riveted to a backing of leather that is worn over cloth padding. Flexible chain mail protects the joints."
  },
  {
    "id": "studded-leather-armor",
    "name": "Studded Leather Armor",
    "type": "armor",
    "category": "light",
    "armorClass": "12 + Dex modifier",
    "cost": {
      "quantity": 45,
      "unit": "gp"
    },
    "weight": 13,
    "description": "Made from tough but flexible leather, studded leather is reinforced with close-set rivets or spikes."
  }
];

export const adventuringGear: AdventuringGear[] = [
  {
    "id": "abacus-g",
    "name": "Abacus",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "acid-vial-g",
    "name": "Acid (vial)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 1,
    "description": "As an action, you can splash the contents of this vial onto a creature within 5 feet of you or throw the vial up to 20 feet, shattering it on impact. In either case, make a ranged attack against a creature or object, treating the acid as an improvised weapon. On a hit, the target takes 2d6 acid damage."
  },
  {
    "id": "alchemists-fire-flask-g",
    "name": "Alchemist's Fire (flask)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 1,
    "description": "This sticky, adhesive fluid ignites when exposed to air. As an action, you can throw this flask up to 20 feet, shattering it on impact. Make a ranged attack against a creature or object, treating the alchemist's fire as an improvised weapon. On a hit, the target takes 1d4 fire damage at the start of each of its turns. A creature can end this damage by using its action to make a 10 Dexterity check to extinguish the flames."
  },
  {
    "id": "alchemists-supplies-at",
    "name": "Alchemist's Supplies",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 8
  },
  {
    "id": "ale-gallon-fd",
    "name": "Ale (gallon)",
    "type": "adventuringGear",
    "category": "foodDrink",
    "cost": {
      "quantity": 2,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "ale-mug-fd",
    "name": "Ale (mug)",
    "type": "adventuringGear",
    "category": "foodDrink",
    "cost": {
      "quantity": 4,
      "unit": "cp"
    },
    "weight": 0
  },
  {
    "id": "amulet-scf",
    "name": "Amulet",
    "type": "adventuringGear",
    "category": "spellcastingFocus",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "antitoxin-vial-g",
    "name": "Antitoxin (vial)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 0,
    "description": "A creature that drinks this vial of liquid gains advantage on saving throws against poison for 1 hour. It confers no benefit to undead or constructs."
  },
  {
    "id": "backpack-g",
    "name": "Backpack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 5,
    "description": "A backpack can hold one cubic foot or 30 pounds of gear. You can also strap items, such as a bedroll or a coil of rope, to the outside of a backpack."
  },
  {
    "id": "ball-bearing-g",
    "name": "Ball Bearing",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 0.1,
      "unit": "cp"
    },
    "weight": 0.002,
    "description": "Most commonly found inside a Ball Bearings (Bag of 1,000)."
  },
  {
    "id": "ball-bearings-bag-of-1-000-g",
    "name": "Ball Bearings (bag of 1,000)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 2,
    "description": "As an action, you can spill these tiny metal balls from their pouch to cover a level area 10 feet square. A creature moving across the covered area must succeed on a 10 Dexterity saving throw or fall prone. A creature moving through the area at half speed doesn't need to make the saving throw."
  },
  {
    "id": "barrel-g",
    "name": "Barrel",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 70,
    "description": "A barrel can hold 40 gallons of liquid or 4 cubic feet of solids."
  },
  {
    "id": "basic-poison-vial-g",
    "name": "Basic Poison (vial)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 10,
      "unit": "pp"
    },
    "weight": 0,
    "description": "You can use the poison in this vial to coat one slashing or piercing weapon or up to three pieces of ammunition. Applying the poison takes an action. A creature hit by the poisoned weapon or ammunition must make a 10 Constitution saving throw or take 1d4 poison damage. Once applied, the poison retains potency for 1 minute before drying."
  },
  {
    "id": "basket-g",
    "name": "Basket",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 4,
      "unit": "sp"
    },
    "weight": 2,
    "description": "A basket holds 2 cubic feet or 40 pounds of gear."
  },
  {
    "id": "bedroll-g",
    "name": "Bedroll",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 7
  },
  {
    "id": "bell-g",
    "name": "Bell",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "bit-and-bridle-tah",
    "name": "Bit and bridle",
    "type": "adventuringGear",
    "category": "tackHarness",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "blanket-g",
    "name": "Blanket",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 3
  },
  {
    "id": "block-and-tackle-g",
    "name": "Block and Tackle",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 5,
    "description": "A set of pulleys with a cable threaded through them and a hook to attach to objects, a block and tackle allows you to hoist up to four times the weight you can normally lift."
  },
  {
    "id": "book-g",
    "name": "Book",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 5,
    "description": "A book might contain poetry, historical accounts, information pertaining to a particular field of lore, diagrams and notes on gnomish contraptions, or just about anything else that can be represented using text or pictures. A book of spells is a spellbook."
  },
  {
    "id": "brewers-supplies-at",
    "name": "Brewer's Supplies",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 2,
      "unit": "pp"
    },
    "weight": 9
  },
  {
    "id": "bucket-g",
    "name": "Bucket",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "cp"
    },
    "weight": 2,
    "description": "A bucket holds 3 gallons of liquid or ½ cubic foot of solids."
  },
  {
    "id": "bullseye-lantern-g",
    "name": "Bullseye Lantern",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 2,
    "description": "A bullseye lantern casts bright light in a 60-foot cone and dim light for an additional 60 feet. Once lit, it burns for 6 hours on a flask (1 pint) of oil."
  },
  {
    "id": "burglars-pack-g",
    "name": "Burglar's Pack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 16,
      "unit": "gp"
    },
    "weight": 44.5,
    "description": "Includes: a backpack; a Ball Bearings (Bag of 1,000); 10 feet of string; a bell; 5 candle; a crowbar; a hammer; 10 piton; a hooded lantern; 2 Oil (flask); 5 days Rations (1 day); a tinderbox; a waterskin; Hempen Rope (50 feet)"
  },
  {
    "id": "calligraphers-supplies-at",
    "name": "Calligrapher's Supplies",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 5
  },
  {
    "id": "caltrop-g",
    "name": "Caltrop",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "cp"
    },
    "weight": 0.1,
    "description": "As an action, you can spread a single bag of caltrops to cover a 5-foot-square area. Any creature that enters the area must succeed on a 15 Dexterity saving throw or stop moving and take 1 piercing damage. Until the creature regains at least 1 hit point, its walking speed is reduced by 10 feet. A creature moving through the area at half speed doesn't need to make the saving throw."
  },
  {
    "id": "caltrops-bag-of-20-g",
    "name": "Caltrops (bag of 20)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 2,
    "description": "As an action, you can spread a single bag of caltrops to cover a 5-foot-square area. Any creature that enters the area must succeed on a 15 Dexterity saving throw or stop moving and take 1 piercing damage. Until the creature regains at least 1 hit point, its walking speed is reduced by 10 feet. A creature moving through the area at half speed doesn't need to make the saving throw."
  },
  {
    "id": "camel-mnt",
    "name": "Camel",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "candle-g",
    "name": "Candle",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "cp"
    },
    "weight": 0,
    "description": "For 1 hour, a candle sheds bright light in a 5-foot radius and dim light for an additional 5 feet."
  },
  {
    "id": "canvas-1-sq-yd-tg",
    "name": "Canvas (1 sq. yd.)",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "carpenters-tools-at",
    "name": "Carpenter's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 8,
      "unit": "gp"
    },
    "weight": 6
  },
  {
    "id": "carriage-veh",
    "name": "Carriage",
    "type": "adventuringGear",
    "category": "vehicle",
    "cost": {
      "quantity": 10,
      "unit": "pp"
    },
    "weight": 600
  },
  {
    "id": "cart-veh",
    "name": "Cart",
    "type": "adventuringGear",
    "category": "vehicle",
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 200
  },
  {
    "id": "cartographers-tools-at",
    "name": "Cartographer's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 6
  },
  {
    "id": "chain-10-feet-g",
    "name": "Chain (10 feet)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 10,
    "description": "A chain has 10 hit points. It can be burst with a successful 20 Strength check."
  },
  {
    "id": "chalk-1-piece-g",
    "name": "Chalk (1 piece)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "cp"
    },
    "weight": 0
  },
  {
    "id": "chariot-veh",
    "name": "Chariot",
    "type": "adventuringGear",
    "category": "vehicle",
    "cost": {
      "quantity": 25,
      "unit": "pp"
    },
    "weight": 100
  },
  {
    "id": "chest-g",
    "name": "Chest",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 25,
    "description": "A chest holds 12 cubic feet or 300 pounds of gear."
  },
  {
    "id": "chicken-tg",
    "name": "Chicken",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 0
  },
  {
    "id": "chunk-of-meat-fd",
    "name": "Chunk of Meat",
    "type": "adventuringGear",
    "category": "foodDrink",
    "cost": {
      "quantity": 3,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "cinnamon-tg",
    "name": "Cinnamon",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "climbers-kit-g",
    "name": "Climber's Kit",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 12,
    "description": "A climber's kit includes special pitons, boot tips, gloves, and a harness. You can use the climber's kit as an action to anchor yourself; when you do, you can't fall more than 25 feet from the point where you anchored yourself, and you can't climb more than 25 feet away from that point without undoing the anchor."
  },
  {
    "id": "cloves-tg",
    "name": "Cloves",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 3,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "cobblers-tools-at",
    "name": "Cobbler's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 5
  },
  {
    "id": "common-clothes-g",
    "name": "Common Clothes",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 3
  },
  {
    "id": "common-wine-pitcher-fd",
    "name": "Common Wine (pitcher)",
    "type": "adventuringGear",
    "category": "foodDrink",
    "cost": {
      "quantity": 2,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "component-pouch-g",
    "name": "Component Pouch",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 2,
    "description": "A component pouch is a small, watertight leather belt pouch that has compartments to hold all the material components and other special items you need to cast your spells, except for those components that have a specific cost (as indicated in a spell's description)."
  },
  {
    "id": "cooks-utensils-at",
    "name": "Cook's Utensils",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 8
  },
  {
    "id": "copper-tg",
    "name": "Copper",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 1
  },
  {
    "id": "copper-cp-c",
    "name": "Copper (cp)",
    "type": "adventuringGear",
    "category": "coin",
    "cost": {
      "quantity": 1,
      "unit": "cp"
    },
    "weight": 0.02,
    "description": "Common coins come in several different denominations based on the relative worth of the metal from which they are made. The three most common coins are the gold piece (gp), the silver piece (sp), and the copper piece (cp). With one gold piece, a character can buy a belt pouch, 50 feet of good rope, or a goat. A skilled (but not exceptional) artisan can earn one gold piece a day. The gold piece is the standard unit of measure for wealth, even if the coin itself is not commonly used. When merchants discuss deals that involve goods or services worth hundreds or thousands of gold pieces, the transactions don't usually involve the exchange of individual coins. Rather, the gold piece is a standard measure of value, and the actual exchange is in gold bars, letters of credit, or valuable goods. One gold piece is worth ten silver pieces, the most prevalent coin among commoners. A silver piece buys a laborer's work for a day, a flask of lamp oil, or a night's rest in a poor inn. One silver piece is worth ten copper pieces, which are common among laborers and beggars. A single copper piece buys a candle, a torch, or a piece of chalk. In addition, unusual coins made of other precious metals sometimes appear in treasure hoards. The electrum piece (ep) and the platinum piece (pp) originate from fallen empires and lost kingdoms, and they sometimes arouse suspicion and skepticism when used in transactions. An electrum piece is worth five silver pieces, and a platinum piece is worth ten gold pieces. A standard coin weighs about a third of an ounce, so fifty coins weigh a pound."
  },
  {
    "id": "costume-clothes-g",
    "name": "Costume Clothes",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 4
  },
  {
    "id": "cotton-cloth-1-sq-yd-tg",
    "name": "Cotton Cloth (1 sq. yd.)",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "cow-tg",
    "name": "Cow",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "crossbow-bolt-case-g",
    "name": "Crossbow Bolt Case",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 1,
    "description": "This wooden case can hold up to twenty crossbow bolt."
  },
  {
    "id": "crowbar-g",
    "name": "Crowbar",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 5,
    "description": "Using a crowbar grants advantage to Strength checks where the crowbar's leverage can be applied."
  },
  {
    "id": "dice-set-gs",
    "name": "Dice Set",
    "type": "adventuringGear",
    "category": "gamingSet",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "diplomats-pack-g",
    "name": "Diplomat's Pack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 39,
      "unit": "gp"
    },
    "weight": 36,
    "description": "Includes: a chest; 2 Map or Scroll Case; a set of fine clothes; a Ink (1-ounce bottle); an ink pen; a lamp; 2 Oil (flask); 5 Paper (one sheet); a Perfume (vial); sealing wax; soap"
  },
  {
    "id": "disguise-kit-t",
    "name": "Disguise Kit",
    "type": "adventuringGear",
    "category": "tool",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 3,
    "description": "This pouch of cosmetics, hair dye, and small props lets you create disguises that change your physical appearance. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to create a visual disguise."
  },
  {
    "id": "donkey-mnt",
    "name": "Donkey",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 8,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "draft-horse-mnt",
    "name": "Draft Horse",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "dragonchess-set-gs",
    "name": "Dragonchess Set",
    "type": "adventuringGear",
    "category": "gamingSet",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 0.5
  },
  {
    "id": "dungeoneers-pack-g",
    "name": "Dungeoneer's Pack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 12,
      "unit": "gp"
    },
    "weight": 61.5,
    "description": "Includes: a backpack; a crowbar; a hammer; 10 piton; 10 torch; a tinderbox; 10 days of Rations (1 day); a waterskin; Hempen Rope (50 feet)"
  },
  {
    "id": "electrum-ep-c",
    "name": "Electrum (ep)",
    "type": "adventuringGear",
    "category": "coin",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 0.02,
    "description": "Common coins come in several different denominations based on the relative worth of the metal from which they are made. The three most common coins are the gold piece (gp), the silver piece (sp), and the copper piece (cp). With one gold piece, a character can buy a belt pouch, 50 feet of good rope, or a goat. A skilled (but not exceptional) artisan can earn one gold piece a day. The gold piece is the standard unit of measure for wealth, even if the coin itself is not commonly used. When merchants discuss deals that involve goods or services worth hundreds or thousands of gold pieces, the transactions don't usually involve the exchange of individual coins. Rather, the gold piece is a standard measure of value, and the actual exchange is in gold bars, letters of credit, or valuable goods. One gold piece is worth ten silver pieces, the most prevalent coin among commoners. A silver piece buys a laborer's work for a day, a flask of lamp oil, or a night's rest in a poor inn. One silver piece is worth ten copper pieces, which are common among laborers and beggars. A single copper piece buys a candle, a torch, or a piece of chalk. In addition, unusual coins made of other precious metals sometimes appear in treasure hoards. The electrum piece (ep) and the platinum piece (pp) originate from fallen empires and lost kingdoms, and they sometimes arouse suspicion and skepticism when used in transactions. An electrum piece is worth five silver pieces, and a platinum piece is worth ten gold pieces. A standard coin weighs about a third of an ounce, so fifty coins weigh a pound."
  },
  {
    "id": "elephant-mnt",
    "name": "Elephant",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 20,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "emblem-scf",
    "name": "Emblem",
    "type": "adventuringGear",
    "category": "spellcastingFocus",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "entertainers-pack-g",
    "name": "Entertainer's Pack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 4,
      "unit": "pp"
    },
    "weight": 38,
    "description": "Includes: a backpack; a bedroll; 2 Costume Clothes; 5 candle; 5 days of Rations (1 day); a waterskin; a disguise kit"
  },
  {
    "id": "exotic-saddle-tah",
    "name": "Exotic Saddle",
    "type": "adventuringGear",
    "category": "tackHarness",
    "cost": {
      "quantity": 6,
      "unit": "pp"
    },
    "weight": 40,
    "description": "An exotic saddle is required for riding any aquatic or flying mount."
  },
  {
    "id": "explorers-pack-g",
    "name": "Explorer's Pack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 59,
    "description": "Includes: a backpack; a bedroll; a mess kit; a tinderbox; 10 torch; 10 days of Rations (1 day); a waterskin; Hempen Rope (50 feet)"
  },
  {
    "id": "feed-per-day-tah",
    "name": "Feed (per day)",
    "type": "adventuringGear",
    "category": "tackHarness",
    "cost": {
      "quantity": 5,
      "unit": "cp"
    },
    "weight": 10
  },
  {
    "id": "fine-clothes-g",
    "name": "Fine Clothes",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 6
  },
  {
    "id": "fine-wine-bottle-fd",
    "name": "Fine Wine (bottle)",
    "type": "adventuringGear",
    "category": "foodDrink",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "fishing-tackle-g",
    "name": "Fishing Tackle",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 4,
    "description": "This kit includes a wooden rod, silken line, corkwood bobbers, steel hooks, lead sinkers, velvet lures, and narrow netting."
  },
  {
    "id": "flask-g",
    "name": "Flask",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 1,
    "description": "A flask holds 1 pint of liquid."
  },
  {
    "id": "flour-tg",
    "name": "Flour",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 1
  },
  {
    "id": "forgery-kit-t",
    "name": "Forgery Kit",
    "type": "adventuringGear",
    "category": "tool",
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 5,
    "description": "This small box contains a variety of papers and parchments, pens and inks, seals and sealing wax, gold and silver leaf, and other supplies necessary to create convincing forgeries of physical documents. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to create a physical forgery of a document."
  },
  {
    "id": "ginger-tg",
    "name": "Ginger",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "glass-bottle-g",
    "name": "Glass Bottle",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 2,
    "description": "A bottle holds 1½ pints of liquid."
  },
  {
    "id": "glassblowers-tools-at",
    "name": "Glassblower's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 3,
      "unit": "pp"
    },
    "weight": 5
  },
  {
    "id": "goat-tg",
    "name": "Goat",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "gold-tg",
    "name": "Gold",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 1
  },
  {
    "id": "gold-gp-c",
    "name": "Gold (gp)",
    "type": "adventuringGear",
    "category": "coin",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 0.02,
    "description": "Common coins come in several different denominations based on the relative worth of the metal from which they are made. The three most common coins are the gold piece (gp), the silver piece (sp), and the copper piece (cp). With one gold piece, a character can buy a belt pouch, 50 feet of good rope, or a goat. A skilled (but not exceptional) artisan can earn one gold piece a day. The gold piece is the standard unit of measure for wealth, even if the coin itself is not commonly used. When merchants discuss deals that involve goods or services worth hundreds or thousands of gold pieces, the transactions don't usually involve the exchange of individual coins. Rather, the gold piece is a standard measure of value, and the actual exchange is in gold bars, letters of credit, or valuable goods. One gold piece is worth ten silver pieces, the most prevalent coin among commoners. A silver piece buys a laborer's work for a day, a flask of lamp oil, or a night's rest in a poor inn. One silver piece is worth ten copper pieces, which are common among laborers and beggars. A single copper piece buys a candle, a torch, or a piece of chalk. In addition, unusual coins made of other precious metals sometimes appear in treasure hoards. The electrum piece (ep) and the platinum piece (pp) originate from fallen empires and lost kingdoms, and they sometimes arouse suspicion and skepticism when used in transactions. An electrum piece is worth five silver pieces, and a platinum piece is worth ten gold pieces. A standard coin weighs about a third of an ounce, so fifty coins weigh a pound."
  },
  {
    "id": "grappling-hook-g",
    "name": "Grappling Hook",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 4
  },
  {
    "id": "hammer-g",
    "name": "Hammer",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 3
  },
  {
    "id": "healers-kit-g",
    "name": "Healer's Kit",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 3,
    "description": "This kit is a leather pouch containing bandages, salves, and splints. The kit has ten uses. As an action, you can expend one use of the kit to stabilize a creature that has 0 hit points, without needing to make a Wisdom (Medicine) check."
  },
  {
    "id": "hempen-rope-50-feet-g",
    "name": "Hempen Rope (50 feet)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 10,
    "description": "Rope, whether made of hemp or silk, has 2 hit points and can be burst with a 17 Strength check."
  },
  {
    "id": "herbalism-kit-t",
    "name": "Herbalism Kit",
    "type": "adventuringGear",
    "category": "tool",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 3,
    "description": "This kit contains a variety of instruments such as clippers, mortar and pestle, and pouches and vials used by herbalists to create remedies and potions. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to identify or apply herbs. Also, proficiency with this kit is required to create antitoxin and potions of healing."
  },
  {
    "id": "holy-water-flask-g",
    "name": "Holy Water (flask)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 1,
    "description": "As an action, you can splash the contents of this flask onto a creature within 5 feet of you or throw it up to 20 feet, shattering it on impact. In either case, make a ranged attack against a target creature, treating the holy water as an improvised weapon. If the target is a fiend or undead, it takes 2d6 radiant damage. A cleric or paladin may create holy water by performing a special ritual. The ritual takes 1 hour to perform, uses 25 gp worth of powdered silver, and requires the caster to expend a 1st-level spell slot."
  },
  {
    "id": "hooded-lantern-g",
    "name": "Hooded Lantern",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 2,
    "description": "A hooded lantern casts bright light in a 30-foot radius and dim light for an additional 30 feet. Once lit, it burns for 6 hours on a flask (1 pint) of oil. As an action, you can lower the hood, reducing the light to dim light in a 5-foot radius."
  },
  {
    "id": "hourglass-g",
    "name": "Hourglass",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "hunk-of-cheese-fd",
    "name": "Hunk of Cheese",
    "type": "adventuringGear",
    "category": "foodDrink",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "hunting-trap-g",
    "name": "Hunting Trap",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 25,
    "description": "When you use your action to set it, this trap forms a saw-toothed steel ring that snaps shut when a creature steps on a pressure plate in the center. The trap is affixed by a heavy chain to an immobile object, such as a tree or a spike driven into the ground. A creature that steps on the plate must succeed on a 13 Dexterity saving throw or take 1d4 piercing damage and stop moving. Thereafter, until the creature breaks free of the trap, its movement is limited by the length of the chain (typically 3 feet long). A creature can use its action to make a 13 Strength check, freeing itself or another creature within its reach on a success. Each failed check deals 1 piercing damage to the trapped creature."
  },
  {
    "id": "ink-1-ounce-bottle-g",
    "name": "Ink (1-ounce bottle)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "ink-pen-g",
    "name": "Ink Pen",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 0
  },
  {
    "id": "iron-tg",
    "name": "Iron",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 1
  },
  {
    "id": "iron-pot-g",
    "name": "Iron Pot",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 10,
    "description": "An iron pot holds 1 gallon of liquid."
  },
  {
    "id": "iron-spike-g",
    "name": "Iron Spike",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 0.5
  },
  {
    "id": "iron-spikes-10-g",
    "name": "Iron Spikes (10)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 5,
    "description": "Contains: 10 x iron spike."
  },
  {
    "id": "jewelers-tools-at",
    "name": "Jeweler's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "jug-g",
    "name": "Jug",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 4,
    "description": "A jug holds 1 gallon of liquid."
  },
  {
    "id": "ladder-10-foot-g",
    "name": "Ladder (10-foot)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 25,
    "description": "Ladder (10-foot)"
  },
  {
    "id": "lamp-g",
    "name": "Lamp",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 1,
    "description": "A lamp casts bright light in a 15-foot radius and dim light for an additional 30 feet. Once lit, it burns for 6 hours on a flask (1 pint) of oil."
  },
  {
    "id": "leatherworkers-tools-at",
    "name": "Leatherworker's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 5
  },
  {
    "id": "linen-1-sq-yd-tg",
    "name": "Linen (1 sq. yd.)",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "loaf-of-bread-fd",
    "name": "Loaf of Bread",
    "type": "adventuringGear",
    "category": "foodDrink",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 0
  },
  {
    "id": "lock-g",
    "name": "Lock",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 1,
    "description": "A key is provided with the lock. Without the key, a creature proficient with thieves' tools can pick this lock with a successful 15 Dexterity check. Your DM may decide that better locks are available for higher prices."
  },
  {
    "id": "magnifying-glass-g",
    "name": "Magnifying Glass",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 10,
      "unit": "pp"
    },
    "weight": 0,
    "description": "This lens allows a closer look at small objects. It is also useful as a substitute for flint and steel when starting fires. Lighting a fire with a magnifying glass requires light as bright as sunlight to focus, tinder to ignite, and about 5 minutes for the fire to ignite. A magnifying glass grants advantage on any ability check made to appraise or inspect an item that is small or highly detailed."
  },
  {
    "id": "manacles-g",
    "name": "Manacles",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 6,
    "description": "These metal restraints can bind a Small or Medium creature. Escaping the manacles requires a successful 20 Dexterity check. Breaking them requires a successful 20 Strength check. Each set of manacles comes with one key. Without the key, a creature proficient with thieves' tools can pick the manacles' lock with a successful 15 Dexterity check. Manacles have 15 hit points."
  },
  {
    "id": "map-or-scroll-case-g",
    "name": "Map or Scroll Case",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 1,
    "description": "This cylindrical leather case can hold up to ten rolled-up paper (one sheet) or five rolled-up parchment (one sheet)."
  },
  {
    "id": "masons-tools-at",
    "name": "Mason's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 8
  },
  {
    "id": "mastiff-mnt",
    "name": "Mastiff",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "merchants-scale-g",
    "name": "Merchant's Scale",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 3,
    "description": "A scale includes a small balance, pans, and a suitable assortment of weights up to 2 pounds. With it, you can measure the exact weight of small objects, such as raw precious metals or trade goods, to help determine their worth."
  },
  {
    "id": "mess-kit-g",
    "name": "Mess Kit",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "sp"
    },
    "weight": 1,
    "description": "This tin box contains a cup and simple cutlery. The box clamps together, and one side can be used as a cooking pan and the other as a plate or shallow bowl."
  },
  {
    "id": "military-saddle-tah",
    "name": "Military Saddle",
    "type": "adventuringGear",
    "category": "tackHarness",
    "cost": {
      "quantity": 2,
      "unit": "pp"
    },
    "weight": 30,
    "description": "A military saddle braces the rider, helping you keep your seat on an active mount in battle. It gives you advantage on any check you make to remain mounted."
  },
  {
    "id": "miners-pick-g",
    "name": "Miner's Pick",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 10
  },
  {
    "id": "mule-mnt",
    "name": "Mule",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 8,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "navigators-tools-t",
    "name": "Navigator's Tools",
    "type": "adventuringGear",
    "category": "tool",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 2,
    "description": "This set of instruments is used for navigation at sea. Proficiency with navigator's tools lets you chart a ship's course and follow navigation charts. In addition, these tools allow you to add your proficiency bonus to any ability check you make to avoid getting lost at sea."
  },
  {
    "id": "oil-flask-g",
    "name": "Oil (flask)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 1,
    "description": "Oil usually comes in a clay flask that holds 1 pint. As an action, you can splash the oil in this flask onto a creature within 5 feet of you or throw it up to 20 feet, shattering it on impact. Make a ranged attack against a target creature or object, treating the oil as an improvised weapon. On a hit, the target is covered in oil. If the target takes any fire damage before the oil dries (after 1 minute), the target takes an additional 5 fire damage from the burning oil. You can also pour a flask of oil on the ground to cover a 5-foot-square area, provided that the surface is level. If lit, the oil burns for 2 rounds and deals 5 fire damage to any creature that enters the area or ends its turn in the area. A creature can take this damage only once per turn."
  },
  {
    "id": "ox-tg",
    "name": "Ox",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "pack-saddle-tah",
    "name": "Pack Saddle",
    "type": "adventuringGear",
    "category": "tackHarness",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 15
  },
  {
    "id": "painters-supplies-at",
    "name": "Painter's Supplies",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 5
  },
  {
    "id": "paper-one-sheet-g",
    "name": "Paper (one sheet)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "parchment-one-sheet-g",
    "name": "Parchment (one sheet)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "pepper-tg",
    "name": "Pepper",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "perfume-vial-g",
    "name": "Perfume (vial)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "pig-tg",
    "name": "Pig",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 3,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "pitcher-g",
    "name": "Pitcher",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 4,
    "description": "A pitcher holds 1 gallon of liquid."
  },
  {
    "id": "piton-g",
    "name": "Piton",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "cp"
    },
    "weight": 0.25
  },
  {
    "id": "platinum-tg",
    "name": "Platinum",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 50,
      "unit": "pp"
    },
    "weight": 1
  },
  {
    "id": "platinum-pp-c",
    "name": "Platinum (pp)",
    "type": "adventuringGear",
    "category": "coin",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 0.02,
    "description": "Common coins come in several different denominations based on the relative worth of the metal from which they are made. The three most common coins are the gold piece (gp), the silver piece (sp), and the copper piece (cp). With one gold piece, a character can buy a belt pouch, 50 feet of good rope, or a goat. A skilled (but not exceptional) artisan can earn one gold piece a day. The gold piece is the standard unit of measure for wealth, even if the coin itself is not commonly used. When merchants discuss deals that involve goods or services worth hundreds or thousands of gold pieces, the transactions don't usually involve the exchange of individual coins. Rather, the gold piece is a standard measure of value, and the actual exchange is in gold bars, letters of credit, or valuable goods. One gold piece is worth ten silver pieces, the most prevalent coin among commoners. A silver piece buys a laborer's work for a day, a flask of lamp oil, or a night's rest in a poor inn. One silver piece is worth ten copper pieces, which are common among laborers and beggars. A single copper piece buys a candle, a torch, or a piece of chalk. In addition, unusual coins made of other precious metals sometimes appear in treasure hoards. The electrum piece (ep) and the platinum piece (pp) originate from fallen empires and lost kingdoms, and they sometimes arouse suspicion and skepticism when used in transactions. An electrum piece is worth five silver pieces, and a platinum piece is worth ten gold pieces. A standard coin weighs about a third of an ounce, so fifty coins weigh a pound."
  },
  {
    "id": "playing-card-set-gs",
    "name": "Playing Card Set",
    "type": "adventuringGear",
    "category": "gamingSet",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "poisoners-kit-t",
    "name": "Poisoner's Kit",
    "type": "adventuringGear",
    "category": "tool",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 2,
    "description": "A poisoner's kit includes the vials, chemicals, and other equipment necessary for the creation of poisons. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to craft or use poisons. Additionally, the Crafting and Harvesting Poison rules require the use of a poisoner's kit."
  },
  {
    "id": "pole-10-foot-g",
    "name": "Pole (10-foot)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "cp"
    },
    "weight": 7
  },
  {
    "id": "pony-mnt",
    "name": "Pony",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 3,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "portable-ram-g",
    "name": "Portable Ram",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 4,
      "unit": "gp"
    },
    "weight": 35,
    "description": "You can use a portable ram to break down doors. When doing so, you gain a +4 bonus on the Strength check. One other character can help you use the ram, giving you advantage on this check."
  },
  {
    "id": "potters-tools-at",
    "name": "Potter's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 3
  },
  {
    "id": "pouch-g",
    "name": "Pouch",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 1,
    "description": "A cloth or leather pouch can hold up to 20 sling bullet or 50 blowgun needle, among other things. A compartmentalized pouch for holding spell components is called a component pouch. A pouch can hold up to ⅕ cubic foot or 6 pounds of gear."
  },
  {
    "id": "priests-pack-g",
    "name": "Priest's Pack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 19,
      "unit": "gp"
    },
    "weight": 24,
    "description": "Includes: a backpack; a blanket; 10 candle; a tinderbox; an alms box; 2 blocks of incense; a censer; vestments; 2 days of Rations (1 day); a waterskin."
  },
  {
    "id": "quiver-g",
    "name": "Quiver",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 1,
    "description": "A quiver can hold up to 20 arrow."
  },
  {
    "id": "rations-1-day-g",
    "name": "Rations (1 day)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 2,
    "description": "Rations consist of dry foods suitable for extended travel, including jerky, dried fruit, hardtack, and nuts."
  },
  {
    "id": "reliquary-scf",
    "name": "Reliquary",
    "type": "adventuringGear",
    "category": "spellcastingFocus",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 2
  },
  {
    "id": "riding-horse-mnt",
    "name": "Riding Horse",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 75,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "riding-saddle-tah",
    "name": "Riding Saddle",
    "type": "adventuringGear",
    "category": "tackHarness",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 25
  },
  {
    "id": "robes-g",
    "name": "Robes",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 4
  },
  {
    "id": "sack-g",
    "name": "Sack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "cp"
    },
    "weight": 0.5,
    "description": "A sack can hold up to 1 cubic foot or 30 pounds of gear."
  },
  {
    "id": "saddlebags-tah",
    "name": "Saddlebags",
    "type": "adventuringGear",
    "category": "tackHarness",
    "cost": {
      "quantity": 4,
      "unit": "gp"
    },
    "weight": 8
  },
  {
    "id": "saffron-tg",
    "name": "Saffron",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 15,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "salt-tg",
    "name": "Salt",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 5,
      "unit": "cp"
    },
    "weight": 1
  },
  {
    "id": "scholars-pack-g",
    "name": "Scholar's Pack",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 4,
      "unit": "pp"
    },
    "weight": 10,
    "description": "Includes: a backpack; a book of lore; a Ink (1-ounce bottle); an ink pen; 10 Parchment (one sheet); a little bag of sand; a small knife."
  },
  {
    "id": "sealing-wax-g",
    "name": "Sealing Wax",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "sheep-tg",
    "name": "Sheep",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "shovel-g",
    "name": "Shovel",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 5
  },
  {
    "id": "signal-whistle-g",
    "name": "Signal Whistle",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "cp"
    },
    "weight": 0
  },
  {
    "id": "signet-ring-g",
    "name": "Signet Ring",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "silk-1-sq-yd-tg",
    "name": "Silk (1 sq. yd.)",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "silk-rope-50-feet-g",
    "name": "Silk Rope (50 feet)",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 5,
    "description": "Rope, whether made of hemp or silk, has 2 hit points and can be burst with a 17 Strength check."
  },
  {
    "id": "silver-tg",
    "name": "Silver",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 1
  },
  {
    "id": "silver-sp-c",
    "name": "Silver (sp)",
    "type": "adventuringGear",
    "category": "coin",
    "cost": {
      "quantity": 1,
      "unit": "sp"
    },
    "weight": 0.02,
    "description": "Common coins come in several different denominations based on the relative worth of the metal from which they are made. The three most common coins are the gold piece (gp), the silver piece (sp), and the copper piece (cp). With one gold piece, a character can buy a belt pouch, 50 feet of good rope, or a goat. A skilled (but not exceptional) artisan can earn one gold piece a day. The gold piece is the standard unit of measure for wealth, even if the coin itself is not commonly used. When merchants discuss deals that involve goods or services worth hundreds or thousands of gold pieces, the transactions don't usually involve the exchange of individual coins. Rather, the gold piece is a standard measure of value, and the actual exchange is in gold bars, letters of credit, or valuable goods. One gold piece is worth ten silver pieces, the most prevalent coin among commoners. A silver piece buys a laborer's work for a day, a flask of lamp oil, or a night's rest in a poor inn. One silver piece is worth ten copper pieces, which are common among laborers and beggars. A single copper piece buys a candle, a torch, or a piece of chalk. In addition, unusual coins made of other precious metals sometimes appear in treasure hoards. The electrum piece (ep) and the platinum piece (pp) originate from fallen empires and lost kingdoms, and they sometimes arouse suspicion and skepticism when used in transactions. An electrum piece is worth five silver pieces, and a platinum piece is worth ten gold pieces. A standard coin weighs about a third of an ounce, so fifty coins weigh a pound."
  },
  {
    "id": "sled-veh",
    "name": "Sled",
    "type": "adventuringGear",
    "category": "vehicle",
    "cost": {
      "quantity": 2,
      "unit": "pp"
    },
    "weight": 300
  },
  {
    "id": "sledgehammer-g",
    "name": "Sledgehammer",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 10
  },
  {
    "id": "smiths-tools-at",
    "name": "Smith's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 2,
      "unit": "pp"
    },
    "weight": 8
  },
  {
    "id": "soap-g",
    "name": "Soap",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 0
  },
  {
    "id": "spellbook-g",
    "name": "Spellbook",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 3,
    "description": "Essential for wizards, a spellbook is a leather-bound tome with 100 blank vellum pages suitable for recording spells."
  },
  {
    "id": "sprig-of-mistletoe-scf",
    "name": "Sprig of Mistletoe",
    "type": "adventuringGear",
    "category": "spellcastingFocus",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "spyglass-g",
    "name": "Spyglass",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 100,
      "unit": "pp"
    },
    "weight": 1,
    "description": "Objects viewed through a spyglass are magnified to twice their size."
  },
  {
    "id": "stabling-per-day-tah",
    "name": "Stabling (per day)",
    "type": "adventuringGear",
    "category": "tackHarness",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 0
  },
  {
    "id": "steel-mirror-g",
    "name": "Steel Mirror",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "gp"
    },
    "weight": 0.5
  },
  {
    "id": "tankard-g",
    "name": "Tankard",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "cp"
    },
    "weight": 1,
    "description": "A tankard holds 1 pint of liquid."
  },
  {
    "id": "thieves-tools-t",
    "name": "Thieves' Tools",
    "type": "adventuringGear",
    "category": "tool",
    "cost": {
      "quantity": 25,
      "unit": "gp"
    },
    "weight": 1,
    "description": "This set of tools includes a small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers. Proficiency with these tools lets you add your proficiency bonus to any ability checks you make to disarm traps or open locks."
  },
  {
    "id": "three-dragon-ante-set-gs",
    "name": "Three-Dragon Ante Set",
    "type": "adventuringGear",
    "category": "gamingSet",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "tinderbox-g",
    "name": "Tinderbox",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 5,
      "unit": "sp"
    },
    "weight": 1,
    "description": "This small container holds flint, fire steel, and tinder (usually dry cloth soaked in light oil) used to kindle a fire. Using it to light a torch-or anything else with abundant, exposed fuel-takes an action. Lighting any other fire takes 1 minute."
  },
  {
    "id": "tinkers-tools-at",
    "name": "Tinker's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 5,
      "unit": "pp"
    },
    "weight": 10
  },
  {
    "id": "torch-g",
    "name": "Torch",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "cp"
    },
    "weight": 1,
    "description": "A torch burns for 1 hour, providing bright light in a 20-foot radius and dim light for an additional 20 feet. If you make a melee attack with a burning torch and hit, it deals 1 fire damage."
  },
  {
    "id": "totem-scf",
    "name": "Totem",
    "type": "adventuringGear",
    "category": "spellcastingFocus",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 0
  },
  {
    "id": "travelers-clothes-g",
    "name": "Traveler's Clothes",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 4
  },
  {
    "id": "trinket-g",
    "name": "Trinket",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 0,
      "unit": "pp"
    },
    "weight": 0,
    "description": "When you make your character, you can roll once on the Trinkets table to gain a trinket, a simple item lightly touched by mystery. The DM might also use this table. It can help stock a room in a dungeon or fill a creatures pockets."
  },
  {
    "id": "two-person-tent-g",
    "name": "Two-Person Tent",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "gp"
    },
    "weight": 20,
    "description": "A simple and portable canvas shelter, a tent sleeps two."
  },
  {
    "id": "vial-g",
    "name": "Vial",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 0,
    "description": "A vial can hold up to 4 ounces of liquid."
  },
  {
    "id": "wagon-veh",
    "name": "Wagon",
    "type": "adventuringGear",
    "category": "vehicle",
    "cost": {
      "quantity": 35,
      "unit": "gp"
    },
    "weight": 400
  },
  {
    "id": "warhorse-mnt",
    "name": "Warhorse",
    "type": "adventuringGear",
    "category": "mount",
    "cost": {
      "quantity": 40,
      "unit": "pp"
    },
    "weight": 0
  },
  {
    "id": "waterskin-g",
    "name": "Waterskin",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 2,
      "unit": "sp"
    },
    "weight": 5,
    "description": "A waterskin can hold up to 4 pints of liquid."
  },
  {
    "id": "weavers-tools-at",
    "name": "Weaver's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 5
  },
  {
    "id": "wheat-tg",
    "name": "Wheat",
    "type": "adventuringGear",
    "category": "tradeGood",
    "cost": {
      "quantity": 1,
      "unit": "cp"
    },
    "weight": 1
  },
  {
    "id": "whetstone-g",
    "name": "Whetstone",
    "type": "adventuringGear",
    "category": "adventuring",
    "cost": {
      "quantity": 1,
      "unit": "cp"
    },
    "weight": 1
  },
  {
    "id": "woodcarvers-tools-at",
    "name": "Woodcarver's Tools",
    "type": "adventuringGear",
    "category": "artisanTool",
    "cost": {
      "quantity": 1,
      "unit": "gp"
    },
    "weight": 5
  },
  {
    "id": "yew-wand-scf",
    "name": "Yew Wand",
    "type": "adventuringGear",
    "category": "spellcastingFocus",
    "cost": {
      "quantity": 1,
      "unit": "pp"
    },
    "weight": 1
  }
];

export function getWeaponById(id: string): Weapon | undefined {
  return weapons.find(w => w.id === id);
}

export function getArmorById(id: string): Armor | undefined {
  return armor.find(a => a.id === id);
}

export function getGearById(id: string): AdventuringGear | undefined {
  return adventuringGear.find(g => g.id === id);
}

export function getAllWeapons(): Weapon[] {
  return weapons;
}

export function getAllArmor(): Armor[] {
  return armor;
}

export function getAllAdventuringGear(): AdventuringGear[] {
  return adventuringGear;
}
