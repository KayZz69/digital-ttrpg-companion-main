/**
 * @fileoverview 2024 D&D 5e skill rules implementation.
 *
 * Implements a skills registry for skill proficiency mechanics based on the
 * 2024 Player's Handbook.
 *
 * All skill data references the 2024 PHB:
 *   - Skill list and abilities: 2024 PHB Chapter 1, "Skills"
 *   - Class skill choices: 2024 PHB, each class section
 *   - Expertise: 2024 PHB, Bard and Rogue class features
 *
 * This module exports only pure functions — no classes, no side effects.
 * Import getSkillsRegistry() to obtain the registry object.
 */

import {
  getClassSkillChoices,
  getClassExpertiseSelectionCount,
} from "@/lib/dndCompendium";

// ---------------------------------------------------------------------------
// Skill definitions (2024 PHB)
// ---------------------------------------------------------------------------

/**
 * A skill with its governing ability and a brief description.
 * @see 2024 PHB — Chapter 1, "Skills"
 */
export interface SkillDefinition {
  readonly name: string;
  readonly ability: string;
  readonly description: string;
}

/**
 * Complete list of 18 skills with ability associations and descriptions.
 * @see 2024 PHB — Chapter 1, "Skills" table
 */
const SKILL_DEFINITIONS: ReadonlyArray<SkillDefinition> = [
  { name: "Acrobatics", ability: "dexterity", description: "Stay on your feet in tricky situations or perform acrobatic stunts" },
  { name: "Animal Handling", ability: "wisdom", description: "Calm down a domesticated animal, keep a mount from getting spooked, or intuit an animal's intentions" },
  { name: "Arcana", ability: "intelligence", description: "Recall lore about spells, magic items, eldritch symbols, and magical traditions" },
  { name: "Athletics", ability: "strength", description: "Climb, jump, or swim in difficult circumstances" },
  { name: "Deception", ability: "charisma", description: "Convincingly hide the truth through words or actions" },
  { name: "History", ability: "intelligence", description: "Recall lore about historical events, legendary people, and ancient kingdoms" },
  { name: "Insight", ability: "wisdom", description: "Determine the true intentions of a creature" },
  { name: "Intimidation", ability: "charisma", description: "Influence someone through overt threats, hostile actions, and physical violence" },
  { name: "Investigation", ability: "intelligence", description: "Look for clues and make deductions based on those clues" },
  { name: "Medicine", ability: "wisdom", description: "Stabilize a dying companion or diagnose an illness" },
  { name: "Nature", ability: "intelligence", description: "Recall lore about terrain, plants, animals, and weather" },
  { name: "Perception", ability: "wisdom", description: "Spot, hear, or otherwise detect the presence of something" },
  { name: "Performance", ability: "charisma", description: "Delight an audience with music, dance, acting, or storytelling" },
  { name: "Persuasion", ability: "charisma", description: "Influence someone with tact, social graces, or good nature" },
  { name: "Religion", ability: "intelligence", description: "Recall lore about deities, rites, prayers, and religious hierarchies" },
  { name: "Sleight of Hand", ability: "dexterity", description: "Pick a pocket, conceal a handheld object, or perform legerdemain" },
  { name: "Stealth", ability: "dexterity", description: "Conceal yourself from enemies, slink past guards, or slip away" },
  { name: "Survival", ability: "wisdom", description: "Follow tracks, hunt, guide your group, forage, find water, or endure the wilderness" },
];

// ---------------------------------------------------------------------------
// ClassSkillRule
// ---------------------------------------------------------------------------

/**
 * Skill proficiency rules for a specific class.
 */
export interface ClassSkillRule {
  readonly classId: string;
  /** Number of skills the class can choose */
  readonly skillChoiceCount: number;
  /** Which skills the class can choose from */
  readonly availableSkills: ReadonlyArray<string>;
  /** Number of expertise selections at a given level */
  readonly expertiseSlots: number;
}

// ---------------------------------------------------------------------------
// Registry interface
// ---------------------------------------------------------------------------

/**
 * Contract for the skills rules registry.
 */
