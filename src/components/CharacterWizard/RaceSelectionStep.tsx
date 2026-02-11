import { DnD5eCharacter } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllRaces } from "@/data/races";
import { Check } from "lucide-react";

interface RaceSelectionStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

export const RaceSelectionStep = ({ character, setCharacter }: RaceSelectionStepProps) => {
  const races = getAllRaces();

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Choose Your Race</CardTitle>
          <CardDescription>
            Your race determines your character's innate traits and abilities
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {races.map((race) => {
          const isSelected = character.race === race.name;
          
          return (
            <Card
              key={race.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                isSelected
                  ? "border-primary border-2 bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setCharacter({ ...character, race: race.name, raceId: race.id })}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{race.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {race.size} | {race.speed} ft speed
                    </CardDescription>
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
                  <p className="text-sm font-medium mb-2">Traits:</p>
                  <div className="flex flex-wrap gap-2">
                    {race.traits.slice(0, 3).map((trait, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {trait.name}
                      </Badge>
                    ))}
                    {race.traits.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{race.traits.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {race.languages && race.languages.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Languages: {race.languages.join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {character.race && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-semibold text-foreground">{character.race}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

