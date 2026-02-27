/**
 * @fileoverview Combat Tracker page for managing D&D 5e combat encounters.
 * Handles initiative order, HP tracking, conditions, and turn management.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Character, DnD5eCharacter } from "@/types/character";
import { Combatant, CombatantType, Condition } from "@/types/combat";
import { NPC } from "@/types/npc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CombatParticipant } from "@/components/CombatParticipant";
import { ArrowLeft, Plus, Swords, RotateCcw, ChevronRight, Dices, RefreshCw, Users, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { readCharacters, readNPCs, writeCharacters } from "@/lib/storage";
import { getProficiencyBonus, getAbilityModifier, formatModifier } from "@/lib/dndRules";
import { getClassByName, getClassSavingThrowProficiencies } from "@/lib/dndCompendium";
import {
  calcConcentrationDC,
  resolveWeaponStats,
  rollSavingThrow,
  type SavingThrowResult,
} from "@/utils/combatMathUtils";

/**
 * Combat Tracker page component.
 * Provides a complete combat management interface including:
 * - Initiative order tracking with auto-roll
 * - Player character and NPC/enemy management
 * - HP tracking with sync back to character data
 * - Condition tracking with duration management
 * - Round and turn progression
 *
 * @route /combat/:id - where id is the player character's ID
 */
