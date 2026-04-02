import { DnD5eCharacter, DnD5eAbilityScores } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Sparkles, Scroll, Backpack, BookOpen, GraduationCap } from "lucide-react";
import { applyAbilityBonuses, ABILITY_KEYS } from "@/lib/characterCreationRules";
import { getClassSpellcastingAbility, getRaceByName, isSpellcastingClass, getClassSavingThrowProficiencies } from "@/lib/dndCompendium";
import { getRegistrySpellSelectionState } from "@/lib/rules/spells";

interface ReviewStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

const DEFAULT_SCORES: DnD5eAbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

const ABILITY_LABELS: Record<keyof DnD5eAbilityScores, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

export const ReviewStep = ({ character }: ReviewStepProps) => {
  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  const baseAbilityScores = (character.abilityScores || DEFAULT_SCORES) as DnD5eAbilityScores;
  const bonuses = character.raceAbilityBonuses;
  const effectiveAbilityScores = applyAbilityBonuses(baseAbilityScores, bonuses);

  const raceData = getRaceByName(character.race || "");

  const spellcastingAbility = getClassSpellcastingAbility(character.class || "");
  const spellSummary =
    character.class && spellcastingAbility
      ? getRegistrySpellSelectionState(
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
            <CardDescription>Final scores after racial modifiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {ABILITY_KEYS.map((ability) => {
                const baseScore = baseAbilityScores[ability];
                const finalScore = effectiveAbilityScores[ability];
                const racialBonus = bonuses?.[ability] || 0;
                const modifier = getModifier(finalScore);

                return (
                  <div
                    key={ability}
                    className="flex flex-col items-center p-3 bg-muted rounded-lg"
                    data-testid={`ability-${ability}`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{ABILITY_LABELS[ability]}</p>
                    <p className="text-2xl font-bold">{finalScore}</p>
                    <p className={`text-sm font-semibold ${
                      parseInt(modifier) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}>
                      {modifier}
                    </p>
                    {racialBonus > 0 && (
                      <p className="text-xs text-primary mt-1" data-testid={`racial-bonus-${ability}`}>
                        {baseScore} + {racialBonus} racial
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Race Traits and Languages */}
      {raceData && (raceData.traits.length > 0 || (raceData.languages && raceData.languages.length > 0)) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Race Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {raceData.languages && raceData.languages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {raceData.languages.map((lang) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}
            {raceData.traits.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Racial Traits</p>
                <div className="space-y-2">
                  {raceData.traits.map((trait) => (
                    <div key={trait.name} className="border rounded-md p-3">
                      <p className="font-semibold text-sm">{trait.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skills & Proficiencies */}
      {character.skills && Object.keys(character.skills).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Skills & Proficiencies</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Background Skills */}
            {character.backgroundSkills && character.backgroundSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Background Skills</p>
                <div className="flex flex-wrap gap-2">
                  {character.backgroundSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            {/* Class Skill Choices */}
            {character.class && (() => {
              const backgroundSkills = new Set(character.backgroundSkills || []);
              const classSkills = Object.entries(character.skills || {})
                .filter(([name, level]) => !backgroundSkills.has(name) && level !== "none" && level !== "expert")
                .map(([name]) => name);
              return classSkills.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Class Skill Choices</p>
                  <div className="flex flex-wrap gap-2">
                    {classSkills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            {/* Expertise */}
            {(() => {
              const expertSkills = Object.entries(character.skills || {})
                .filter(([, level]) => level === "expert")
                .map(([name]) => name);
              return expertSkills.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {expertSkills.map((skill) => (
                      <Badge key={skill} className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">{skill}</Badge>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}

      {/* Saving Throws */}
      {character.class && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Saving Throws</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ABILITY_KEYS.map((ability) => {
                const savingThrows = character.savingThrows || getClassSavingThrowProficiencies(character.class!);
                const isProficient = savingThrows[ability] === true;
                return (
                  <Badge
                    key={ability}
                    variant={isProficient ? "default" : "outline"}
                    className={isProficient ? "" : "opacity-50"}
                  >
                    {ABILITY_LABELS[ability]}{isProficient ? " \u2713" : ""}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Background Grants */}
      {character.background && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Background: {character.background}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {character.backgroundSkills && character.backgroundSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Skills</p>
                <p className="text-sm">{character.backgroundSkills.join(", ")}</p>
              </div>
            )}
            {character.backgroundTools && character.backgroundTools.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tool Proficiencies</p>
                <p className="text-sm">{character.backgroundTools.join(", ")}</p>
              </div>
            )}
            {character.backgroundLanguages && character.backgroundLanguages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Languages</p>
                <p className="text-sm">{character.backgroundLanguages.join(", ")}</p>
              </div>
            )}
            {character.backgroundEquipment && character.backgroundEquipment.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Starting Equipment</p>
                <p className="text-sm">{character.backgroundEquipment.join(", ")}</p>
              </div>
            )}
            {character.backgroundFeat && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Feat</p>
                <Badge>{character.backgroundFeat}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spells */}
      {character.class && isSpellcastingClass(character.class) && character.preparedSpells && character.preparedSpells.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Spells</CardTitle>
            </div>
            {spellSummary && (
              <CardDescription>
                {spellSummary.mode === "known" ? "Known" : "Prepared"} spellcaster ({spellcastingAbility ? spellcastingAbility.charAt(0).toUpperCase() + spellcastingAbility.slice(1) : ""})
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Group spells by level */}
            {(() => {
              const grouped = (character.preparedSpells || []).reduce<Record<number, typeof character.preparedSpells>>((acc, spell) => {
                const lvl = spell.level;
                if (!acc[lvl]) acc[lvl] = [];
                acc[lvl]!.push(spell);
                return acc;
              }, {});
              return Object.entries(grouped)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([level, spellList]) => (
                  <div key={level}>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {Number(level) === 0 ? "Cantrips" : `Level ${level}`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {spellList!.map((spell) => (
                        <Badge key={spell.id} variant={Number(level) === 0 ? "secondary" : "outline"}>
                          {spell.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ));
            })()}
          </CardContent>
        </Card>
      )}

      {/* Equipment */}
      {character.inventory && character.inventory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Backpack className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Starting Equipment</CardTitle>
            </div>
            <CardDescription>
              {character.equipmentSelectionMode === "gold-buy" ? "Gold-buy selection" : "Class package"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {character.inventory.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name}{item.quantity > 1 ? ` (\u00d7${item.quantity})` : ""}</span>
                  {item.weight > 0 && (
                    <span className="text-muted-foreground">{(item.weight * item.quantity).toFixed(1)} lb</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
