import { type ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DnD5eCharacter, Character } from "@/types/character";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { readCharacters, writeCharacters } from "@/lib/storage";
import {
  getAllCompendiumEquipment,
  getClassByName,
  getClassExpertiseSelectionCount,
  getClassSavingThrowProficiencies,
  getClassSkillChoices,
  getClassSpells,
  getClassSpellcastingAbility,
  getRaceByName,
  isSpellcastingClass,
} from "@/lib/dndCompendium";
import {
  getDefaultSpellSlots,
  getLevelOneHitPoints,
  getSpellSelectionState,
} from "@/lib/dndRules";
import {
  applyAbilityBonuses,
  hasRequiredRaceAbilityChoices,
} from "@/lib/characterCreationRules";
import { getStartingGoldBudget } from "@/data";
import { BasicInfoStep } from "./BasicInfoStep";
import { RaceSelectionStep } from "./RaceSelectionStep";
import { ClassSelectionStep } from "./ClassSelectionStep";
import { BackgroundStep } from "./BackgroundStep";
import { AbilityScoresStep } from "./AbilityScoresStep";
import { SkillsStep } from "./SkillsStep";
import { SavingThrowsStep } from "./SavingThrowsStep";
import { SpellSelectionStep } from "./SpellSelectionStep";
import { StartingEquipmentStep } from "./StartingEquipmentStep";
import { ReviewStep } from "./ReviewStep";

interface CharacterWizardProps {
  onBack: () => void;
}

type WizardStepKey =
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

interface WizardStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

interface WizardStepDefinition {
  key: WizardStepKey;
  name: string;
  component: ComponentType<WizardStepProps>;
  showWhen?: (character: Partial<DnD5eCharacter>) => boolean;
}

const ALL_STEPS: WizardStepDefinition[] = [
  { key: "basic", name: "Basic Info", component: BasicInfoStep },
  { key: "race", name: "Race", component: RaceSelectionStep },
  { key: "class", name: "Class", component: ClassSelectionStep },
  { key: "background", name: "Background", component: BackgroundStep },
  { key: "abilities", name: "Abilities", component: AbilityScoresStep },
  { key: "skills", name: "Skills", component: SkillsStep },
  { key: "saves", name: "Saves", component: SavingThrowsStep },
  {
    key: "spells",
    name: "Spells",
    component: SpellSelectionStep,
    showWhen: (character) => isSpellcastingClass(character.class || ""),
  },
  { key: "equipment", name: "Equipment", component: StartingEquipmentStep },
  { key: "review", name: "Review", component: ReviewStep },
];

