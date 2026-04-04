import { DnD5eCharacter, DnD5eAbilityScores } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Sparkles,
  Scroll,
  Swords,
  BookOpen,
  Heart,
  CheckCircle2,
  XCircle,
  Backpack,
} from "lucide-react";
import { applyAbilityBonuses, ABILITY_KEYS } from "@/lib/characterCreationRules";
import {
  getClassHitDie,
  getClassSavingThrowKeys,
  getClassSpellcastingAbility,
  getRaceByName,
  isSpellcastingClass,
} from "@/lib/dndCompendium";
import { getAbilityModifier, getSpellSelectionState } from "@/lib/dndRules";
import { validateAllSteps, type WizardStepKey } from "@/lib/wizardValidation";

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

const SAVE_LABELS: Record<string, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
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

  const visibleSteps: WizardStepKey[] = [
    "basic", "race", "class", "background", "abilities",
    "skills", "saves",
    ...(isSpellcastingClass(character.class || "") ? ["spells" as WizardStepKey] : []),
    "equipment",
  ];
  const stepResults = validateAllSteps(character, visibleSteps);
  const allValid = stepResults.every((r) => r.valid);

  const constitution = effectiveAbilityScores.constitution || 10;
  const conMod = getAbilityModifier(constitution);
  const hitDie = getClassHitDie(character.class || "");
  const maxHP = character.class ? Math.max(1, hitDie + conMod) : 0;

  const savingThrowKeys = getClassSavingThrowKeys(character.class || "");

  const proficientSkills = Object.entries(character.skills || {})
    .filter(([, level]) => level === "proficient")
    .map(([name]) => name);
  const expertSkills = Object.entries(character.skills || {})
    .filter(([, level]) => level === "expert")
    .map(([name]) => name);

  const cantrips = (character.preparedSpells || []).filter((s) => s.level === 0);
  const leveledSpells = (character.preparedSpells || []).filter((s) => s.level > 0);

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

      {/* Validation Summary */}
      <Card data-testid="validation-summary">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {allValid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <CardTitle className="text-lg">
              {allValid ? "Ready to Create" : "Steps Need Attention"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stepResults.map((result) => (
              <Badge
                key={result.key}
                variant={result.valid ? "secondary" : "destructive"}
                className="gap-1"
                data-testid={`step-status-${result.key}`}
              >
                {result.valid ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {result.label}
              </Badge>
            ))}
          </div>
          {!allValid && (
            <p className="text-sm text-destructive mt-3">
              {stepResults.find((r) => !r.valid)?.error}
            </p>
          )}
        </CardContent>
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

      {/* Hit Points & Saving Throws */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="hp-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Hit Points</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{maxHP}</span>
              <span className="text-sm text-muted-foreground">HP at Level 1</span>
            </div>
            <p className="text-xs text-muted-foreground">
              d{hitDie} (max) {conMod >= 0 ? "+" : ""}{conMod} CON modifier
            </p>
          </CardContent>
        </Card>

        <Card data-testid="saves-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Saving Throws</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {savingThrowKeys.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {savingThrowKeys.map((key) => (
                  <Badge key={key} variant="secondary" data-testid={`save-${key}`}>
                    {SAVE_LABELS[key] || key}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No class selected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {(proficientSkills.length > 0 || expertSkills.length > 0) && (
        <Card data-testid="skills-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Skills</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {proficientSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Proficient</p>
                <div className="flex flex-wrap gap-2">
                  {proficientSkills.map((skill) => (
                    <Badge key={skill} variant="outline" data-testid={`skill-proficient-${skill}`}>
                      {skill}
                      {(character.backgroundSkills || []).includes(skill) && (
                        <span className="ml-1 text-xs opacity-60">(bg)</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {expertSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {expertSkills.map((skill) => (
                    <Badge key={skill} variant="default" data-testid={`skill-expert-${skill}`}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* Background Details */}
      {character.background && (
        <Card data-testid="background-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scroll className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Background: {character.background}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {character.backgroundSkills && character.backgroundSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {character.backgroundSkills.map((skill) => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            {character.backgroundTools && character.backgroundTools.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tool Proficiencies</p>
                <div className="flex flex-wrap gap-2">
                  {character.backgroundTools.map((tool) => (
                    <Badge key={tool} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </div>
            )}
            {character.backgroundLanguages && character.backgroundLanguages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {character.backgroundLanguages.map((lang) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}
            {character.backgroundFeat && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Origin Feat</p>
                <Badge variant="secondary">{character.backgroundFeat}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipment */}
      {character.inventory && character.inventory.length > 0 && (
        <Card data-testid="equipment-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Backpack className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Equipment</CardTitle>
            </div>
            <CardDescription>
              Source: {character.equipmentSelectionMode === "gold-buy" ? "Gold-buy selection" : "Class package"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1">
              {character.inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-1 text-sm"
                  data-testid={`equipment-item-${item.id}`}
                >
                  <span>{item.name}</span>
                  {item.quantity > 1 && (
                    <Badge variant="outline" className="text-xs">
                      x{item.quantity}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spells */}
      {spellSummary && isSpellcastingClass(character.class || "") && (
        <Card data-testid="spells-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Spellcasting</CardTitle>
            </div>
            <CardDescription>
              {spellSummary.mode === "known" ? "Known" : "Prepared"} caster
              {spellcastingAbility && ` (${ABILITY_LABELS[spellcastingAbility]})`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cantrips.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Cantrips ({cantrips.length}
                  {spellSummary.maxCantrips !== null ? `/${spellSummary.maxCantrips}` : ""})
                </p>
                <div className="flex flex-wrap gap-2">
                  {cantrips.map((spell) => (
                    <Badge key={spell.id} variant="outline">{spell.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {leveledSpells.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Leveled Spells ({leveledSpells.length}
                  {spellSummary.maxLeveledSpells !== null ? `/${spellSummary.maxLeveledSpells}` : ""})
                </p>
                <div className="flex flex-wrap gap-2">
                  {leveledSpells.map((spell) => (
                    <Badge key={spell.id} variant="outline">
                      {spell.name}
                      <span className="ml-1 text-xs opacity-60">Lv{spell.level}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
            ready to embark on epic adventures.
            {maxHP > 0 && (
              <> Starting with <span className="font-semibold text-foreground">{maxHP} HP</span>.</>
            )}
          </p>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            {bonuses && (
              <p>
                Race bonuses applied:{" "}
                {Object.entries(bonuses)
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
