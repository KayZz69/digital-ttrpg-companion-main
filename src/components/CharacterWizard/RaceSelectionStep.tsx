import { DnD5eCharacter } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllRaces } from "@/data/races";
import { Check } from "lucide-react";
import {
  ABILITY_KEYS,
  buildRaceAbilityBonuses,
  hasRequiredRaceAbilityChoices,
  parseAbilityScoreIncrease,
} from "@/lib/characterCreationRules";

interface RaceSelectionStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

export const RaceSelectionStep = ({ character, setCharacter }: RaceSelectionStepProps) => {
  const races = getAllRaces();
  const selectedRace = races.find((race) => race.name === character.race);
  const parsedIncrease = parseAbilityScoreIncrease(selectedRace?.abilityScoreIncrease);

  const handleRaceSelect = (raceName: string, raceId: string, abilityScoreIncrease?: string) => {
    const parsed = parseAbilityScoreIncrease(abilityScoreIncrease);
    const existingChoices = character.race === raceName ? character.raceAbilityChoices || [] : [];
    const nextChoices =
      existingChoices.length > 0
        ? existingChoices
        : parsed.choiceBonuses.map((_, index) => ABILITY_KEYS[index]);
    const bonuses = buildRaceAbilityBonuses(abilityScoreIncrease, nextChoices);

    setCharacter({
      ...character,
      race: raceName,
      raceId,
      raceAbilityChoices: nextChoices,
      raceAbilityBonuses: bonuses,
    });
  };

  const handleRaceChoiceChange = (index: number, value: keyof DnD5eCharacter["abilityScores"]) => {
    if (!selectedRace) {
      return;
    }
    const nextChoices = [...(character.raceAbilityChoices || [])];
    nextChoices[index] = value;
    const bonuses = buildRaceAbilityBonuses(selectedRace.abilityScoreIncrease, nextChoices);
    setCharacter({
      ...character,
      raceAbilityChoices: nextChoices,
      raceAbilityBonuses: bonuses,
    });
  };

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
              onClick={() => handleRaceSelect(race.name, race.id, race.abilityScoreIncrease)}
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
                {race.abilityScoreIncrease && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Ability Scores: {race.abilityScoreIncrease}
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
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-semibold text-foreground">{character.race}</span>
            </p>
            {selectedRace && parsedIncrease.choiceBonuses.length > 0 && (
              <div className="space-y-3">
                {parsedIncrease.choiceBonuses.map((bonus, index) => {
                  const firstChoice = character.raceAbilityChoices?.[0];
                  const chosen = character.raceAbilityChoices?.[index];
                  const options = ABILITY_KEYS.filter(
                    (ability) =>
                      !parsedIncrease.requireDistinctChoices ||
                      index === 0 ||
                      !firstChoice ||
                      ability !== firstChoice
                  );
                  return (
                    <div key={`${selectedRace.id}-choice-${index}`} className="space-y-2">
                      <Label className="text-sm">Choose ability for +{bonus}</Label>
                      <Select
                        value={chosen}
                        onValueChange={(value) =>
                          handleRaceChoiceChange(index, value as keyof DnD5eCharacter["abilityScores"])
                        }
                      >
                        <SelectTrigger className="w-full md:w-[280px]">
                          <SelectValue placeholder="Select an ability" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((ability) => (
                            <SelectItem key={ability} value={ability}>
                              {ability.charAt(0).toUpperCase() + ability.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
                {!hasRequiredRaceAbilityChoices(
                  selectedRace.abilityScoreIncrease,
                  character.raceAbilityChoices || []
                ) && (
                  <p className="text-sm text-destructive">
                    Choose valid abilities for all race bonus selections before continuing.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

