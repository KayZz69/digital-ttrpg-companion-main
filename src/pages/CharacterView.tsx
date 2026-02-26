/**
 * @fileoverview Character View page displaying full character sheet.
 * Provides HP management, rest mechanics, conditions, ability scores, skills,
 * saving throws, spell management, and inventory for D&D 5e characters.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Character, DnD5eCharacter, InventoryItem, SkillProficiency, SavingThrowProficiency, SpellSlots, PreparedSpell, DeathSaves, Condition } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InventoryManager } from "@/components/InventoryManager";
import { SkillsManager } from "@/components/SkillsManager";
import { SavingThrowsManager } from "@/components/SavingThrowsManager";
import { SpellsManager } from "@/components/SpellsManager";
import { LevelUpWizard } from "@/components/LevelUpWizard/LevelUpWizard";
import { ArrowLeft, Edit, Dices, Heart, Skull, Plus, Minus, Moon, Sun, X, Circle, CheckCircle2, XCircle, BookOpen, Swords, TrendingUp, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { readCharacters, writeCharacters } from "@/lib/storage";
import { getClassHitDie } from "@/lib/dndCompendium";
import { getProficiencyBonus } from "@/lib/dndRules";
import { canLevelUp, getXPForLevel, getXPProgress, MAX_LEVEL } from "@/utils/progressionUtils";

/**
 * Character View page component.
 * Displays a complete D&D 5e character sheet with interactive elements:
 * - HP tracking with damage/heal/full restore
 * - Short and long rest mechanics
 * - Death saves (at 0 HP)
 * - Status conditions toggle
 * - Ability scores and modifiers
 * - Skills and saving throws
 * - Spell slot and prepared spell management
 * - Inventory and equipment
 *
 * @route /character/:id
 */
