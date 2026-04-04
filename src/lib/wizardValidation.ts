import { DnD5eCharacter } from "@/types/character";
import {
  getClassByName,
  getClassExpertiseSelectionCount,
  getClassSkillChoices,
  getClassSpellcastingAbility,
  getRaceByName,
  isSpellcastingClass,
} from "@/lib/dndCompendium";
import { validateSpellStepComplete } from "@/lib/rules/spells";
import {
  applyAbilityBonuses,
  hasRequiredRaceAbilityChoices,
} from "@/lib/characterCreationRules";
import { validateEquipmentStep } from "@/components/CharacterWizard/StartingEquipmentStep";

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

export interface StepValidationResult {
  key: WizardStepKey;
  label: string;
  valid: boolean;
  error: string | null;
}

const STEP_LABELS: Record<WizardStepKey, string> = {
  basic: "Basic Info",
  race: "Race",
  class: "Class",
  background: "Background",
  abilities: "Abilities",
  skills: "Skills",
  saves: "Saves",
  spells: "Spells",
  equipment: "Equipment",
  review: "Review",
};

export function getStepValidationError(
  stepKey: WizardStepKey,
  character: Partial<DnD5eCharacter>
): string | null {
  const name = character.name?.trim() || "";
  const selectedRace = getRaceByName(character.race || "");
  const baseAbilityScores = character.abilityScores;
  const effectiveAbilityScores = baseAbilityScores
    ? applyAbilityBonuses(baseAbilityScores, character.raceAbilityBonuses)
    : undefined;

  switch (stepKey) {
    case "basic":
      return name.length > 0 ? null : "Enter a character name.";
    case "race":
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
    case "class":
      return character.class ? null : "Choose a class.";
    case "background":
      return character.background ? null : "Choose a background.";
    case "abilities":
      if (!baseAbilityScores) {
        return "Set your ability scores.";
      }
      return Object.values(baseAbilityScores).every(
        (score) => Number.isFinite(score) && score >= 3 && score <= 20
      )
        ? null
        : "All ability scores must be between 3 and 20.";
    case "skills": {
      if (!character.class) {
        return "Choose a class before selecting skills.";
      }
      const classChoices = getClassSkillChoices(character.class);
      const selectedSkills = character.skills || {};
      const backgroundSkills = new Set(character.backgroundSkills || []);
      const classSelectionCount = classChoices.from.filter(
        (skill) => !backgroundSkills.has(skill) && (selectedSkills[skill] || "none") !== "none"
      ).length;
      if (classSelectionCount !== classChoices.choose) {
        return `Select exactly ${classChoices.choose} class skill${
          classChoices.choose === 1 ? "" : "s"
        }.`;
      }
      const expertiseSlots = getClassExpertiseSelectionCount(character.class, character.level || 1);
      const expertiseCount = Object.values(selectedSkills).filter((level) => level === "expert").length;
      if (expertiseCount > expertiseSlots) {
        return `You can only choose ${expertiseSlots} expertise skill${
          expertiseSlots === 1 ? "" : "s"
        } at this level.`;
      }
      const backgroundSkillMissing = Array.from(backgroundSkills).some(
        (skill) => (selectedSkills[skill] || "none") === "none"
      );
      if (backgroundSkillMissing) {
        return "Background skills must remain proficient.";
      }
      return null;
    }
    case "saves":
      return character.class ? null : "Choose a class before saving throws.";
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
      const result = validateEquipmentStep(character);
      return result.valid ? null : (result.reason || "Choose starting equipment.");
    }
    case "review":
      return null;
    default:
      return "Unknown wizard step.";
  }
}

const CONTENT_STEPS: WizardStepKey[] = [
  "basic", "race", "class", "background", "abilities",
  "skills", "saves", "spells", "equipment",
];

export function validateAllSteps(
  character: Partial<DnD5eCharacter>,
  visibleSteps: WizardStepKey[] = CONTENT_STEPS
): StepValidationResult[] {
  return visibleSteps
    .filter((key) => key !== "review")
    .map((key) => ({
      key,
      label: STEP_LABELS[key],
      error: getStepValidationError(key, character),
      valid: getStepValidationError(key, character) === null,
    }));
}