export interface SkillsRegistry {
  getClassSkillRules(classId: string): ClassSkillRule | null;
  getSkillDefinitions(): ReadonlyArray<SkillDefinition>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes a class identifier for case-insensitive lookup.
 */
function normalizeClassId(classId: string): string {
  return classId.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Public rule functions (exported for direct use / testing)
// ---------------------------------------------------------------------------

/**
 * Returns the skill proficiency rules for a class at a given level.
 * Returns null for unknown classes (classes with 0 skill choices).
 *
 * @pure
 * @param classId — class identifier (case-insensitive)
 * @param level   — character level, defaults to 1
 */
export function getRegistryClassSkillRules(
  classId: string,
  level: number = 1,
): ClassSkillRule | null {
  const id = normalizeClassId(classId);
  if (!id) return null;

  const choices = getClassSkillChoices(id);
  if (choices.choose === 0 && choices.from.length === 0) return null;

  const expertiseSlots = getClassExpertiseSelectionCount(id, level);

  return {
    classId: id,
    skillChoiceCount: choices.choose,
    availableSkills: choices.from,
    expertiseSlots,
  };
}

/**
 * Returns the complete list of skill definitions with descriptions.
 *
 * @pure
 */
export function getRegistrySkillDefinitions(): SkillDefinition[] {
  return [...SKILL_DEFINITIONS];
}

/**
 * Validates a skill selection against class rules.
 *
 * @pure
 * @param classId          — class identifier (case-insensitive)
 * @param selectedSkills   — record of skill name → proficiency level ("proficient" | "expert" | "none")
 * @param backgroundSkills — skill names granted by background
 * @param level            — character level, defaults to 1
 * @returns validation result with isValid flag and error messages
 */
export function validateSkillSelection(
  classId: string,
  selectedSkills: Record<string, string>,
  backgroundSkills: string[],
  level: number = 1,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const rules = getRegistryClassSkillRules(classId, level);

  if (!rules) {
    // Unknown class — only valid if no skills selected
    const hasSelections = Object.values(selectedSkills).some(
      (v) => v !== "none" && v !== undefined,
    );
    if (hasSelections) {
      errors.push("No skill rules found for this class.");
    }
    return { isValid: errors.length === 0, errors };
  }

  const backgroundSet = new Set(backgroundSkills);

  // Count class-selected skills (not background-granted)
  let classPickCount = 0;
  let expertiseCount = 0;
  const invalidSkills: string[] = [];

  for (const [skillName, profLevel] of Object.entries(selectedSkills)) {
    if (!profLevel || profLevel === "none") continue;

    // Background skills don't count against class picks
    if (backgroundSet.has(skillName)) continue;

    // Check if skill is available for this class
    if (!rules.availableSkills.includes(skillName)) {
      invalidSkills.push(skillName);
      continue;
    }

    classPickCount++;

    if (profLevel === "expert") {
      expertiseCount++;
    }
  }

  // Validate class pick count
  if (classPickCount > rules.skillChoiceCount) {
    errors.push(
      `Too many class skills selected (${classPickCount}/${rules.skillChoiceCount}).`,
    );
  } else if (classPickCount < rules.skillChoiceCount) {
    errors.push(
      `Not enough class skills selected (${classPickCount}/${rules.skillChoiceCount}).`,
    );
  }

  // Validate expertise count
  if (expertiseCount > rules.expertiseSlots) {
    errors.push(
      `Too many expertise selections (${expertiseCount}/${rules.expertiseSlots}).`,
    );
  }

  // Validate skill availability
  if (invalidSkills.length > 0) {
    errors.push(
      `Skills not available for this class: ${invalidSkills.join(", ")}.`,
    );
  }

  return { isValid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Registry factory
// ---------------------------------------------------------------------------

/**
 * Creates and returns the 2024 D&D 5e skill rules registry.
 *
 * The returned object is a plain object (not a class instance) for easy
 * mocking in tests and composition in DI patterns.
 *
 * @pure — the returned registry object contains only pure functions.
 *
 * @example
 * ```ts
 * const registry = getSkillsRegistry();
 * const rules = registry.getClassSkillRules("rogue");
 * // rules → { classId: "rogue", skillChoiceCount: 4, availableSkills: [...], expertiseSlots: 2 }
 * ```
 */
export function getSkillsRegistry(): SkillsRegistry {
  return {
    getClassSkillRules: (classId: string) => getRegistryClassSkillRules(classId),
    getSkillDefinitions: () => getRegistrySkillDefinitions(),
  };
}
