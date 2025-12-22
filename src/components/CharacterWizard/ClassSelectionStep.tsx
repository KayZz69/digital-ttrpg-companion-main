import { DnD5eCharacter, SavingThrowProficiency } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllClasses } from "@/data/classes";
import { Class } from "@/data/types";
import { Check, Heart, Shield, Sparkles } from "lucide-react";

interface ClassSelectionStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

export const ClassSelectionStep = ({ character, setCharacter }: ClassSelectionStepProps) => {
  const classes = getAllClasses();

  const handleClassSelect = (cls: Class) => {
    // Auto-apply saving throw proficiencies from class
    const savingThrows: SavingThrowProficiency = {};
    const abilityMap: Record<string, string> = {
      "Strength": "strength",
      "Dexterity": "dexterity",
      "Constitution": "constitution",
      "Intelligence": "intelligence",
      "Wisdom": "wisdom",
      "Charisma": "charisma"
    };

    cls.savingThrows.forEach((save: string) => {
      const abilityKey = abilityMap[save];
      if (abilityKey) {
        savingThrows[abilityKey] = true;
      }
    });

    setCharacter({
      ...character,
      class: cls.name,
      savingThrows: savingThrows,
      skills: character.skills || {} // Preserve existing skills
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Choose Your Class</CardTitle>
          <CardDescription>
            Your class defines your character's abilities, skills, and role in the party
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((cls) => {
          const isSelected = character.class === cls.name;

          return (
            <Card
              key={cls.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${isSelected
                  ? "border-primary border-2 bg-primary/5"
                  : "border-border hover:border-primary/50"
                }`}
              onClick={() => handleClassSelect(cls)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{cls.name}</CardTitle>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Heart className="h-3 w-3" />
                        <span>Hit Die: d{cls.hitDie}</span>
                      </div>
                      {cls.spellcasting && (
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3" />
                          <span>Spellcaster ({cls.spellcasting.ability})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-primary">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Primary Abilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {cls.primaryAbility.map((ability, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs capitalize">
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Proficiencies:</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {cls.armorProficiencies.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{cls.armorProficiencies.join(", ")}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <span className="text-xs">⚔️</span>
                      <span>{cls.weaponProficiencies.join(", ")}</span>
                    </div>
                  </div>
                </div>

                {cls.subclasses && cls.subclasses.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Subclasses: {cls.subclasses.slice(0, 2).join(", ")}
                      {cls.subclasses.length > 2 && ` +${cls.subclasses.length - 2} more`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {character.class && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-semibold text-foreground">{character.class}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
