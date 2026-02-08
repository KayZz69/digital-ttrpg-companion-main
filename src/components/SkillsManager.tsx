import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SkillProficiency, SkillProficiencyLevel, DnD5eAbilityScores } from "@/types/character";

interface Skill {
  name: string;
  ability: keyof DnD5eAbilityScores;
}

const SKILLS: Skill[] = [
  { name: "Acrobatics", ability: "dexterity" },
  { name: "Animal Handling", ability: "wisdom" },
  { name: "Arcana", ability: "intelligence" },
  { name: "Athletics", ability: "strength" },
  { name: "Deception", ability: "charisma" },
  { name: "History", ability: "intelligence" },
  { name: "Insight", ability: "wisdom" },
  { name: "Intimidation", ability: "charisma" },
  { name: "Investigation", ability: "intelligence" },
  { name: "Medicine", ability: "wisdom" },
  { name: "Nature", ability: "intelligence" },
  { name: "Perception", ability: "wisdom" },
  { name: "Performance", ability: "charisma" },
  { name: "Persuasion", ability: "charisma" },
  { name: "Religion", ability: "intelligence" },
  { name: "Sleight of Hand", ability: "dexterity" },
  { name: "Stealth", ability: "dexterity" },
  { name: "Survival", ability: "wisdom" },
];

interface SkillsManagerProps {
  abilityScores: DnD5eAbilityScores;
  level: number;
  skills: SkillProficiency;
  onUpdateSkills: (skills: SkillProficiency) => void;
  readOnly?: boolean;
}

export const SkillsManager = ({ abilityScores, level, skills, onUpdateSkills, readOnly = false }: SkillsManagerProps) => {
  const getProficiencyBonus = (characterLevel: number): number => {
    return Math.floor((characterLevel - 1) / 4) + 2;
  };

  const getAbilityModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getSkillModifier = (skill: Skill, proficiencyLevel: SkillProficiencyLevel): number => {
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
    const next: SkillProficiencyLevel = current === "none" ? "proficient" : "none";
    
    onUpdateSkills({
      ...skills,
      [skillName]: next,
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
      // Can't click second checkbox if not proficient
      next = "proficient";
    }
    
    onUpdateSkills({
      ...skills,
      [skillName]: next,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Skills</span>
          <span className="text-sm font-normal text-muted-foreground">
            Proficiency Bonus: {formatModifier(getProficiencyBonus(level))}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {SKILLS.map((skill) => {
            const profLevel = skills[skill.name] || "none";
            const modifier = getSkillModifier(skill, profLevel);
            
            return (
              <div
                key={skill.name}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex gap-1">
                    <Checkbox
                      id={`${skill.name}-prof`}
                      checked={profLevel === "proficient" || profLevel === "expert"}
                      onCheckedChange={() => toggleFirstCheckbox(skill.name)}
                      aria-label={`${skill.name} proficiency`}
                      disabled={readOnly}
                    />
                    <Checkbox
                      id={`${skill.name}-expert`}
                      checked={profLevel === "expert"}
                      onCheckedChange={() => toggleSecondCheckbox(skill.name)}
                      aria-label={`${skill.name} expertise`}
                      disabled={readOnly}
                    />
                  </div>
                  <Label
                    htmlFor={`${skill.name}-prof`}
                    className="cursor-pointer flex-1"
                  >
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({skill.ability.slice(0, 3).toUpperCase()})
                    </span>
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
          <p>- One checkbox = Proficient (adds proficiency bonus)</p>
          <p>- Two checkboxes = Expert (adds double proficiency bonus)</p>
        </div>
      </CardContent>
    </Card>
  );
};

