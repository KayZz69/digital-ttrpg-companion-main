import { DnD5eCharacter, DnD5eAbilityScores } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Sparkles, Scroll } from "lucide-react";
import { applyAbilityBonuses } from "@/lib/characterCreationRules";
import { getClassSpellcastingAbility } from "@/lib/dndCompendium";
import { getSpellSelectionState } from "@/lib/dndRules";

interface ReviewStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

export const ReviewStep = ({ character }: ReviewStepProps) => {
  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  const effectiveAbilityScores = applyAbilityBonuses(
    (character.abilityScores || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    }) as DnD5eAbilityScores,
    character.raceAbilityBonuses
  );
  const spellcastingAbility = getClassSpellcastingAbility(character.class || "");
  const spellSummary =
    character.class && spellcastingAbility
      ? getSpellSelectionState(
          character.class,
          character.level || 1,
          effectiveAbilityScores[spellcastingAbility],
          character.preparedSpells || []
        )
      : null;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>Review Your Character</CardTitle>
          <CardDescription>
            Review your character details before finalizing the creation
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Character Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-xl font-bold">{character.name}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Race</p>
                <p className="font-semibold">{character.race}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-semibold">{character.class}</p>
              </div>
            </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  Level {character.level}
                </Badge>
              </div>
              {character.background && (
                <div>
                  <p className="text-sm text-muted-foreground">Background</p>
                  <p className="font-semibold">{character.background}</p>
                </div>
              )}
            </CardContent>
          </Card>

        {/* Ability Scores */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Ability Scores</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(effectiveAbilityScores || {}) as (keyof DnD5eAbilityScores)[]).map(
                (ability) => {
                  const score = effectiveAbilityScores?.[ability] || 10;
                  const modifier = getModifier(score);

                  return (
                    <div
                      key={ability}
                      className="flex flex-col items-center p-3 bg-muted rounded-lg"
                    >
                      <p className="text-xs text-muted-foreground capitalize mb-1">{ability.slice(0, 3)}</p>
                      <p className="text-2xl font-bold">{score}</p>
                      <p className={`text-sm font-semibold ${
                        parseInt(modifier) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}>
                        {modifier}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scroll className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Character Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            <span className="font-bold text-foreground">{character.name}</span> is a{" "}
            <span className="font-semibold text-foreground">Level {character.level} {character.race} {character.class}</span>{" "}
            ready to embark on epic adventures. Your character begins with balanced ability scores
            and is prepared to face the challenges ahead.
          </p>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            {spellSummary && (
              <p>
                Spellcasting: {spellSummary.mode === "known" ? "Known" : "Prepared"} | Cantrips{" "}
                {spellSummary.currentCantrips}
                {spellSummary.maxCantrips !== null ? `/${spellSummary.maxCantrips}` : ""} | Leveled{" "}
                {spellSummary.currentLeveledSpells}
                {spellSummary.maxLeveledSpells !== null ? `/${spellSummary.maxLeveledSpells}` : ""}
              </p>
            )}
            <p>
              Equipment source:{" "}
              {character.equipmentSelectionMode === "gold-buy" ? "Gold-buy selection" : "Class package"}
            </p>
            {character.raceAbilityBonuses && (
              <p>
                Race bonuses applied:{" "}
                {Object.entries(character.raceAbilityBonuses)
                  .filter(([, value]) => (value || 0) > 0)
                  .map(([ability, value]) => `${ability} +${value}`)
                  .join(", ") || "None"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground">
            After creation, you can manage your character's inventory, spells, skills, and more
            from the character sheet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