export const CombatTracker = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core character state
  const [character, setCharacter] = useState<Character | null>(null);
  const [combatants, setCombatants] = useState<Combatant[]>([]);

  // Combat progression state
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNPCDialog, setShowNPCDialog] = useState(false);
  const [savedNPCs, setSavedNPCs] = useState<NPC[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "not_found">("loading");

  /** Pending concentration check triggered by damage to a concentrating combatant */
  const [concentrationCheck, setConcentrationCheck] = useState<{
    combatantId: string;
    combatantName: string;
    spellName: string;
    dc: number;
  } | null>(null);

  /** Result of rolling the concentration CON save */
  const [concentrationRollResult, setConcentrationRollResult] = useState<SavingThrowResult | null>(null);

  /** Form state for adding a new custom combatant */
  const [newCombatant, setNewCombatant] = useState({
    name: "",
    type: "enemy" as CombatantType,
    initiative: "",
    initiativeBonus: "",
    hp: "",
    ac: "",
  });

  useEffect(() => {
    if (id) {
      loadCharacter(id);
    } else {
      setStatus("not_found");
    }
    loadNPCs();
  }, [id]);

  /** Loads saved NPCs from localStorage into state */
  const loadNPCs = () => {
    setSavedNPCs(readNPCs());
  };

  /**
   * Loads a character by ID from localStorage.
   * @param characterId - The UUID of the character to load
   */
  const loadCharacter = (characterId: string) => {
    const characters: Character[] = readCharacters();
    const found = characters.find((c) => c.id === characterId);
    if (found) {
      setCharacter(found);
      setStatus("ready");
    } else {
      setCharacter(null);
      setStatus("not_found");
      toast({
        title: "Character Not Found",
        description: "This combat encounter cannot load because the character is missing.",
        variant: "destructive",
      });
    }
  };

  /**
   * Adds the current player character to the combat encounter.
   * Calculates initiative bonus from DEX and sets base AC.
   * Prevents adding the same character twice.
   */
  const addPlayerCharacter = () => {
    if (!character) return;

    const dndChar = character.data as DnD5eCharacter;
    const existingPlayer = combatants.find((c) => c.characterId === character.id);

    if (existingPlayer) {
      toast({
        title: "Already Added",
        description: "Your character is already in the initiative order.",
        variant: "destructive",
      });
      return;
    }

    const dexModifier = Math.floor((dndChar.abilityScores.dexterity - 10) / 2);
    const profBonus = getProficiencyBonus(dndChar.level);
    const classData = getClassByName(dndChar.class);
    const weaponProficiencies = classData?.weaponProficiencies ?? [];
    // Prefer explicit mainHand slot; fall back to any equipped weapon
    const mainHandItem =
      dndChar.inventory.find((i) => i.equipped && i.equipmentSlot === "mainHand") ??
      dndChar.inventory.find((i) => i.equipped && i.sourceItemType === "weapon") ??
      dndChar.inventory.find((i) => i.equipped && (i.damageDice ?? "") !== "");
    const resolvedWeapon = mainHandItem
      ? resolveWeaponStats(mainHandItem, dndChar.abilityScores, profBonus, weaponProficiencies)
      : null;
    const savingThrowProfs = dndChar.savingThrows ?? getClassSavingThrowProficiencies(dndChar.class);

    const playerCombatant: Combatant = {
      id: crypto.randomUUID(),
      name: dndChar.name,
      type: "player",
      initiative: 0,
      initiativeBonus: dexModifier,
      hitPoints: {
        current: dndChar.hitPoints.current,
        max: dndChar.hitPoints.max,
      },
      armorClass: 10 + dexModifier, // Base AC + DEX mod
      characterId: character.id,
      abilityScores: dndChar.abilityScores,
      proficiencyBonus: profBonus,
      spellcastingAbility: dndChar.spellcastingAbility,
      savingThrowProficiencies: savingThrowProfs,
      equippedWeapon: resolvedWeapon ?? undefined,
    };

    setCombatants([...combatants, playerCombatant]);
    toast({
      title: "Character Added",
      description: `${dndChar.name} has been added to combat.`,
    });
  };

  /**
   * Adds a custom combatant from the form to the encounter.
   * Validates required fields (name, HP, AC) before adding.
   */
  const addCombatant = () => {
    if (!newCombatant.name || !newCombatant.hp || !newCombatant.ac) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const combatant: Combatant = {
      id: crypto.randomUUID(),
      name: newCombatant.name,
      type: newCombatant.type,
      initiative: parseInt(newCombatant.initiative) || 0,
      initiativeBonus: newCombatant.initiativeBonus ? parseInt(newCombatant.initiativeBonus) : 0,
      hitPoints: {
        current: parseInt(newCombatant.hp),
        max: parseInt(newCombatant.hp),
      },
      armorClass: parseInt(newCombatant.ac),
    };

    setCombatants([...combatants, combatant]);
    setNewCombatant({ name: "", type: "enemy", initiative: "", initiativeBonus: "", hp: "", ac: "" });
    setShowAddForm(false);

    toast({
      title: "Combatant Added",
      description: `${combatant.name} has been added to combat.`,
    });
  };

  /**
   * Adds a saved NPC from the library to combat.
   * Neutral NPCs are treated as enemies.
   * @param npc - The NPC to add from the library
   */
  const addNPCToCombat = (npc: NPC) => {
    const combatant: Combatant = {
      id: crypto.randomUUID(),
      name: npc.name,
      type: npc.type === "neutral" ? "enemy" : npc.type,
      initiative: 0,
      initiativeBonus: npc.initiativeBonus || 0,
      hitPoints: {
        current: npc.hitPoints,
        max: npc.hitPoints,
      },
      armorClass: npc.armorClass,
    };

    setCombatants([...combatants, combatant]);
    setShowNPCDialog(false);

    toast({
      title: "NPC Added",
      description: `${npc.name} has been added to combat.`,
    });
  };

  /**
   * Rolls initiative (d20 + bonus) for all combatants and sorts by result.
   * Called when "Roll Init" button is clicked.
   */
  const rollInitiativeForAll = () => {
    const updated = combatants.map((c) => ({
      ...c,
      initiative: Math.floor(Math.random() * 20) + 1 + (c.initiativeBonus || 0),
    }));
    sortAndSetCombatants(updated);

    toast({
      title: "Initiative Rolled",
      description: "All combatants have rolled initiative!",
    });
  };

  /**
   * Sorts combatants by initiative (highest first) and updates state.
   * @param combatantList - The list of combatants to sort
   */
  const sortAndSetCombatants = (combatantList: Combatant[]) => {
    const sorted = [...combatantList].sort((a, b) => b.initiative - a.initiative);
    setCombatants(sorted);
    setCurrentTurn(0);
  };

  /**
   * Updates a combatant's current HP and syncs player HP to character data.
   * For player combatants, persists HP changes to localStorage.
   * @param id - The combatant's UUID
   * @param newHP - The new current HP value
   */
  const updateCombatantHP = (id: string, newHP: number) => {
    const combatant = combatants.find((c) => c.id === id);
    const oldHP = combatant?.hitPoints.current ?? newHP;
    const damageTaken = Math.max(0, oldHP - newHP);

    const updated = combatants.map((c) =>
      c.id === id ? { ...c, hitPoints: { ...c.hitPoints, current: newHP } } : c
    );
    setCombatants(updated);

    // Trigger concentration check when a concentrating combatant takes damage
    if (combatant?.concentrationSpellName && damageTaken > 0) {
      setConcentrationCheck({
        combatantId: id,
        combatantName: combatant.name,
        spellName: combatant.concentrationSpellName,
        dc: calcConcentrationDC(damageTaken),
      });
      setConcentrationRollResult(null);
    }

    // Sync player character HP back to character data
    const updatedCombatant = updated.find((c) => c.id === id);
    if (updatedCombatant?.characterId && character) {
      const dndChar = character.data as DnD5eCharacter;
      const updatedCharacter: Character = {
        ...character,
        data: {
          ...dndChar,
          hitPoints: {
            ...dndChar.hitPoints,
            current: newHP,
          },
        },
      };

      const characters: Character[] = readCharacters();
      const index = characters.findIndex((c) => c.id === character.id);
      if (index !== -1) {
        characters[index] = updatedCharacter;
        writeCharacters(characters);
        setCharacter(updatedCharacter);
      }
    }
  };

  /**
   * Updates the conditions array for a specific combatant.
   * @param id - The combatant's UUID
   * @param conditions - The new conditions array
   */
  const updateCombatantConditions = (id: string, conditions: Condition[]) => {
    const updated = combatants.map((c) => (c.id === id ? { ...c, conditions } : c));
    setCombatants(updated);
  };

  /**
   * Decrements duration of all conditions by 1 round.
   * Removes conditions that reach 0 duration.
   * Conditions with duration -1 (indefinite) are unchanged.
   */
  const decrementConditionDurations = () => {
    const updated = combatants.map((combatant) => {
      if (!combatant.conditions || combatant.conditions.length === 0) return combatant;

      const updatedConditions = combatant.conditions
        .map((condition) => {
          if (condition.duration === -1) return condition; // Indefinite
          return { ...condition, duration: condition.duration - 1 };
        })
        .filter((condition) => condition.duration !== 0); // Remove expired

      return { ...combatant, conditions: updatedConditions };
    });
    setCombatants(updated);
  };

  /**
   * Removes a combatant from the encounter.
   * Adjusts current turn if necessary.
   * @param id - The combatant's UUID to remove
   */
  const removeCombatant = (id: string) => {
    const removedIndex = combatants.findIndex((c) => c.id === id);
    if (removedIndex === -1) return;

    const filtered = combatants.filter((c) => c.id !== id);
    setCombatants(filtered);

    if (filtered.length === 0) {
      setCurrentTurn(0);
      return;
    }

    if (removedIndex < currentTurn) {
      setCurrentTurn(currentTurn - 1);
      return;
    }

    if (currentTurn >= filtered.length) {
      setCurrentTurn(0);
    }
  };

  /**
   * Advances combat to the next turn.
   * Increments round counter when returning to start.
   * Triggers condition duration decrement at round end.
   */
  const nextTurn = () => {
    if (combatants.length === 0) return;

    const nextIndex = (currentTurn + 1) % combatants.length;

    if (nextIndex === 0) {
      decrementConditionDurations();
      setRound(round + 1);
      toast({
        title: `Round ${round + 1}`,
        description: "A new round has begun! Conditions updated.",
      });
    }

    setCurrentTurn(nextIndex);
  };

  /** Updates or clears the concentration spell on a combatant. */
  const handleConcentrationChange = (id: string, spellName: string | undefined) => {
    setCombatants((prev) => prev.map((c) => (c.id === id ? { ...c, concentrationSpellName: spellName } : c)));
  };

  /** Rolls a CON saving throw for the current concentration check. */
  const rollConcentrationCheck = () => {
    if (!concentrationCheck) return;
    const combatant = combatants.find((c) => c.id === concentrationCheck.combatantId);
    if (!combatant?.abilityScores || !combatant.proficiencyBonus) return;
    const conMod = getAbilityModifier(combatant.abilityScores.constitution);
    const hasProficiency = combatant.savingThrowProficiencies?.["constitution"] ?? false;
    const result = rollSavingThrow(concentrationCheck.dc, conMod, combatant.proficiencyBonus, hasProficiency);
    setConcentrationRollResult(result);
  };

  /** Resolves a concentration check — clears spell on failure. */
  const resolveConcentration = (maintained: boolean) => {
    if (!concentrationCheck) return;
    if (!maintained) {
      setCombatants((prev) =>
        prev.map((c) => (c.id === concentrationCheck.combatantId ? { ...c, concentrationSpellName: undefined } : c))
      );
      toast({
        title: "Concentration Lost",
        description: `${concentrationCheck.combatantName} lost concentration on ${concentrationCheck.spellName}.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Concentration Maintained",
        description: `${concentrationCheck.combatantName} maintains ${concentrationCheck.spellName}.`,
      });
    }
    setConcentrationCheck(null);
    setConcentrationRollResult(null);
  };

  const resetCombat = () => {
    setCombatants([]);
    setCurrentTurn(0);
    setRound(1);
    toast({
      title: "Combat Reset",
      description: "The encounter has been cleared.",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (status === "not_found" || !character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Combat Tracker Unavailable</CardTitle>
            <CardDescription>
              The selected character could not be loaded.
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(`/character/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Character
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/npc-library")}>
              <Users className="w-4 h-4 mr-2" />
              NPCs
            </Button>
            <Button variant="outline" onClick={() => navigate("/dice")}>
              <Dices className="w-4 h-4 mr-2" />
              Dice
            </Button>
            <Button variant="destructive" onClick={resetCombat}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Swords className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Combat Tracker</CardTitle>
                  <CardDescription>Round {round} | {combatants.length} combatants</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {combatants.length > 0 && (
                  <>
                    <Button onClick={rollInitiativeForAll} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Roll Init
                    </Button>
                    <Button onClick={nextTurn}>
                      Next Turn
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Combatants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={addPlayerCharacter} variant="outline" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add {character.data.name}
                </Button>
                <Dialog open={showNPCDialog} onOpenChange={setShowNPCDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Users className="w-4 h-4 mr-2" />
                      Add from Library
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select NPC from Library</DialogTitle>
                      <DialogDescription>
                        Choose an NPC to add to combat
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {savedNPCs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No NPCs in library. Create some first!
                        </p>
                      ) : (
                        savedNPCs.map((npc) => (
                          <Card
                            key={npc.id}
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => addNPCToCombat(npc)}
                          >
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{npc.name}</CardTitle>
                                <div className="text-sm text-muted-foreground">
                                  HP: {npc.hitPoints} | AC: {npc.armorClass}
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => setShowAddForm(!showAddForm)} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </Button>
              </div>

              {showAddForm && (
                <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        placeholder="Goblin"
                        value={newCombatant.name}
                        onChange={(e) => setNewCombatant({ ...newCombatant, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newCombatant.type}
                        onValueChange={(v) => setNewCombatant({ ...newCombatant, type: v as CombatantType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enemy">Enemy</SelectItem>
                          <SelectItem value="ally">Ally</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Initiative</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newCombatant.initiative}
                        onChange={(e) => setNewCombatant({ ...newCombatant, initiative: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Init Bonus</Label>
                      <Input
                        type="number"
                        placeholder="+2"
                        value={newCombatant.initiativeBonus}
                        onChange={(e) => setNewCombatant({ ...newCombatant, initiativeBonus: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>HP *</Label>
                      <Input
                        type="number"
                        placeholder="7"
                        value={newCombatant.hp}
                        onChange={(e) => setNewCombatant({ ...newCombatant, hp: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>AC *</Label>
                      <Input
                        type="number"
                        placeholder="15"
                        value={newCombatant.ac}
                        onChange={(e) => setNewCombatant({ ...newCombatant, ac: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addCombatant} className="flex-1">
                      Add to Combat
                    </Button>
                    <Button onClick={() => setShowAddForm(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {combatants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No combatants yet. Add your character or enemies to start tracking initiative!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {combatants.map((combatant, index) => (
              <CombatParticipant
                key={combatant.id}
                combatant={combatant}
                isCurrentTurn={index === currentTurn}
                onUpdateHP={updateCombatantHP}
                onRemove={removeCombatant}
                onUpdateConditions={updateCombatantConditions}
                onConcentrationChange={handleConcentrationChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Concentration Check Dialog — triggered automatically when concentrating combatant takes damage */}
      <Dialog
        open={concentrationCheck !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConcentrationCheck(null);
            setConcentrationRollResult(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Concentration Check
            </DialogTitle>
            <DialogDescription>
              <strong>{concentrationCheck?.combatantName}</strong> took damage while concentrating on{" "}
              <strong>{concentrationCheck?.spellName}</strong>.
              <br />
              DC {concentrationCheck?.dc} Constitution saving throw required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!concentrationRollResult && concentrationCheck && (
              (() => {
                const c = combatants.find((x) => x.id === concentrationCheck.combatantId);
                return c?.abilityScores ? (
                  <Button onClick={rollConcentrationCheck} className="w-full">
                    Roll CON Save (DC {concentrationCheck.dc})
                  </Button>
                ) : null;
              })()
            )}

            {concentrationRollResult && (
              <div
                className={`rounded p-3 text-sm ${
                  concentrationRollResult.success
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                <div>
                  Roll: {concentrationRollResult.roll} {formatModifier(concentrationRollResult.bonus)} ={" "}
                  {concentrationRollResult.total} vs DC {concentrationRollResult.dc}
                </div>
                <div className="font-bold mt-1">
                  {concentrationRollResult.success ? "✓ Concentration maintained!" : "✗ Concentration lost!"}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => resolveConcentration(true)}
                variant={concentrationRollResult?.success ? "default" : "outline"}
                className="flex-1"
              >
                Maintain
              </Button>
              <Button
                onClick={() => resolveConcentration(false)}
                variant={concentrationRollResult?.success === false ? "destructive" : "outline"}
                className="flex-1"
              >
                Lose Concentration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

