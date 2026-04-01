import { DnD5eCharacter, SkillProficiency } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, ScrollText, AlertTriangle } from "lucide-react";
import { getAllBackgroundDefinitions, getClassSkillChoices } from "@/lib/dndCompendium";
import { Background } from "@/data/types";

interface BackgroundStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

/**
 * Returns background skills that overlap with the character's class skill list.
 */
export function getSkillOverlaps(
  backgroundSkills: string[],
  classSkillChoices: string[]
): string[] {
  return backgroundSkills.filter((skill) => classSkillChoices.includes(skill));
}

export const BackgroundStep = ({ character, setCharacter }: BackgroundStepProps) => {
  const backgrounds = getAllBackgroundDefinitions();
  const classSkillChoices = getClassSkillChoices(character.class || "");

  const applyBackground = (background: Background) => {
    const nextSkills: SkillProficiency = { ...(character.skills || {}) };

    // Clear previously applied background skills
    const previousBgSkills = character.backgroundSkills || [];
    previousBgSkills.forEach((skill) => {
      if (nextSkills[skill] === "proficient") {
        delete nextSkills[skill];
      }
    });

    // Apply new background skills
    background.skills.forEach((skill) => {
      if (!nextSkills[skill] || nextSkills[skill] === "none") {
        nextSkills[skill] = "proficient";
      }
    });

    setCharacter({
      ...character,
      background: background.name,
      backgroundSkills: background.skills,
      backgroundTools: background.tools && background.tools.length > 0 ? background.tools : undefined,
      backgroundLanguages: background.languages && background.languages.length > 0 ? background.languages : undefined,
      backgroundEquipment: background.equipment && background.equipment.length > 0 ? background.equipment : undefined,
      backgroundFeat: background.feat || undefined,
      skills: nextSkills,
    });
  };

  const overlaps = character.backgroundSkills
    ? getSkillOverlaps(character.backgroundSkills, classSkillChoices.from)
    : [];

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Choose Background
          </CardTitle>
          <CardDescription>
            Your background grants skill proficiencies, tool proficiencies, languages,
            starting equipment, and an origin feat.
          </CardDescription>
        </CardHeader>
      </Card>

      {overlaps.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your background and class share skill proficiencies:{" "}
            <strong>{overlaps.join(", ")}</strong>. You may want to pick different
            class skills in the next step to avoid overlap.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backgrounds.map((background) => {
          const isSelected = character.background === background.name;
          return (
            <Card
              key={background.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${isSelected
                  ? "border-primary border-2 bg-primary/5"
                  : "border-border hover:border-primary/50"
                }`}
              onClick={() => applyBackground(background)}
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
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Skills:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {background.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {background.tools && background.tools.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tools:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {background.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {background.languages && background.languages.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Languages:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {background.languages.map((lang, idx) => (
                        <Badge key={`${lang}-${idx}`} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {background.equipment && background.equipment.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Equipment:</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {background.equipment.join(", ")}
                    </p>
                  </div>
                )}

                {background.feat && (
                  <div>
                    <p className="text-sm text-muted-foreground">Origin Feat:</p>
                    <Badge variant="default" className="text-xs mt-1">
                      {background.feat}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
