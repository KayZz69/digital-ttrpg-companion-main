import { DnD5eCharacter, SavingThrowProficiency, DnD5eAbilityScores } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllClasses } from "@/data/classes";
import { CheckCircle2 } from "lucide-react";

interface SavingThrowsStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

export const SavingThrowsStep = ({ character, setCharacter }: SavingThrowsStepProps) => {
  const savingThrows = character.savingThrows || {};
  const abilityScores = character.abilityScores!;
  const level = character.level || 1;

  // Get class saving throws
  const classes = getAllClasses();
  const selectedClass = classes.find(c => c.name === character.class);
  const classSavingThrows = selectedClass?.savingThrows || [];
  
  const abilityMap: Record<string, string> = {
    "Strength": "strength",
    "Dexterity": "dexterity",
    "Constitution": "constitution",
    "Intelligence": "intelligence",
    "Wisdom": "wisdom",
    "Charisma": "charisma"
  };
  
  const classSavingThrowKeys = classSavingThrows.map(save => abilityMap[save]).filter(Boolean);

  const getProficiencyBonus = (characterLevel: number): number => {
    return Math.floor((characterLevel - 1) / 4) + 2;
  };

  const getAbilityModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getSavingThrowModifier = (ability: keyof DnD5eAbilityScores, isProficient: boolean): number => {
    const abilityMod = getAbilityModifier(abilityScores[ability]);
    const profBonus = isProficient ? getProficiencyBonus(level) : 0;
    return abilityMod + profBonus;
  };

  const formatModifier = (value: number): string => {
    return value >= 0 ? `+${value}` : `${value}`;
  };

  const toggleProficiency = (ability: string) => {
    // Saving throws are locked - determined by class only
    return;
  };

  const abilities: Array<{ name: keyof DnD5eAbilityScores; label: string; icon: string }> = [
    { name: "strength", label: "Strength", icon: "STR" },
    { name: "dexterity", label: "Dexterity", icon: "DEX" },
    { name: "constitution", label: "Constitution", icon: "CON" },
    { name: "intelligence", label: "Intelligence", icon: "INT" },
    { name: "wisdom", label: "Wisdom", icon: "WIS" },
    { name: "charisma", label: "Charisma", icon: "CHA" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Saving Throw Proficiencies</CardTitle>
          <CardDescription>
            Your class determines your saving throw proficiencies
          </CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">Proficiency Bonus: {formatModifier(getProficiencyBonus(level))}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-primary/5 border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription>
              Your <strong>{character.class}</strong> class grants proficiency in <strong>{classSavingThrows.join(" and ")}</strong> saving throws.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            {abilities.map((ability) => {
              const isProficient = classSavingThrowKeys.includes(ability.name);
              const modifier = getSavingThrowModifier(ability.name, isProficient);
              
              return (
                <div
                  key={ability.name}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    isProficient ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      id={`${ability.name}-save`}
                      checked={isProficient}
                      disabled={true}
                      aria-label={`${ability.label} saving throw proficiency`}
                    />
                    <Label
                      htmlFor={`${ability.name}-save`}
                      className="flex-1 font-medium flex items-center gap-2"
                    >
                      <span className="text-xl">{ability.icon}</span>
                      {ability.label}
                      {isProficient && (
                        <Badge variant="default" className="text-xs ml-2">Proficient</Badge>
                      )}
                    </Label>
                  </div>
                  <div className="text-right min-w-[3rem]">
                    <span className="font-mono font-bold text-lg">
                      {formatModifier(modifier)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Saving Throws:</p>
              <p className="text-muted-foreground">
                - Each class grants proficiency in exactly two saving throws
              </p>
              <p className="text-muted-foreground">
                - These proficiencies are determined by your class and cannot be changed
              </p>
              <p className="text-muted-foreground">
                - Proficiency adds +{getProficiencyBonus(level)} to your saving throw rolls
              </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

