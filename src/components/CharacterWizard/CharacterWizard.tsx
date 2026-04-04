import { type ComponentType, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DnD5eCharacter, Character } from "@/types/character";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { readCharacters, writeCharacters } from "@/lib/storage";
import {
  getClassByName,
  getClassSavingThrowProficiencies,
  getClassSpellcastingAbility,
  getRaceByName,
  isSpellcastingClass,
} from "@/lib/dndCompendium";
import { getLevelOneHitPoints } from "@/lib/dndRules";
import {
  getSpellcastingType,
  toCharacterSpellSlots,
} from "@/lib/rules/spells";
import { reconcileClassChange } from "@/lib/rules/classChange";
import {
  applyAbilityBonuses,
} from "@/lib/characterCreationRules";
import { getStepValidationError, type WizardStepKey } from "@/lib/wizardValidation";
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
      const effectiveScores = prev.abilityScores
        ? applyAbilityBonuses(prev.abilityScores, prev.raceAbilityBonuses)
        : undefined;
      const castingAbility = getClassSpellcastingAbility(nextClass);
      const abilityScore =
        castingAbility && effectiveScores ? effectiveScores[castingAbility] ?? 10 : 10;

      const reconciliation = reconcileClassChange(
        previousClass,
        nextClass,
        level,
        abilityScore,
        (prev.preparedSpells || []) as Array<{ id: string; sourceSpellId?: string; name: string; level: number; [key: string]: unknown }>,
      );

      const backgroundSkills = new Set(prev.backgroundSkills || []);
      const updatedSkills = Object.fromEntries(
        Object.entries(prev.skills || {}).map(([skillName, proficiency]) => [
          skillName,
          backgroundSkills.has(skillName) && proficiency !== "none" ? proficiency : "none",
        ])
      );

      return {
        ...prev,
        savingThrows: getClassSavingThrowProficiencies(nextClass),
        skills: updatedSkills,
        ...(reconciliation.newSpellcastingAbility
          ? {
              spellcastingAbility: reconciliation.newSpellcastingAbility,
              spellcastingType: reconciliation.newSpellcastingType,
              spellSlots: toCharacterSpellSlots(nextClass, level),
              preparedSpells: reconciliation.spells.kept,
            }
          : {
              spellcastingAbility: undefined,
              spellcastingType: reconciliation.newSpellcastingType,
              spellSlots: undefined,
              preparedSpells: undefined,
            }),
        ...(reconciliation.equipment.shouldClearEquipment
          ? { inventory: [], equipmentSelectionMode: undefined }
          : {}),
      };
    });

    previousClassRef.current = nextClass;

    // Build a descriptive toast from the reconciliation summary
    const effectiveScores = character.abilityScores
      ? applyAbilityBonuses(character.abilityScores, character.raceAbilityBonuses)
      : undefined;
    const castingAbility = getClassSpellcastingAbility(nextClass);
    const abilityScore =
      castingAbility && effectiveScores ? effectiveScores[castingAbility] ?? 10 : 10;
    const reconciliation = reconcileClassChange(
      previousClass,
      nextClass,
      character.level || 1,
      abilityScore,
      (character.preparedSpells || []) as Array<{ id: string; sourceSpellId?: string; name: string; level: number; [key: string]: unknown }>,
    );

    const description = reconciliation.changeSummary.length > 0
      ? reconciliation.changeSummary.join(". ") + "."
      : "Class-specific options were adjusted to match your new class.";

    toast({
      title: "Class Updated",
      description,
    });
  }, [character.class]);

  const currentStepDefinition = steps[currentStep - 1];
  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = currentStepDefinition?.component;

  const getStepError = (stepKey: WizardStepKey): string | null => {
    if (stepKey === "review") {
      const keysToValidate = steps
        .map((step) => step.key)
        .filter((key) => key !== "review");
      const firstError = keysToValidate
        .map((key) => getStepValidationError(key, character))
        .find(Boolean);
      return firstError || null;
    }
    return getStepValidationError(stepKey, character);
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
    const castingType = getSpellcastingType(character.class);
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
        rulesVersion: "2024-dnd5e",
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
              spellcastingType: castingType,
              spellSlots: character.spellSlots || toCharacterSpellSlots(character.class, level),
              preparedSpells: character.preparedSpells || [],
            }
          : {
              spellcastingAbility: undefined,
              spellcastingType: castingType,
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
      <div className="container max-w-6xl mx-auto p-6">
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
