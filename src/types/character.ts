/**
 * @fileoverview Type definitions for player character management.
 * Supports D&D 5e character sheets with plans for other game systems.
 */

/**
 * Supported tabletop RPG game systems.
 * Currently only D&D 5e is fully implemented.
 */
export type GameSystem = "dnd5e" | "dragonbane" | "cyberpunk";

/**
 * The six core ability scores for D&D 5e characters.
 * Values typically range from 3-20 for player characters.
 */
export interface DnD5eAbilityScores {
  /** Physical power (melee attacks, carrying capacity) */
  strength: number;
  /** Agility and reflexes (AC, Dex saves, initiative) */
  dexterity: number;
  /** Endurance and health (hit points, Con saves) */
  constitution: number;
  /** Reasoning and memory (wizard spellcasting) */
  intelligence: number;
  /** Perception and insight (cleric/druid spellcasting) */
  wisdom: number;
  /** Force of personality (social skills, bard/warlock spellcasting) */
  charisma: number;
}

/**
 * Available equipment slots for worn/wielded items.
 * Items can be equipped to one slot at a time.
 */
export type EquipmentSlot =
  | "mainHand"
  | "offHand"
  | "armor"
  | "helmet"
  | "cloak"
  | "boots"
  | "ring1"
  | "ring2"
  | "amulet"
  | "none";

/**
 * An item in the character's inventory.
 * Tracks quantity, weight, and equipped status.
 */
export interface InventoryItem {
  /** Unique identifier for this item instance (UUID) */
  id: string;
  /** Optional reference back to compendium item ID */
  sourceItemId?: string;
  /** Optional compendium item type */
  sourceItemType?: "weapon" | "armor" | "adventuringGear";
  /** Display name of the item */
  name: string;
  /** Number of this item carried */
  quantity: number;
  /** Weight per individual item (in pounds) */
  weight: number;
  /** Optional description or notes about the item */
  description?: string;
  /** Whether the item is currently equipped */
  equipped: boolean;
  /** Which slot the item occupies when equipped */
  equipmentSlot?: EquipmentSlot;
}

/**
 * Skill proficiency levels for D&D 5e.
 * Determines bonus added to skill checks.
 */
export type SkillProficiencyLevel = "none" | "proficient" | "expert";

/**
 * Map of skill names to proficiency levels.
 * Key is the skill name (e.g., "Stealth", "Perception").
 */
export interface SkillProficiency {
  [key: string]: SkillProficiencyLevel;
}

/**
 * Map of ability names to saving throw proficiency.
 * Key is ability name, value is whether proficient.
 */
export interface SavingThrowProficiency {
  [key: string]: boolean;
}

/**
 * Spell slot availability for each spell level (1-9).
 * Tracks current remaining and maximum slots.
 */
export interface SpellSlots {
  level1: { current: number; max: number };
  level2: { current: number; max: number };
  level3: { current: number; max: number };
  level4: { current: number; max: number };
  level5: { current: number; max: number };
  level6: { current: number; max: number };
  level7: { current: number; max: number };
  level8: { current: number; max: number };
  level9: { current: number; max: number };
}

/**
 * A spell prepared or known by the character.
 * Contains all information needed to cast the spell.
 */
export interface PreparedSpell {
  /** Unique identifier for this prepared spell (UUID) */
  id: string;
  /** Optional reference back to compendium spell ID */
  sourceSpellId?: string;
  /** Name of the spell */
  name: string;
  /** Spell level (0 for cantrips, 1-9 for leveled spells) */
  level: number;
  /** School of magic (e.g., "Evocation", "Necromancy") */
  school: string;
  /** Time required to cast (e.g., "1 action", "1 minute") */
  castingTime: string;
  /** Spell range (e.g., "60 feet", "Self", "Touch") */
  range: string;
  /** Required components: V (verbal), S (somatic), M (material) */
  components: string;
  /** How long the spell effect lasts */
  duration: string;
  /** Full description of the spell's effects */
  description: string;
}

/**
 * Death saving throw tracker for unconscious characters.
 * Three successes stabilize; three failures result in death.
 */
export interface DeathSaves {
  /** Number of successful death saves (0-3) */
  successes: number;
  /** Number of failed death saves (0-3) */
  failures: number;
}

/**
 * D&D 5e status conditions using standard capitalization.
 * @see ConditionType in combat.ts for lowercase version used in combat
 */
export type Condition =
  | "Blinded"
  | "Charmed"
  | "Deafened"
  | "Frightened"
  | "Grappled"
  | "Incapacitated"
  | "Invisible"
  | "Paralyzed"
  | "Petrified"
  | "Poisoned"
  | "Prone"
  | "Restrained"
  | "Stunned"
  | "Unconscious"
  | "Exhaustion";

/**
 * Complete D&D 5e character sheet data.
 * Contains all character information needed for play.
 */
export interface DnD5eCharacter {
  /** Unique identifier for this character (UUID) */
  id: string;
  /** Optional canonical class ID from compendium */
  classId?: string;
  /** Optional canonical race/species ID from compendium */
  raceId?: string;
  /** Character's display name */
  name: string;
  /** Character's race (e.g., "Human", "Elf", "Dwarf") */
  race: string;
  /** Character's class (e.g., "Fighter", "Wizard") */
  class: string;
  /** Character level (1-20) */
  level: number;
  /** The six core ability scores */
  abilityScores: DnD5eAbilityScores;
  /** Character's moral/ethical alignment (optional) */
  alignment?: string;
  /** Character's background (e.g., "Soldier", "Noble") */
  background?: string;
  /** Current experience points toward next level */
  experiencePoints: number;
  /** Current and maximum hit points */
  hitPoints: {
    current: number;
    max: number;
  };
  /** Hit dice available for short rest healing */
  hitDice?: {
    current: number;
    max: number;
  };
  /** Death saving throw progress when at 0 HP */
  deathSaves?: DeathSaves;
  /** Active status conditions */
  conditions?: Condition[];
  /** Exhaustion level (0-6, 6 = death) */
  exhaustionLevel?: number;
  /** Items carried by the character */
  inventory: InventoryItem[];
  /** Skill proficiencies and expertise */
  skills?: SkillProficiency;
  /** Saving throw proficiencies by ability */
  savingThrows?: SavingThrowProficiency;
  /** Available spell slots by level */
  spellSlots?: SpellSlots;
  /** Spells currently prepared/known */
  preparedSpells?: PreparedSpell[];
  /** Which ability score governs spellcasting */
  spellcastingAbility?: keyof DnD5eAbilityScores;
}

/**
 * Top-level character wrapper supporting multiple game systems.
 * Contains metadata and the system-specific character data.
 */
export interface Character {
  /** Unique identifier for this character (UUID) */
  id: string;
  /** Which game system this character uses */
  system: GameSystem;
  /** ISO 8601 timestamp of character creation */
  createdAt: string;
  /** ISO 8601 timestamp of last modification */
  updatedAt: string;
  /** System-specific character data (currently D&D 5e only) */
  data: DnD5eCharacter;
}
