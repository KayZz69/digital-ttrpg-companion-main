/**
 * @fileoverview Extracted and hardened wizard step validation logic.
 *
 * Pure functions that validate each character creation wizard step.
 * Imported by CharacterWizard.tsx to drive step gating and review checks.
 */

import { DnD5eCharacter, DnD5eAbilityScores } from "@/types/character";
import {
  getRaceByName,
  getClassSkillChoices,
  getClassExpertiseSelectionCount,
  getClassSavingThrowProficiencies,
  getClassByName,
  isSpellcastingClass,
  getClassSpellcastingAbility,
} from "@/lib/dndCompendium";
import {
  applyAbilityBonuses,
  hasRequiredRaceAbilityChoices,
  ABILITY_KEYS,
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

/** Maximum allowed character name length. */
const MAX_NAME_LENGTH = 50;

export interface StepValidationOptions {
  equipmentCostInGp?: number;
  visibleStepKeys?: WizardStepKey[];
}

/**
 * Validate a single wizard step and return the first error, or null if valid.
 */
export function getStepError(
  stepKey: WizardStepKey,
  character: Partial<DnD5eCharacter>,
  options?: StepValidationOptions
): string | null {
  const name = character.name?.trim() || "";
  const selectedRace = getRaceByName(character.race || "");
  const baseAbilityScores = character.abilityScores;
  const effectiveAbilityScores = baseAbilityScores
    ? applyAbilityBonuses(baseAbilityScores, character.raceAbilityBonuses)
    : undefined;

  switch (stepKey) {
    case "basic": {
      if (name.length === 0) {
        return "Enter a character name.";
      }
      if (name.length > MAX_NAME_LENGTH) {
        return `Character name must be ${MAX_NAME_LENGTH} characters or fewer.`;
      }
      return null;
    }
    case "race": {
      if (!character.race) {
        return "Choose a race.";
      }
      if (
        selectedRace &&
        !hasRequiredRaceAbilityChoices(
          selectedRace.abilityScoreIncrease,
          character.raceAbilityChoices || []
        )
      ) {
        return "Complete race ability score bonus choices.";
      }
      return null;
    }
    case "class":
      return character.class ? null : "Choose a class.";
    case "background":
      return character.background ? null : "Choose a background.";
    case "abilities": {
      if (!baseAbilityScores) {
        return "Set your ability scores.";
      }
      // Ensure all six ability scores exist
      for (const key of ABILITY_KEYS) {
        const score = baseAbilityScores[key];
        if (score === undefined || score === null || !Number.isFinite(score)) {
          return `Ability score "${key}" is missing or invalid.`;
        }
        if (score < 3 || score > 20) {
          return "All ability scores must be between 3 and 20.";
        }
      }
      return null;
    }
    case "skills": {
      if (!character.class) {
        return "Choose a class before selecting skills.";
      }
      const classChoices = getClassSkillChoices(character.class);
      const selectedSkills = character.skills || {};
      const backgroundSkills = new Set(character.backgroundSkills || []);
      const classSelectionCount = classChoices.from.filter(
        (skill) =>
          !backgroundSkills.has(skill) &&
          (selectedSkills[skill] || "none") !== "none"
      ).length;
      if (classSelectionCount !== classChoices.choose) {
        return `Select exactly ${classChoices.choose} class skill${
          classChoices.choose === 1 ? "" : "s"
        }.`;
      }
      const expertiseSlots = getClassExpertiseSelectionCount(
        character.class,
        character.level || 1
      );
      const expertiseCount = Object.values(selectedSkills).filter(
        (level) => level === "expert"
      ).length;
      if (expertiseCount > expertiseSlots) {
        return `You can only choose ${expertiseSlots} expertise skill${
          expertiseSlots === 1 ? "" : "s"
        } at this level.`;
      }
      // Validate expertise is only on proficient or expert skills
      for (const [skill, level] of Object.entries(selectedSkills)) {
        if (level === "expert") {
          const isProficient =
            backgroundSkills.has(skill) ||
            classChoices.from.includes(skill);
          if (!isProficient) {
            return `Expertise can only be applied to proficient skills. "${skill}" is not proficient.`;
          }
        }
      }
      const backgroundSkillMissing = Array.from(backgroundSkills).some(
        (skill) => (selectedSkills[skill] || "none") === "none"
      );
      if (backgroundSkillMissing) {
        return "Background skills must remain proficient.";
      }
      return null;
    }
    case "saves": {
      if (!character.class) {
        return "Choose a class before saving throws.";
      }
      // Validate that saving throw data contains expected class proficiencies
      const expectedSaves = getClassSavingThrowProficiencies(character.class);
      const characterSaves = character.savingThrows;
      if (characterSaves && Object.keys(characterSaves).length > 0) {
        const missingProficiencies = Object.entries(expectedSaves).filter(
          ([ability, proficient]) => proficient && !characterSaves[ability]
        );
        if (missingProficiencies.length > 0) {
          return "Saving throw proficiencies do not match class requirements.";
        }
      }
      return null;
    }
    case "spells": {
      if (!character.class || !isSpellcastingClass(character.class)) {
        return null;
      }
      if (!effectiveAbilityScores) {
        return "Set your ability scores before spell selection.";
      }
      const spellcastingAbility = getClassSpellcastingAbility(character.class);
      if (!spellcastingAbility) {
        return null;
      }
      const spellValidation = validateSpellStepComplete(
        character.class,
        character.level || 1,
        effectiveAbilityScores[spellcastingAbility],
        character.preparedSpells || []
      );
      return spellValidation.isComplete ? null : spellValidation.errors[0];
    }
    case "equipment": {
      if (!character.inventory || character.inventory.length === 0) {
        return "Choose starting equipment.";
      }
      if (
        character.equipmentSelectionMode === "packages" &&
        !character.startingEquipmentChoiceId
      ) {
        return "Select a starting equipment package.";
      }
      if (character.class && character.equipmentSelectionMode === "gold-buy") {
        const classData = getClassByName(character.class);
        const budget = classData ? getStartingGoldBudget(classData.id) : 100;
        const totalCost = options?.equipmentCostInGp ?? 0;
        if (totalCost > budget) {
          return "Gold-buy equipment exceeds starting budget.";
        }
      }
      return null;
    }
    case "review": {
      const visibleKeys =
        options?.visibleStepKeys ||
        (["basic", "race", "class", "background", "abilities", "skills", "saves", "spells", "equipment"] as WizardStepKey[]);
      const keysToValidate = visibleKeys.filter((k) => k !== "review");
      const firstError = keysToValidate
        .map((key) => getStepError(key, character, options))
        .find(Boolean);
      return firstError || null;
    }
    default:
      return "Unknown wizard step.";
  }
}

/**
 * Collect validation errors for ALL visible steps (used by the review step).
 * Returns a record keyed by step, with null for valid steps.
 */
export function getAllStepErrors(
  character: Partial<DnD5eCharacter>,
  visibleStepKeys: WizardStepKey[],
  options?: { equipmentCostInGp?: number }
): Record<WizardStepKey, string | null> {
  const result = {} as Record<WizardStepKey, string | null>;
  const opts: StepValidationOptions = {
    ...options,
    visibleStepKeys,
  };
  for (const key of visibleStepKeys) {
    if (key === "review") {
      result[key] = null;
      continue;
    }
    result[key] = getStepError(key, character, opts);
  }
  return result;
}
