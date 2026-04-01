/**
 * @fileoverview Extracted wizard validation logic for character creation.
 *
 * Pure functions that validate each step of the character creation wizard.
 * Moved out of CharacterWizard.tsx to enable isolated testing and reuse.
 */

import { DnD5eCharacter } from "@/types/character";
import {
  getClassByName,
  getClassExpertiseSelectionCount,
  getClassSavingThrowKeys,
  getClassSkillChoices,
  getClassSpellcastingAbility,
  getRaceByName,
  isSpellcastingClass,
} from "@/lib/dndCompendium";
import {
  applyAbilityBonuses,
  hasRequiredRaceAbilityChoices,
} from "@/lib/characterCreationRules";
import { validateSpellStepComplete } from "@/lib/rules/spells";
import { getStartingGoldBudget } from "@/data";

export type WizardStepKey =
  | "basic"
  | "race"
  | "class"
  | "background"
  | "abilities"
  | "skills"
  | "saves"
  | "spells"
  | "equipment"
  | "review";

export interface StepValidationOptions {
  /** Current equipment cost in GP for gold-buy budget checking */
  equipmentCostGp?: number;
  /** Step keys to validate when checking the review step (excludes "review" itself) */
  activeStepKeys?: WizardStepKey[];
}

/** Returns all validation errors for a wizard step */
export function getStepErrors(
  stepKey: string,
  character: Partial<DnD5eCharacter>,
  options?: StepValidationOptions
): string[] {
  const name = character.name?.trim() || "";
  const selectedRace = getRaceByName(character.race || "");
  const baseAbilityScores = character.abilityScores;
  const effectiveAbilityScores = baseAbilityScores
    ? applyAbilityBonuses(baseAbilityScores, character.raceAbilityBonuses)
    : undefined;

  switch (stepKey) {
    case "basic": {
      const errors: string[] = [];
      if (name.length === 0) {
        errors.push("Enter a character name.");
      }
      return errors;
    }
    case "race": {
      const errors: string[] = [];
      if (!character.race) {
        errors.push("Choose a race.");
      }
      if (
        selectedRace &&
        !hasRequiredRaceAbilityChoices(
          selectedRace.abilityScoreIncrease,
          character.raceAbilityChoices || []
        )
      ) {
        errors.push("Complete race ability score bonus choices.");
      }
      return errors;
    }
    case "class": {
      const errors: string[] = [];
      if (!character.class) {
        errors.push("Choose a class.");
      }
      return errors;
    }
    case "background": {
      const errors: string[] = [];
      if (!character.background) {
        errors.push("Choose a background.");
      }
      return errors;
    }
    case "abilities": {
      const errors: string[] = [];
      if (!baseAbilityScores) {
        errors.push("Set your ability scores.");
        return errors;
      }
      const scores = Object.values(baseAbilityScores);
      const outOfRange = scores.filter(
        (score) => !Number.isFinite(score) || score < 3 || score > 20
      );
      if (outOfRange.length > 0) {
        errors.push("All ability scores must be between 3 and 20.");
      }
      return errors;
    }
    case "skills": {
      const errors: string[] = [];
      if (!character.class) {
        errors.push("Choose a class before selecting skills.");
        return errors;
      }
      const classChoices = getClassSkillChoices(character.class);
      const selectedSkills = character.skills || {};
      const backgroundSkills = new Set(character.backgroundSkills || []);
      const classSelectionCount = classChoices.from.filter(
        (skill) => !backgroundSkills.has(skill) && (selectedSkills[skill] || "none") !== "none"
      ).length;
      if (classSelectionCount !== classChoices.choose) {
        errors.push(
          `Select exactly ${classChoices.choose} class skill${
            classChoices.choose === 1 ? "" : "s"
          }.`
        );
      }
      const expertiseSlots = getClassExpertiseSelectionCount(
        character.class,
        character.level || 1
      );
      const expertiseCount = Object.values(selectedSkills).filter(
        (level) => level === "expert"
      ).length;
      if (expertiseCount > expertiseSlots) {
        errors.push(
          `You can only choose ${expertiseSlots} expertise skill${
            expertiseSlots === 1 ? "" : "s"
          } at this level.`
        );
      }
      const backgroundSkillMissing = Array.from(backgroundSkills).some(
        (skill) => (selectedSkills[skill] || "none") === "none"
      );
      if (backgroundSkillMissing) {
        errors.push("Background skills must remain proficient.");
      }
      return errors;
    }
    case "saves": {
      const errors: string[] = [];
      if (!character.class) {
        errors.push("Choose a class before saving throws.");
      }
      return errors;
    }
    case "spells": {
      const errors: string[] = [];
      if (!character.class || !isSpellcastingClass(character.class)) {
        return errors;
      }
      if (!effectiveAbilityScores) {
        errors.push("Set your ability scores before spell selection.");
        return errors;
      }
      const spellcastingAbility = getClassSpellcastingAbility(character.class);
      if (!spellcastingAbility) {
        return errors;
      }
      const spellValidation = validateSpellStepComplete(
        character.class,
        character.level || 1,
        effectiveAbilityScores[spellcastingAbility],
        character.preparedSpells || []
      );
      return spellValidation.errors;
    }
    case "equipment": {
      const errors: string[] = [];
      if (!character.inventory || character.inventory.length === 0) {
        errors.push("Choose starting equipment.");
      }
      if (character.class && character.equipmentSelectionMode === "gold-buy") {
        const classData = getClassByName(character.class);
        const budget = classData ? getStartingGoldBudget(classData.id) : 100;
        const totalCost = options?.equipmentCostGp ?? 0;
        if (totalCost > budget) {
          errors.push("Gold-buy equipment exceeds starting budget.");
        }
      }
      return errors;
    }
    case "review": {
      const keysToValidate =
        options?.activeStepKeys?.filter((k) => k !== "review") || [];
      const allErrors: string[] = [];
      for (const key of keysToValidate) {
        allErrors.push(...getStepErrors(key, character, options));
      }
      return allErrors;
    }
    default:
      return ["Unknown wizard step."];
  }
}

