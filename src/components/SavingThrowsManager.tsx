import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SavingThrowProficiency, DnD5eAbilityScores } from "@/types/character";

interface SavingThrowsManagerProps {
  abilityScores: DnD5eAbilityScores;
  level: number;
  savingThrows: SavingThrowProficiency;
  onUpdateSavingThrows: (savingThrows: SavingThrowProficiency) => void;
  readOnly?: boolean;
}

export const SavingThrowsManager = ({ 
  abilityScores, 
  level, 
  savingThrows, 
  onUpdateSavingThrows,
  readOnly = false
}: SavingThrowsManagerProps) => {
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
    onUpdateSavingThrows({
      ...savingThrows,
      [ability]: !savingThrows[ability],
    });
  };

  const abilities: Array<{ name: keyof DnD5eAbilityScores; label: string }> = [
    { name: "strength", label: "Strength" },
    { name: "dexterity", label: "Dexterity" },
    { name: "constitution", label: "Constitution" },
    { name: "intelligence", label: "Intelligence" },
    { name: "wisdom", label: "Wisdom" },
    { name: "charisma", label: "Charisma" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Saving Throws</span>
          <span className="text-sm font-normal text-muted-foreground">
            Proficiency Bonus: {formatModifier(getProficiencyBonus(level))}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {abilities.map((ability) => {
            const isProficient = savingThrows[ability.name] || false;
            const modifier = getSavingThrowModifier(ability.name, isProficient);
            
            return (
              <div
                key={ability.name}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    id={`${ability.name}-save`}
                    checked={isProficient}
                    onCheckedChange={() => toggleProficiency(ability.name)}
                    aria-label={`${ability.label} saving throw proficiency`}
                    disabled={readOnly}
                  />
                  <Label
                    htmlFor={`${ability.name}-save`}
                    className="cursor-pointer flex-1 font-medium"
                  >
                    {ability.label}
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
        <div className="mt-4 p-3 rounded-md bg-muted/30 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Legend:</p>
          <p>- Checked = Proficient (adds proficiency bonus to saving throw)</p>
        </div>
      </CardContent>
    </Card>
  );
};