export const CharacterView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [hpAdjustment, setHpAdjustment] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "ready" | "not_found">("loading");
  const [showLevelUpWizard, setShowLevelUpWizard] = useState(false);
  const [xpInput, setXpInput] = useState<string>("");

  useEffect(() => {
    if (id) {
      loadCharacter(id);
    } else {
      setStatus("not_found");
    }
  }, [id]);

  const loadCharacter = (characterId: string) => {
    const characters = readCharacters();
    const found = characters.find((c) => c.id === characterId);
    if (found) {
      setCharacter(found);
      setStatus("ready");
    } else {
      setCharacter(null);
      setStatus("not_found");
      toast({
        title: "Character Not Found",
        description: "The character you're looking for doesn't exist.",
        variant: "destructive",
      });
    }
  };

  const saveCharacter = (updatedCharacter: Character) => {
    const characters = readCharacters();
    const index = characters.findIndex((c) => c.id === updatedCharacter.id);
    if (index !== -1) {
      characters[index] = {
        ...updatedCharacter,
        updatedAt: new Date().toISOString(),
      };
      writeCharacters(characters);
      setCharacter(characters[index]);
    }
  };

  const updateHP = (newCurrent: number) => {
    if (!character) return;

    const dndChar = character.data as DnD5eCharacter;
    const clampedHP = Math.max(0, Math.min(newCurrent, dndChar.hitPoints.max));

    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        hitPoints: {
          ...dndChar.hitPoints,
          current: clampedHP,
        },
      },
    };

    saveCharacter(updatedCharacter);

    if (clampedHP === 0) {
      toast({
        title: "Character Unconscious!",
        description: `${dndChar.name} has fallen to 0 HP!`,
        variant: "destructive",
      });
    }
  };

  const takeDamage = () => {
    const amount = parseInt(hpAdjustment) || 0;
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive number for damage.",
        variant: "destructive",
      });
      return;
    }

    const dndChar = character?.data as DnD5eCharacter;
    updateHP(dndChar.hitPoints.current - amount);
    setHpAdjustment("");

    toast({
      title: "Damage Taken",
      description: `${dndChar.name} took ${amount} damage!`,
    });
  };

  const heal = () => {
    const amount = parseInt(hpAdjustment) || 0;
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive number for healing.",
        variant: "destructive",
      });
      return;
    }

    const dndChar = character?.data as DnD5eCharacter;
    updateHP(dndChar.hitPoints.current + amount);
    setHpAdjustment("");

    toast({
      title: "Healed",
      description: `${dndChar.name} recovered ${amount} HP!`,
    });
  };

  const restoreToMax = () => {
    const dndChar = character?.data as DnD5eCharacter;
    updateHP(dndChar.hitPoints.max);

    toast({
      title: "Fully Healed",
      description: `${dndChar.name} is back to full health!`,
    });
  };

  const adjustHP = (amount: number) => {
    const dndChar = character?.data as DnD5eCharacter;
    updateHP(dndChar.hitPoints.current + amount);
  };

  const getHPColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 66) return "text-green-600 dark:text-green-400";
    if (percentage > 33) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getHPProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 66) return "bg-green-600";
    if (percentage > 33) return "bg-yellow-600";
    return "bg-red-600";
  };

  const updateInventory = (newInventory: InventoryItem[]) => {
    if (!character) return;

    const dndChar = character.data as DnD5eCharacter;
    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        inventory: newInventory,
      },
    };

    saveCharacter(updatedCharacter);
  };

  const updateSkills = (newSkills: SkillProficiency) => {
    if (!character) return;

    const dndChar = character.data as DnD5eCharacter;
    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        skills: newSkills,
      },
    };

    saveCharacter(updatedCharacter);
  };

  const updateSavingThrows = (newSavingThrows: SavingThrowProficiency) => {
    if (!character) return;

    const dndChar = character.data as DnD5eCharacter;
    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        savingThrows: newSavingThrows,
      },
    };

    saveCharacter(updatedCharacter);
  };

  const updateSpellSlots = (newSpellSlots: SpellSlots) => {
    if (!character) return;

    const dndChar = character.data as DnD5eCharacter;
    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        spellSlots: newSpellSlots,
      },
    };

    saveCharacter(updatedCharacter);
  };

  const updatePreparedSpells = (newPreparedSpells: PreparedSpell[]) => {
    if (!character) return;

    const dndChar = character.data as DnD5eCharacter;
    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        preparedSpells: newPreparedSpells,
      },
    };

    saveCharacter(updatedCharacter);
  };

  const getCarryingCapacity = (strength: number): number => {
    return strength * 15; // D&D 5e rule: Strength * 15 lbs
  };

  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const updateDeathSaves = (successes: number, failures: number) => {
    if (!character) return;
    const dndChar = character.data as DnD5eCharacter;
    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        deathSaves: { successes, failures },
      },
    };
    saveCharacter(updatedCharacter);
  };

  const toggleCondition = (condition: Condition) => {
    if (!character) return;
    const dndChar = character.data as DnD5eCharacter;
    const currentConditions = dndChar.conditions || [];
    const hasCondition = currentConditions.includes(condition);

    const updatedConditions = hasCondition
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];

    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        conditions: updatedConditions,
      },
    };
    saveCharacter(updatedCharacter);
  };

  const shortRest = () => {
    if (!character) return;
    const dndChar = character.data as DnD5eCharacter;

    // Spend hit dice to heal
    const conMod = Math.floor((dndChar.abilityScores.constitution - 10) / 2);
    const hitDice = dndChar.hitDice || { current: dndChar.level, max: dndChar.level };

    if (hitDice.current > 0) {
      // Roll hit dice (simplified: use average based on class hit die)
      const classHitDie = getClassHitDie(dndChar.class);
      const healAmount = Math.floor(classHitDie / 2) + 1 + conMod;
      const newHP = Math.min(dndChar.hitPoints.current + healAmount, dndChar.hitPoints.max);

      const updatedCharacter: Character = {
        ...character,
        data: {
          ...dndChar,
          hitPoints: { ...dndChar.hitPoints, current: newHP },
          hitDice: { ...hitDice, current: hitDice.current - 1 },
        },
      };
      saveCharacter(updatedCharacter);

      toast({
        title: "Short Rest Complete",
        description: `Spent 1 hit die and healed ${healAmount} HP. ${hitDice.current - 1} hit dice remaining.`,
      });
    } else {
      toast({
        title: "No Hit Dice",
        description: "You need hit dice to heal during a short rest.",
        variant: "destructive",
      });
    }
  };

  const longRest = () => {
    if (!character) return;
    const dndChar = character.data as DnD5eCharacter;

    // Restore HP to max
    const newHP = dndChar.hitPoints.max;

    // Restore spell slots to max
    const restoredSpellSlots = dndChar.spellSlots ? {
      level1: { ...dndChar.spellSlots.level1, current: dndChar.spellSlots.level1.max },
      level2: { ...dndChar.spellSlots.level2, current: dndChar.spellSlots.level2.max },
      level3: { ...dndChar.spellSlots.level3, current: dndChar.spellSlots.level3.max },
      level4: { ...dndChar.spellSlots.level4, current: dndChar.spellSlots.level4.max },
      level5: { ...dndChar.spellSlots.level5, current: dndChar.spellSlots.level5.max },
      level6: { ...dndChar.spellSlots.level6, current: dndChar.spellSlots.level6.max },
      level7: { ...dndChar.spellSlots.level7, current: dndChar.spellSlots.level7.max },
      level8: { ...dndChar.spellSlots.level8, current: dndChar.spellSlots.level8.max },
      level9: { ...dndChar.spellSlots.level9, current: dndChar.spellSlots.level9.max },
    } : undefined;

    // Restore hit dice (at least half)
    const hitDice = dndChar.hitDice || { current: dndChar.level, max: dndChar.level };
    const restoredHitDice = {
      ...hitDice,
      current: Math.min(hitDice.current + Math.max(1, Math.floor(hitDice.max / 2)), hitDice.max),
    };

    // Clear death saves
    const clearedDeathSaves = { successes: 0, failures: 0 };

    // Reduce exhaustion by 1 (if any)
    const newExhaustion = Math.max(0, (dndChar.exhaustionLevel || 0) - 1);

    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        hitPoints: { ...dndChar.hitPoints, current: newHP },
        spellSlots: restoredSpellSlots,
        hitDice: restoredHitDice,
        deathSaves: clearedDeathSaves,
        exhaustionLevel: newExhaustion,
      },
    };
    saveCharacter(updatedCharacter);

    toast({
      title: "Long Rest Complete",
      description: "HP, spell slots, and hit dice restored. Death saves cleared.",
    });
  };

  const addXP = () => {
    if (!character) return;
    const amount = parseInt(xpInput) || 0;
    if (amount <= 0) {
      toast({ title: "Invalid XP", description: "Enter a positive XP amount.", variant: "destructive" });
      return;
    }
    const dndChar = character.data as DnD5eCharacter;
    const newXP = (dndChar.experiencePoints || 0) + amount;
    const updatedCharacter: Character = {
      ...character,
      data: { ...dndChar, experiencePoints: newXP },
    };
    saveCharacter(updatedCharacter);
    setXpInput("");
    toast({ title: `+${amount} XP`, description: `Total: ${newXP} XP` });
  };

  const handleLevelUpConfirm = (result: {
    newLevel: number;
    hpGained: number;
    newMaxHP: number;
    newAbilityScores: DnD5eCharacter["abilityScores"];
  }) => {
    if (!character) return;
    const dndChar = character.data as DnD5eCharacter;
    const updatedCharacter: Character = {
      ...character,
      data: {
        ...dndChar,
        level: result.newLevel,
        abilityScores: result.newAbilityScores,
        hitPoints: {
          current: dndChar.hitPoints.current + result.hpGained,
          max: result.newMaxHP,
        },
        hitDice: {
          current: (dndChar.hitDice?.current ?? dndChar.level) + 1,
          max: result.newLevel,
        },
      },
    };
    saveCharacter(updatedCharacter);
    setShowLevelUpWizard(false);
    toast({
      title: `Level Up! Now level ${result.newLevel}`,
      description: `+${result.hpGained} HP (max: ${result.newMaxHP})`,
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading character...</p>
      </div>
    );
  }

  if (status === "not_found" || !character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Character Not Found</CardTitle>
            <CardDescription>
              This character could not be loaded. It may have been deleted or corrupted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/characters")} className="w-full">
              Back to Characters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dndCharacter = character.data as DnD5eCharacter;
  const xpProgress = getXPProgress(dndCharacter.experiencePoints || 0);
  const isMilestone = dndCharacter.levelingMode === "milestone";
  const readyToLevelUp =
    dndCharacter.level < MAX_LEVEL &&
    (isMilestone || canLevelUp(dndCharacter.level, dndCharacter.experiencePoints || 0));
  const profBonus = getProficiencyBonus(dndCharacter.level);

  return (
    <div className="min-h-screen bg-background">
      {showLevelUpWizard && (
        <LevelUpWizard
          open={showLevelUpWizard}
          character={character}
          onClose={() => setShowLevelUpWizard(false)}
          onConfirm={handleLevelUpConfirm}
        />
      )}
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/characters")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Characters
          </Button>
          <div className="flex flex-wrap gap-2">
            {readyToLevelUp && (
              <Button
                onClick={() => setShowLevelUpWizard(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-semibold"
              >
                <Star className="w-4 h-4 mr-2" />
                Level Up!
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/character/${id}/combat`)}>
              <Swords className="w-4 h-4 mr-2" />
              Combat
            </Button>
            <Button variant="outline" onClick={() => navigate(`/compendium?characterId=${id}`)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Compendium
            </Button>
            <Button variant="outline" onClick={() => navigate(`/character/${id}/journal`)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Journal
            </Button>
            <Button variant="outline" onClick={() => navigate("/dice")}>
              <Dices className="w-4 h-4 mr-2" />
              Dice Roller
            </Button>
            <Button onClick={() => navigate(`/character/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Character
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2 font-display">{dndCharacter.name}</CardTitle>
                <CardDescription className="text-lg">
                  {dndCharacter.race} {dndCharacter.class} | Level {dndCharacter.level}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                  D&D 5e
                </span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  Proficiency Bonus: +{profBonus}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* XP & Leveling */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                Experience & Leveling
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="milestone-toggle" className="text-xs text-muted-foreground">
                  Milestone
                </Label>
                <Switch
                  id="milestone-toggle"
                  checked={isMilestone}
                  onCheckedChange={(checked) => {
                    const dndChar = character.data as DnD5eCharacter;
                    saveCharacter({
                      ...character,
                      data: { ...dndChar, levelingMode: checked ? "milestone" : "xp" },
                    });
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isMilestone ? (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Milestone leveling — your DM decides when you level up.
                </p>
                {dndCharacter.level < MAX_LEVEL && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setShowLevelUpWizard(true)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Level Up (DM Grant)
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between text-sm">
                  <span className="text-muted-foreground">Level {xpProgress.level}</span>
                  {dndCharacter.level < MAX_LEVEL ? (
                    <span className="text-muted-foreground">
                      {dndCharacter.experiencePoints || 0} / {getXPForLevel(dndCharacter.level + 1)} XP
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-medium">MAX LEVEL</span>
                  )}
                </div>
                <Progress
                  value={xpProgress.percentage}
                  className="h-2"
                />
                {dndCharacter.level < MAX_LEVEL && (
                  <p className="text-xs text-muted-foreground">
                    {xpProgress.xpToNext} XP to level {dndCharacter.level + 1}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Input
                    type="number"
                    min="1"
                    placeholder="XP to add..."
                    value={xpInput}
                    onChange={(e) => setXpInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addXP(); }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={addXP}>
                    Add XP
                  </Button>
                </div>
                {readyToLevelUp && (
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-semibold"
                    onClick={() => setShowLevelUpWizard(true)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Level Up Available!
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <hr className="fantasy-divider" />

        {/* Rest Mechanics */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Button variant="outline" size="lg" onClick={shortRest} className="h-auto py-4">
            <div className="flex flex-col items-center gap-2">
              <Moon className="w-6 h-6" />
              <div>
                <div className="font-semibold">Short Rest</div>
                <div className="text-xs text-muted-foreground">Spend hit dice to heal</div>
              </div>
            </div>
          </Button>
          <Button variant="outline" size="lg" onClick={longRest} className="h-auto py-4">
            <div className="flex flex-col items-center gap-2">
              <Sun className="w-6 h-6" />
              <div>
                <div className="font-semibold">Long Rest</div>
                <div className="text-xs text-muted-foreground">Restore HP, spells, hit dice</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Hit Points & Death Saves */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Hit Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* HP Display */}
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${getHPColor(dndCharacter.hitPoints.current, dndCharacter.hitPoints.max)}`}>
                {dndCharacter.hitPoints.current}
                <span className="text-2xl text-muted-foreground"> / {dndCharacter.hitPoints.max}</span>
              </div>
              <Progress
                value={(dndCharacter.hitPoints.current / dndCharacter.hitPoints.max) * 100}
                className="h-3"
                indicatorClassName={getHPProgressColor(dndCharacter.hitPoints.current, dndCharacter.hitPoints.max)}
              />
            </div>

            {/* Quick HP Adjustment */}
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustHP(-5)}
                disabled={dndCharacter.hitPoints.current === 0}
              >
                -5
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustHP(-1)}
                disabled={dndCharacter.hitPoints.current === 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustHP(1)}
                disabled={dndCharacter.hitPoints.current >= dndCharacter.hitPoints.max}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustHP(5)}
                disabled={dndCharacter.hitPoints.current >= dndCharacter.hitPoints.max}
              >
                +5
              </Button>
            </div>

            {/* HP Management */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Amount..."
                  value={hpAdjustment}
                  onChange={(e) => setHpAdjustment(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="destructive"
                  onClick={takeDamage}
                  disabled={!hpAdjustment || dndCharacter.hitPoints.current === 0}
                >
                  <Skull className="w-4 h-4 mr-2" />
                  Damage
                </Button>
                <Button
                  variant="default"
                  onClick={heal}
                  disabled={!hpAdjustment || dndCharacter.hitPoints.current >= dndCharacter.hitPoints.max}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Heal
                </Button>
                <Button
                  variant="secondary"
                  onClick={restoreToMax}
                  disabled={dndCharacter.hitPoints.current >= dndCharacter.hitPoints.max}
                >
                  Full Heal
                </Button>
              </div>
            </div>

            {/* Hit Dice */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hit Dice</span>
                <span className="text-lg font-semibold">
                  {dndCharacter.hitDice?.current ?? dndCharacter.level} / {dndCharacter.hitDice?.max ?? dndCharacter.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use during short rest to heal
              </p>
            </div>

            {/* Death Saves (shown when HP is 0) */}
            {dndCharacter.hitPoints.current === 0 && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 font-display">
                  <Skull className="w-4 h-4" />
                  Death Saves
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Successes</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <button
                          key={`success-${i}`}
                          onClick={() => {
                            const deathSaves = dndCharacter.deathSaves || { successes: 0, failures: 0 };
                            updateDeathSaves(
                              deathSaves.successes === i ? i - 1 : i,
                              deathSaves.failures
                            );
                          }}
                          className="hover:scale-110 transition-transform"
                        >
                          {(dndCharacter.deathSaves?.successes || 0) >= i ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failures</span>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <button
                          key={`failure-${i}`}
                          onClick={() => {
                            const deathSaves = dndCharacter.deathSaves || { successes: 0, failures: 0 };
                            updateDeathSaves(
                              deathSaves.successes,
                              deathSaves.failures === i ? i - 1 : i
                            );
                          }}
                          className="hover:scale-110 transition-transform"
                        >
                          {(dndCharacter.deathSaves?.failures || 0) >= i ? (
                            <XCircle className="w-6 h-6 text-destructive" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
            <CardDescription>Track active status effects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(["Blinded", "Charmed", "Deafened", "Frightened", "Grappled", "Incapacitated",
                "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained",
                "Stunned", "Unconscious"] as Condition[]).map((condition) => {
                  const isActive = dndCharacter.conditions?.includes(condition);
                  return (
                    <Badge
                      key={condition}
                      variant={isActive ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleCondition(condition)}
                    >
                      {condition}
                      {isActive && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
            </div>
            {(dndCharacter.exhaustionLevel || 0) > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Exhaustion Level</span>
                  <Badge variant="destructive">{dndCharacter.exhaustionLevel}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <hr className="fantasy-divider" />

        {/* Ability Scores & Saving Throws */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Ability Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(dndCharacter.abilityScores).map(([ability, score]) => (
                  <div key={ability} className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-sm font-medium text-muted-foreground capitalize mb-1">
                      {ability}
                    </div>
                    <div className="text-3xl font-bold">{score}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {getModifier(score)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <SavingThrowsManager
            abilityScores={dndCharacter.abilityScores}
            level={dndCharacter.level}
            savingThrows={dndCharacter.savingThrows || {}}
            onUpdateSavingThrows={updateSavingThrows}
            readOnly={true}
          />
        </div>

        {/* Skills */}
        <div className="mb-6">
          <SkillsManager
            abilityScores={dndCharacter.abilityScores}
            level={dndCharacter.level}
            skills={dndCharacter.skills || {}}
            onUpdateSkills={updateSkills}
            readOnly={true}
          />
        </div>

        <hr className="fantasy-divider" />

        {/* Spells (if applicable) */}
        {dndCharacter.spellcastingAbility && (
          <div className="mb-6">
            <SpellsManager
              spellSlots={dndCharacter.spellSlots || {
                level1: { current: 0, max: 0 },
                level2: { current: 0, max: 0 },
                level3: { current: 0, max: 0 },
                level4: { current: 0, max: 0 },
                level5: { current: 0, max: 0 },
                level6: { current: 0, max: 0 },
                level7: { current: 0, max: 0 },
                level8: { current: 0, max: 0 },
                level9: { current: 0, max: 0 },
              }}
              preparedSpells={dndCharacter.preparedSpells || []}
              characterClass={dndCharacter.class}
              spellcastingAbility={dndCharacter.spellcastingAbility}
              abilityScores={dndCharacter.abilityScores}
              level={dndCharacter.level}
              onUpdateSpellSlots={updateSpellSlots}
              onUpdatePreparedSpells={updatePreparedSpells}
            />
          </div>
        )}

        {/* Inventory Management */}
        <InventoryManager
          inventory={dndCharacter.inventory || []}
          carryingCapacity={getCarryingCapacity(dndCharacter.abilityScores.strength)}
          onUpdateInventory={updateInventory}
        />

        <hr className="fantasy-divider" />

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Character Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dndCharacter.alignment && (
                <div>
                  <span className="text-sm text-muted-foreground">Alignment:</span>
                  <p className="font-medium">{dndCharacter.alignment}</p>
                </div>
              )}
              {dndCharacter.background && (
                <div>
                  <span className="text-sm text-muted-foreground">Background:</span>
                  <p className="font-medium">{dndCharacter.background}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Character Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Created:</span>
                <p className="font-medium">
                  {new Date(character.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <p className="font-medium">
                  {new Date(character.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

