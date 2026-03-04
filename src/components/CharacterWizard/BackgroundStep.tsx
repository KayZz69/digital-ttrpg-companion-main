import { DnD5eCharacter, SkillProficiency } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ScrollText } from "lucide-react";
import { getAllBackgroundDefinitions } from "@/lib/dndCompendium";

interface BackgroundStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

export const BackgroundStep = ({ character, setCharacter }: BackgroundStepProps) => {
  const backgrounds = getAllBackgroundDefinitions();

  const applyBackground = (backgroundName: string, skills: string[]) => {
    const nextSkills: SkillProficiency = { ...(character.skills || {}) };
    skills.forEach((skill) => {
      if (!nextSkills[skill] || nextSkills[skill] === "none") {
        nextSkills[skill] = "proficient";
      }
    });

    setCharacter({
      ...character,
      background: backgroundName,
      backgroundSkills: skills,
      skills: nextSkills,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Choose Background
          </CardTitle>
          <CardDescription>
            Your background grants proficiencies and narrative context for your character.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {backgrounds.map((background) => {
          const isSelected = character.background === background.name;
          return (
            <Card
              key={background.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                isSelected
                  ? "border-primary border-2 bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => applyBackground(background.name, background.skills)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{background.name}</CardTitle>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-primary">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Granted Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {background.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

