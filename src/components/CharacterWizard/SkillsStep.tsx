import { DnD5eCharacter, SkillProficiency, SkillProficiencyLevel, DnD5eAbilityScores } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getClassSkillChoices, SKILL_DEFINITIONS } from "@/lib/dndCompendium";
import { getAbilityModifier, getProficiencyBonus } from "@/lib/dndRules";
import { Info } from "lucide-react";

interface SkillsStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

export const SkillsStep = ({ character, setCharacter }: SkillsStepProps) => {
  const skills = character.skills || {};
  const abilityScores = character.abilityScores!;
  const level = character.level || 1;
  
  const skillChoices = getClassSkillChoices(character.class || "");
  const availableSkills = skillChoices.from;
  
  // Count selected skills from available list
  const selectedCount = SKILL_DEFINITIONS.filter(skill => {
    const profLevel = skills[skill.name] || "none";
    return availableSkills.includes(skill.name) && profLevel !== "none";
  }).length;

  const getSkillModifier = (
    skill: { name: string; ability: keyof DnD5eAbilityScores },
    proficiencyLevel: SkillProficiencyLevel
  ): number => {
    const abilityMod = getAbilityModifier(abilityScores[skill.ability]);
    const profBonus = getProficiencyBonus(level);
    
    if (proficiencyLevel === "expert") {
      return abilityMod + (profBonus * 2);
    } else if (proficiencyLevel === "proficient") {
      return abilityMod + profBonus;
    }
    return abilityMod;
  };

  const formatModifier = (value: number): string => {
    return value >= 0 ? `+${value}` : `${value}`;
  };

  const toggleFirstCheckbox = (skillName: string) => {
    const current = skills[skillName] || "none";
    const isAvailable = availableSkills.includes(skillName);
    
    // If trying to select and already at limit, don't allow
    if (current === "none" && selectedCount >= skillChoices.choose && isAvailable) {
      return;
    }
    
    const next: SkillProficiencyLevel = current === "none" ? "proficient" : "none";
    
    setCharacter({
      ...character,
      skills: {
        ...skills,
        [skillName]: next,
      },
    });
  };

  const toggleSecondCheckbox = (skillName: string) => {
    const current = skills[skillName] || "none";
    let next: SkillProficiencyLevel = "none";
    
    if (current === "expert") {
      next = "proficient";
    } else if (current === "proficient") {
      next = "expert";
    } else {
      next = "proficient";
    }
    
    setCharacter({
      ...character,
      skills: {
        ...skills,
        [skillName]: next,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Skill Proficiencies</CardTitle>
          <CardDescription>
            Select {skillChoices.choose} skill{skillChoices.choose !== 1 ? 's' : ''} from your class list
          </CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">Proficiency Bonus: {formatModifier(getProficiencyBonus(level))}</Badge>
            <Badge variant={selectedCount >= skillChoices.choose ? "default" : "secondary"}>
              {selectedCount} / {skillChoices.choose} Selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {skillChoices.choose === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your class doesn't provide skill proficiencies during character creation.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {SKILL_DEFINITIONS.map((skill) => {
                const profLevel = skills[skill.name] || "none";
                const modifier = getSkillModifier(skill, profLevel);
                const isAvailable = availableSkills.includes(skill.name);
                const isDisabled = !isAvailable || (profLevel === "none" && selectedCount >= skillChoices.choose);
                
                return (
                  <div
                    key={skill.name}
                    className={`flex items-center justify-between p-3 rounded-md transition-colors border ${
                      isAvailable 
                        ? "hover:bg-muted/50" 
                        : "opacity-50 bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex gap-1">
                        <Checkbox
                          id={`${skill.name}-prof`}
                          checked={profLevel === "proficient" || profLevel === "expert"}
                          onCheckedChange={() => toggleFirstCheckbox(skill.name)}
                          aria-label={`${skill.name} proficiency`}
                          disabled={isDisabled}
                        />
                        <Checkbox
                          id={`${skill.name}-expert`}
                          checked={profLevel === "expert"}
                          onCheckedChange={() => toggleSecondCheckbox(skill.name)}
                          disabled={profLevel === "none" || !isAvailable}
                          aria-label={`${skill.name} expertise`}
                        />
                      </div>
                      <Label
                        htmlFor={`${skill.name}-prof`}
                        className={`flex-1 font-medium ${isAvailable ? "cursor-pointer" : "cursor-not-allowed"}`}
                      >
                        {skill.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({skill.ability.substring(0, 3).toUpperCase()})
                        </span>
                        {!isAvailable && (
                          <span className="text-xs text-muted-foreground ml-2">(Not available for your class)</span>
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
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Skill Selection Rules:</p>
            <p className="text-muted-foreground">
              - Your class determines which skills you can choose
            </p>
            <p className="text-muted-foreground">
              - First checkbox = Proficient (adds proficiency bonus)
            </p>
            <p className="text-muted-foreground">
              - Second checkbox = Expertise (doubles proficiency bonus)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