export const CharacterWizard = ({ onBack }: CharacterWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const previousClassRef = useRef<string>("");
  const [character, setCharacter] = useState<Partial<DnD5eCharacter>>({
    name: "",
    race: "",
    class: "",
    level: 1,
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    experiencePoints: 0,
    hitPoints: { current: 0, max: 0 },
    inventory: [],
  });
  const compendiumById = useMemo(
    () => new Map(getAllCompendiumEquipment().map((entry) => [entry.id, entry])),
    []
  );

  const steps = ALL_STEPS.filter((step) =>
    step.showWhen ? step.showWhen(character) : true
  );

  useEffect(() => {
    if (currentStep > steps.length) {
      setCurrentStep(steps.length);
    }
  }, [currentStep, steps.length]);

  useEffect(() => {
    const nextClass = character.class || "";
    const previousClass = previousClassRef.current;
    if (!nextClass || previousClass === nextClass) {
      previousClassRef.current = nextClass;
      return;
    }

    if (!previousClass) {
      previousClassRef.current = nextClass;
      return;
    }

    setCharacter((prev) => {
      const level = prev.level || 1;
      const availableSpellIds = new Set(getClassSpells(nextClass).map((spell) => spell.id));
      const backgroundSkills = new Set(prev.backgroundSkills || []);
      const updatedSkills = Object.fromEntries(
        Object.entries(prev.skills || {}).map(([skillName, proficiency]) => [
          skillName,
          backgroundSkills.has(skillName) && proficiency !== "none" ? proficiency : "none",
        ])
      );
      const spellcastingAbility = getClassSpellcastingAbility(nextClass);
      const reconciledPreparedSpells =
        prev.preparedSpells?.filter(
          (spell) => !spell.sourceSpellId || availableSpellIds.has(spell.sourceSpellId)
        ) || [];

      return {
        ...prev,
        savingThrows: getClassSavingThrowProficiencies(nextClass),
        skills: updatedSkills,
        ...(spellcastingAbility
          ? {
              spellcastingAbility,
              spellSlots: getDefaultSpellSlots(nextClass, level),
              preparedSpells: reconciledPreparedSpells,
            }
          : {
              spellcastingAbility: undefined,
              spellSlots: undefined,
              preparedSpells: undefined,
            }),
      };
    });

    previousClassRef.current = nextClass;
    toast({
      title: "Class Updated",
      description: "Class-specific spells and skills were adjusted to match your new class.",
    });
  }, [character.class]);

  const currentStepDefinition = steps[currentStep - 1];
  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = currentStepDefinition?.component;

  const getCurrentEquipmentCostInGp = (): number =>
    (character.inventory || []).reduce((sum, item) => {
      if (!item.sourceItemId) {
        return sum;
      }
      const source = compendiumById.get(item.sourceItemId);
      if (!source) {
        return sum;
      }
      const { quantity, unit } = source.source.cost;
      const unitValue =
        unit === "cp" ? quantity / 100 : unit === "sp" ? quantity / 10 : unit === "pp" ? quantity * 10 : quantity;
      return sum + unitValue * item.quantity;
    }, 0);

  const getStepError = (stepKey: WizardStepKey): string | null => {
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
        const state = getSpellSelectionState(
          character.class,
          character.level || 1,
          effectiveAbilityScores[spellcastingAbility],
          character.preparedSpells || []
        );
        return state.isOverLimit ? "Spell selections exceed class limits." : null;
      }
      case "equipment": {
        if (!character.inventory || character.inventory.length === 0) {
          return "Choose starting equipment.";
        }
        if (character.class && character.equipmentSelectionMode === "gold-buy") {
          const classData = getClassByName(character.class);
          const budget = classData ? getStartingGoldBudget(classData.id) : 100;
          const totalCost = getCurrentEquipmentCostInGp();
          if (totalCost > budget) {
            return "Gold-buy equipment exceeds starting budget.";
          }
        }
        return null;
      }
      case "review": {
        const keysToValidate = steps
          .map((step) => step.key)
          .filter((step) => step !== "review");
        const firstError = keysToValidate.map((key) => getStepError(key)).find(Boolean);
        return firstError || null;
      }
      default:
        return "Unknown wizard step.";
    }
  };

  const canProceed = () => {
    if (!currentStepDefinition) {
      return false;
    }
    return getStepError(currentStepDefinition.key) === null;
  };

  const handleNext = () => {
    const error = currentStepDefinition ? getStepError(currentStepDefinition.key) : "Unknown step.";
    if (error) {
      toast({
        title: "Step Validation Failed",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    const reviewError = getStepError("review");
    if (reviewError) {
      toast({
        title: "Character Incomplete",
        description: reviewError,
        variant: "destructive",
      });
      return;
    }

    if (!character.name || !character.race || !character.class) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    const level = character.level || 1;
    const effectiveAbilityScores = applyAbilityBonuses(
      character.abilityScores!,
      character.raceAbilityBonuses
    );
    const constitution = effectiveAbilityScores.constitution || 10;
    const maxHP = getLevelOneHitPoints(character.class, constitution);
    const selectedClass = getClassByName(character.class);
    const selectedRace = getRaceByName(character.race);
    const spellcastingAbility = getClassSpellcastingAbility(character.class);
    const savingThrows =
      character.savingThrows && Object.keys(character.savingThrows).length > 0
        ? character.savingThrows
        : getClassSavingThrowProficiencies(character.class);

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      system: "dnd5e",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        ...character,
        abilityScores: effectiveAbilityScores,
        classId: selectedClass?.id,
        raceId: selectedRace?.id,
        level,
        hitPoints: {
          current: maxHP,
          max: maxHP,
        },
        hitDice: {
          current: level,
          max: level,
        },
        savingThrows,
        inventory: character.inventory || [],
        ...(spellcastingAbility
          ? {
              spellcastingAbility,
              spellSlots: character.spellSlots || getDefaultSpellSlots(character.class, level),
              preparedSpells: character.preparedSpells || [],
            }
          : {
              spellcastingAbility: undefined,
              spellSlots: undefined,
              preparedSpells: undefined,
            }),
      } as DnD5eCharacter,
    };

    const characters: Character[] = readCharacters();
    characters.push(newCharacter);
    writeCharacters(characters);

    toast({
      title: "Character Created!",
      description: `${character.name} has been created successfully.`,
    });

    navigate(`/character/${newCharacter.id}`);
  };

  if (!CurrentStepComponent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Create Character</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`text-xs transition-colors ${
                  index + 1 === currentStep
                    ? "text-primary font-semibold"
                    : index + 1 < currentStep
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="animate-fade-in">
          <CurrentStepComponent
            character={character}
            setCharacter={setCharacter}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === steps.length ? "Create Character" : "Next"}
            {currentStep < steps.length && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