/** Returns first validation error or null (backwards-compatible) */
export function getStepError(
  stepKey: string,
  character: Partial<DnD5eCharacter>,
  options?: StepValidationOptions
): string | null {
  const errors = getStepErrors(stepKey, character, options);
  return errors.length > 0 ? errors[0] : null;
}

/** Returns cross-step consistency errors found at submission time */
export function getCrossStepErrors(
  character: Partial<DnD5eCharacter>
): string[] {
  const errors: string[] = [];

  // Verify background skills are present in the skills map as proficient
  const backgroundSkills = character.backgroundSkills || [];
  const skills = character.skills || {};
  for (const bgSkill of backgroundSkills) {
    const proficiency = skills[bgSkill] || "none";
    if (proficiency === "none") {
      errors.push(`Background skill "${bgSkill}" is not marked as proficient.`);
    }
  }

  // Verify saving throws match the selected class
  if (character.class) {
    const expectedKeys = getClassSavingThrowKeys(character.class);
    const currentSaves = character.savingThrows || {};
    for (const ability of expectedKeys) {
      if (!currentSaves[ability]) {
        errors.push(
          `Saving throw proficiency for "${ability}" is missing for class ${character.class}.`
        );
      }
    }
  }

  // Verify spellcasting class has selected spells (if applicable)
  if (character.class && isSpellcastingClass(character.class)) {
    const spellcastingAbility = getClassSpellcastingAbility(character.class);
    if (spellcastingAbility) {
      const preparedSpells = character.preparedSpells || [];
      if (preparedSpells.length === 0) {
        errors.push("Spellcasting class has no spells selected.");
      }
    }
  }

  // Verify equipment is non-empty
  if (!character.inventory || character.inventory.length === 0) {
    errors.push("Character has no equipment.");
  }

  // Verify race ability choices are complete if race requires them
  if (character.race) {
    const raceData = getRaceByName(character.race);
    if (
      raceData &&
      !hasRequiredRaceAbilityChoices(
        raceData.abilityScoreIncrease,
        character.raceAbilityChoices || []
      )
    ) {
      errors.push("Race ability score bonus choices are incomplete.");
    }
  }

  // Verify class ID matches class name
  if (character.class && character.classId) {
    const classData = getClassByName(character.class);
    if (classData && classData.id !== character.classId) {
      errors.push(
        `Class ID "${character.classId}" does not match selected class "${character.class}".`
      );
    }
  }

  return errors;
}
