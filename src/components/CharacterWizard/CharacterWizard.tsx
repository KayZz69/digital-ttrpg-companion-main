import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DnD5eCharacter, DnD5eAbilityScores, Character } from "@/types/character";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BasicInfoStep } from "./BasicInfoStep";
import { RaceSelectionStep } from "./RaceSelectionStep";
import { ClassSelectionStep } from "./ClassSelectionStep";
import { AbilityScoresStep } from "./AbilityScoresStep";
import { SkillsStep } from "./SkillsStep";
import { SavingThrowsStep } from "./SavingThrowsStep";
import { ReviewStep } from "./ReviewStep";

interface CharacterWizardProps {
  onBack: () => void;
}

const STEPS = [
  { id: 1, name: "Basic Info", component: BasicInfoStep },
  { id: 2, name: "Race", component: RaceSelectionStep },
  { id: 3, name: "Class", component: ClassSelectionStep },
  { id: 4, name: "Abilities", component: AbilityScoresStep },
  { id: 5, name: "Skills", component: SkillsStep },
  { id: 6, name: "Saves", component: SavingThrowsStep },
  { id: 7, name: "Review", component: ReviewStep },
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

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return character.name && character.name.trim().length > 0;
      case 2:
        return character.race && character.race.length > 0;
      case 3:
        return character.class && character.class.length > 0;
      case 4:
        return true; // Abilities always have default values
      case 5:
        return true; // Skills are optional
      case 6:
        return true; // Saving throws are optional
      case 7:
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

    if (currentStep < STEPS.length) {
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

    // Calculate HP based on class hit die + Constitution modifier
    const classHitDice: { [key: string]: number } = {
      Barbarian: 12,
      Fighter: 10,
      Paladin: 10,
      Ranger: 10,
      Bard: 8,
      Cleric: 8,
      Druid: 8,
      Monk: 8,
      Rogue: 8,
      Warlock: 8,
      Sorcerer: 6,
      Wizard: 6,
    };

    const hitDie = classHitDice[character.class!] || 8;
    const conModifier = Math.floor(((character.abilityScores?.constitution || 10) - 10) / 2);
    const maxHP = hitDie + conModifier;

    const spellcastingClasses: { [key: string]: keyof DnD5eAbilityScores } = {
      Bard: "charisma",
      Cleric: "wisdom",
      Druid: "wisdom",
      Paladin: "charisma",
      Ranger: "wisdom",
      Sorcerer: "charisma",
      Warlock: "charisma",
      Wizard: "intelligence",
    };

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      system: "dnd5e",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        ...character,
        hitPoints: {
          current: maxHP,
          max: maxHP,
        },
        hitDice: {
          current: character.level || 1,
          max: character.level || 1,
        },
        spellcastingAbility: spellcastingClasses[character.class],
      } as DnD5eCharacter,
    };

    const saved = localStorage.getItem("soloquest_characters");
    const characters: Character[] = saved ? JSON.parse(saved) : [];
    characters.push(newCharacter);
    localStorage.setItem("soloquest_characters", JSON.stringify(characters));

    toast({
      title: "Character Created!",
      description: `${character.name} has been created successfully.`,
    });

    navigate(`/character/${newCharacter.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Create Character</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`text-xs transition-colors ${
                  step.id === currentStep
                    ? "text-primary font-semibold"
                    : step.id < currentStep
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
            {currentStep === STEPS.length ? "Create Character" : "Next"}
            {currentStep < STEPS.length && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
