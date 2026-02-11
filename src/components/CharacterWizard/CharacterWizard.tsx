import { type ComponentType, useEffect, useState } from "react";
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
import { getDefaultSpellSlots, getLevelOneHitPoints } from "@/lib/dndRules";
import { BasicInfoStep } from "./BasicInfoStep";
import { RaceSelectionStep } from "./RaceSelectionStep";
import { ClassSelectionStep } from "./ClassSelectionStep";
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

  const currentStepDefinition = steps[currentStep - 1];
  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = currentStepDefinition?.component;

  const canProceed = () => {
    if (!currentStepDefinition) {
      return false;
    }

    switch (currentStepDefinition.key) {
      case "basic":
        return character.name && character.name.trim().length > 0;
      case "race":
        return character.race && character.race.length > 0;
      case "class":
        return character.class && character.class.length > 0;
      case "abilities":
      case "skills":
      case "saves":
      case "spells":
      case "equipment":
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "Incomplete Step",
        description: "Please complete this step before proceeding.",
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
    if (!character.name || !character.race || !character.class) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    const level = character.level || 1;
    const constitution = character.abilityScores?.constitution || 10;
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
