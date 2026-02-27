/**
 * @fileoverview Combat Participant component for displaying combatants in the initiative order.
 * Provides HP management, condition tracking, attack rolls, saving throws, and concentration tracking.
 */

import { Combatant, Condition, ConditionType } from "@/types/combat";
import type { DnD5eAbilityScores } from "@/types/character";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Shield, Heart, Skull, Trash2, User, UserPlus, Plus, X, AlertCircle,
  ChevronDown, Swords, Dices, Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  rollAttack, rollDamage, rollSavingThrow, checkHit,
  type AttackRollResult, type DamageRollBreakdown, type SavingThrowResult,
} from "@/utils/combatMathUtils";
import { getAbilityModifier, formatModifier } from "@/lib/dndRules";

// ─── Ability abbreviations ────────────────────────────────────────────────────

const ABILITY_ABBR: Record<keyof DnD5eAbilityScores, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

const ABILITY_KEYS = Object.keys(ABILITY_ABBR) as (keyof DnD5eAbilityScores)[];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CombatParticipantProps {
  combatant: Combatant;
  isCurrentTurn: boolean;
  onUpdateHP: (id: string, newHP: number) => void;
  onRemove: (id: string) => void;
  onUpdateConditions: (id: string, conditions: Condition[]) => void;
  /** Called when concentration is set or cleared on this combatant */
  onConcentrationChange?: (id: string, spellName: string | undefined) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CombatParticipant = ({
  combatant,
  isCurrentTurn,
  onUpdateHP,
  onRemove,
  onUpdateConditions,
  onConcentrationChange,
}: CombatParticipantProps) => {

  // ── HP / condition state ──────────────────────────────────────────────────
  const [damageInput, setDamageInput] = useState("");
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [newCondition, setNewCondition] = useState<ConditionType>("poisoned");
  const [conditionDuration, setConditionDuration] = useState("1");
  const [conditionNotes, setConditionNotes] = useState("");

  // ── Attack roll state ─────────────────────────────────────────────────────
  const [showAttack, setShowAttack] = useState(false);
  const [attackMode, setAttackMode] = useState<"normal" | "advantage" | "disadvantage">("normal");
  const [targetAC, setTargetAC] = useState("");
  const [attackResult, setAttackResult] = useState<AttackRollResult | null>(null);
  const [damageResult, setDamageResult] = useState<DamageRollBreakdown | null>(null);

  // ── Saving throw state ────────────────────────────────────────────────────
  const [showSave, setShowSave] = useState(false);
  const [saveAbility, setSaveAbility] = useState<keyof DnD5eAbilityScores>("constitution");
  const [saveDC, setSaveDC] = useState("");
  const [saveProficient, setSaveProficient] = useState(false);
  const [saveResult, setSaveResult] = useState<SavingThrowResult | null>(null);

  // ── Concentration state ───────────────────────────────────────────────────
  const [showConcInput, setShowConcInput] = useState(false);
  const [concSpellInput, setConcSpellInput] = useState("");

  // Auto-detect saving throw proficiency when ability changes
  useEffect(() => {
    if (combatant.savingThrowProficiencies) {
      setSaveProficient(combatant.savingThrowProficiencies[saveAbility] ?? false);
    }
  }, [saveAbility, combatant.savingThrowProficiencies]);

  // Reset attack result when collapsing
  useEffect(() => {
    if (!showAttack) {
      setAttackResult(null);
      setDamageResult(null);
    }
  }, [showAttack]);

  // Reset save result when collapsing
  useEffect(() => {
    if (!showSave) setSaveResult(null);
  }, [showSave]);

  // ── HP helpers ────────────────────────────────────────────────────────────
  const hpPercentage = (combatant.hitPoints.current / combatant.hitPoints.max) * 100;

  const getHPColor = () => {
    if (hpPercentage > 50) return "text-green-600 dark:text-green-400";
    if (hpPercentage > 25) return "text-amber-600 dark:text-amber-400";
    return "text-destructive";
  };

  const getHPProgressColor = () => {
    if (hpPercentage > 50) return "bg-green-500";
    if (hpPercentage > 25) return "bg-amber-500";
    return "bg-destructive";
  };

  const applyDamage = () => {
    const amount = parseInt(damageInput) || 0;
    if (amount > 0) {
      onUpdateHP(combatant.id, Math.max(0, combatant.hitPoints.current - amount));
      setDamageInput("");
    }
  };

  const applyHealing = () => {
    const amount = parseInt(damageInput) || 0;
    if (amount > 0) {
      onUpdateHP(combatant.id, Math.min(combatant.hitPoints.max, combatant.hitPoints.current + amount));
      setDamageInput("");
    }
  };

  const quickAdjust = (amount: number) => {
    const newHP = Math.max(0, Math.min(combatant.hitPoints.max, combatant.hitPoints.current + amount));
    onUpdateHP(combatant.id, newHP);
  };

  // ── Condition helpers ─────────────────────────────────────────────────────
  const addCondition = () => {
    const duration = parseInt(conditionDuration);
    if (isNaN(duration) || duration < -1) return;
    const condition = { id: crypto.randomUUID(), type: newCondition, duration, notes: conditionNotes || undefined };
    onUpdateConditions(combatant.id, [...(combatant.conditions || []), condition]);
    setNewCondition("poisoned");
    setConditionDuration("1");
    setConditionNotes("");
    setShowConditionDialog(false);
  };

  const removeCondition = (conditionId: string) => {
    onUpdateConditions(combatant.id, (combatant.conditions || []).filter((c) => c.id !== conditionId));
  };

  // ── Attack roll helpers ───────────────────────────────────────────────────
  const handleRollAttack = () => {
    if (!combatant.equippedWeapon) return;
    const result = rollAttack(
      combatant.equippedWeapon.attackBonus,
      attackMode === "advantage",
      attackMode === "disadvantage"
    );
    setAttackResult(result);
    setDamageResult(null);
  };

  const handleRollDamage = () => {
    if (!combatant.equippedWeapon || !attackResult) return;
    const result = rollDamage(
      combatant.equippedWeapon.damageDice,
      combatant.equippedWeapon.damageBonus,
      attackResult.isCrit,
      combatant.equippedWeapon.damageType
    );
    setDamageResult(result);
  };

  const getHitLabel = () => {
    if (!attackResult) return "";
    if (attackResult.isCrit) return "CRITICAL HIT!";
    if (attackResult.isFumble) return "FUMBLE!";
    const ac = parseInt(targetAC);
    if (!isNaN(ac)) return checkHit(attackResult, ac) ? `HIT vs AC ${ac} ✓` : `MISS vs AC ${ac} ✗`;
    return "";
  };

  const hitLabelClass = () => {
    if (!attackResult) return "";
    if (attackResult.isCrit) return "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300";
    if (attackResult.isFumble) return "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400";
    const ac = parseInt(targetAC);
    if (!isNaN(ac)) {
      return checkHit(attackResult, ac)
        ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300"
        : "bg-muted border-border text-muted-foreground";
    }
    return "bg-muted border-border";
  };

  // ── Saving throw helpers ──────────────────────────────────────────────────
  const handleRollSave = () => {
    if (!combatant.abilityScores) return;
    const dc = parseInt(saveDC);
    if (isNaN(dc) || dc <= 0) return;
    const abilityScore = combatant.abilityScores[saveAbility];
    const abilityMod = getAbilityModifier(abilityScore);
    const profBonus = combatant.proficiencyBonus ?? 2;
    setSaveResult(rollSavingThrow(dc, abilityMod, profBonus, saveProficient));
  };

  // ── Concentration helpers ─────────────────────────────────────────────────
  const commitConcentration = () => {
    if (concSpellInput.trim() && onConcentrationChange) {
      onConcentrationChange(combatant.id, concSpellInput.trim());
      setConcSpellInput("");
      setShowConcInput(false);
    }
  };

  // ── Rendering helpers ─────────────────────────────────────────────────────
  const typeConfig = {
    player: { icon: User, color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
    ally: { icon: UserPlus, color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
    enemy: { icon: Skull, color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
  };

  const TypeIcon = typeConfig[combatant.type].icon;
  const isDead = combatant.hitPoints.current === 0;

  return (
    <Card
      className={`transition-all ${isCurrentTurn ? "border-primary border-2 shadow-lg shadow-primary/20" : ""} ${isDead ? "opacity-60" : ""}`}
    >
      <CardContent className="p-4 space-y-3">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={typeConfig[combatant.type].color}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {combatant.type}
              </Badge>
              {isCurrentTurn && <Badge className="animate-pulse">Active Turn</Badge>}
            </div>
            <h3 className="font-semibold text-lg truncate">{combatant.name}</h3>
            <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>AC {combatant.armorClass}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-primary">#{combatant.initiative}</span>
                {combatant.initiativeBonus !== undefined && combatant.initiativeBonus !== 0 && (
                  <span className="text-xs">({combatant.initiativeBonus >= 0 ? "+" : ""}{combatant.initiativeBonus})</span>
                )}
                <span>Init</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onRemove(combatant.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Conditions ─────────────────────────────────────────────────── */}
        {combatant.conditions && combatant.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {combatant.conditions.map((condition) => (
              <Badge
                key={condition.id}
                variant="secondary"
                className="text-xs gap-1 pr-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
              >
                <AlertCircle className="w-3 h-3" />
                {condition.type}
                {condition.duration > 0 && ` (${condition.duration})`}
                {condition.duration === -1 && " (inf)"}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeCondition(condition.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* ── Concentration badge ─────────────────────────────────────────── */}
        {combatant.concentrationSpellName && (
          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className="text-xs gap-1 pr-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
            >
              <Zap className="w-3 h-3" />
              {combatant.concentrationSpellName}
              {onConcentrationChange && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onConcentrationChange(combatant.id, undefined)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </Badge>
          </div>
        )}

        {/* ── HP bar ─────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span className="font-medium">Hit Points</span>
            </div>
            <span className={`font-bold ${getHPColor()}`}>
              {combatant.hitPoints.current} / {combatant.hitPoints.max}
            </span>
          </div>
          <Progress value={hpPercentage} className="h-2">
            <div className={`h-full ${getHPProgressColor()} transition-all`} />
          </Progress>
        </div>

        {/* ── Quick adjust buttons ────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-1">
          <Button variant="outline" size="sm" onClick={() => quickAdjust(-5)}>-5</Button>
          <Button variant="outline" size="sm" onClick={() => quickAdjust(-1)}>-1</Button>
          <Button variant="outline" size="sm" onClick={() => quickAdjust(1)}>+1</Button>
          <Button variant="outline" size="sm" onClick={() => quickAdjust(5)}>+5</Button>
        </div>

        {/* ── Damage / Heal input ─────────────────────────────────────────── */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Amount"
            value={damageInput}
            onChange={(e) => setDamageInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") applyDamage(); }}
            className="flex-1"
          />
          <Button variant="destructive" size="sm" onClick={applyDamage}>Damage</Button>
          <Button variant="default" size="sm" onClick={applyHealing}>Heal</Button>
        </div>

        {/* ── Add Condition ───────────────────────────────────────────────── */}
        <Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Condition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Condition</DialogTitle>
              <DialogDescription>Apply a status effect to this combatant</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Condition Type</Label>
                <Select value={newCondition} onValueChange={(v: ConditionType) => setNewCondition(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blinded">Blinded</SelectItem>
                    <SelectItem value="charmed">Charmed</SelectItem>
                    <SelectItem value="deafened">Deafened</SelectItem>
                    <SelectItem value="frightened">Frightened</SelectItem>
                    <SelectItem value="grappled">Grappled</SelectItem>
                    <SelectItem value="incapacitated">Incapacitated</SelectItem>
                    <SelectItem value="invisible">Invisible</SelectItem>
                    <SelectItem value="paralyzed">Paralyzed</SelectItem>
                    <SelectItem value="petrified">Petrified</SelectItem>
                    <SelectItem value="poisoned">Poisoned</SelectItem>
                    <SelectItem value="prone">Prone</SelectItem>
                    <SelectItem value="restrained">Restrained</SelectItem>
                    <SelectItem value="stunned">Stunned</SelectItem>
                    <SelectItem value="unconscious">Unconscious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (rounds)</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={conditionDuration}
                  onChange={(e) => setConditionDuration(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Use -1 for indefinite duration</p>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="Additional details..."
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addCondition} className="flex-1">Add Condition</Button>
                <Button variant="outline" onClick={() => setShowConditionDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Attack Roll Panel ───────────────────────────────────────────── */}
        {combatant.equippedWeapon && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between h-8 px-0 hover:bg-transparent"
              onClick={() => setShowAttack(!showAttack)}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Swords className="w-3.5 h-3.5" />
                Attack Roll
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAttack ? "rotate-180" : ""}`} />
            </Button>

            {showAttack && (
              <div className="mt-2 space-y-2">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{combatant.equippedWeapon.name}</span>
                  {" — "}
                  {combatant.equippedWeapon.damageDice}
                  {combatant.equippedWeapon.damageBonus !== 0 && (
                    <span>{formatModifier(combatant.equippedWeapon.damageBonus)}</span>
                  )}
                  {" "}
                  {combatant.equippedWeapon.damageType}
                  {"  "}
                  <span className="text-foreground font-semibold">
                    {formatModifier(combatant.equippedWeapon.attackBonus)} to hit
                  </span>
                </div>

                {/* Advantage mode buttons */}
                <div className="flex gap-1">
                  {(["normal", "advantage", "disadvantage"] as const).map((m) => (
                    <Button
                      key={m}
                      variant={attackMode === m ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs h-7"
                      onClick={() => setAttackMode(m)}
                    >
                      {m === "normal" ? "Normal" : m === "advantage" ? "Adv" : "Dis"}
                    </Button>
                  ))}
                </div>

                {/* Target AC + Roll */}
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Target AC"
                    value={targetAC}
                    onChange={(e) => setTargetAC(e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button size="sm" className="h-8" onClick={handleRollAttack}>
                    Roll
                  </Button>
                </div>

                {/* Attack result */}
                {attackResult && (
                  <div className={`text-sm rounded p-2 border ${hitLabelClass()}`}>
                    <span className="font-mono">
                      {attackResult.d20.allRolls
                        ? `[${attackResult.d20.allRolls.join(", ")}] → `
                        : ""}
                      {attackResult.d20.roll}
                      {" "}{formatModifier(attackResult.attackBonus)}
                      {" = "}{attackResult.total}
                    </span>
                    {getHitLabel() && (
                      <span className="ml-2 font-semibold">{getHitLabel()}</span>
                    )}
                  </div>
                )}

                {/* Roll Damage (shown when not a fumble) */}
                {attackResult && !attackResult.isFumble && (
                  <Button variant="outline" size="sm" className="w-full h-8" onClick={handleRollDamage}>
                    Roll Damage
                  </Button>
                )}

                {/* Damage result */}
                {damageResult && (
                  <div className="text-sm rounded p-2 bg-muted space-y-1">
                    <div className="font-mono text-xs">
                      [{damageResult.dice.join(", ")}]
                      {damageResult.critDice.length > 0 && (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {" "}+crit [{damageResult.critDice.join(", ")}]
                        </span>
                      )}
                      {damageResult.bonus !== 0 && ` ${formatModifier(damageResult.bonus)}`}
                    </div>
                    <div className="font-bold">
                      = {damageResult.total} {damageResult.damageType}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Saving Throw Panel ──────────────────────────────────────────── */}
        {combatant.abilityScores && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between h-8 px-0 hover:bg-transparent"
              onClick={() => setShowSave(!showSave)}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Dices className="w-3.5 h-3.5" />
                Saving Throw
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSave ? "rotate-180" : ""}`} />
            </Button>

            {showSave && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2 items-center">
                  <Select
                    value={saveAbility}
                    onValueChange={(v) => setSaveAbility(v as keyof DnD5eAbilityScores)}
                  >
                    <SelectTrigger className="flex-1 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ABILITY_KEYS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {ABILITY_ABBR[a]}
                          {combatant.abilityScores && (
                            <span className="ml-1 text-muted-foreground text-xs">
                              ({formatModifier(getAbilityModifier(combatant.abilityScores[a]))})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="DC"
                    value={saveDC}
                    onChange={(e) => setSaveDC(e.target.value)}
                    className="w-20 h-8 text-sm"
                  />
                  <Button
                    variant={saveProficient ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs px-2"
                    onClick={() => setSaveProficient(!saveProficient)}
                    title="Toggle saving throw proficiency"
                  >
                    Prof
                  </Button>
                </div>
                <Button size="sm" className="w-full h-8" onClick={handleRollSave} disabled={!saveDC}>
                  Roll Save
                </Button>

                {saveResult && (
                  <div
                    className={`text-sm rounded p-2 border font-mono ${
                      saveResult.success
                        ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300"
                        : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {saveResult.roll} {formatModifier(saveResult.bonus)} = {saveResult.total} vs DC{" "}
                    {saveResult.dc}
                    <span className="ml-2 font-semibold">
                      {saveResult.success ? "SUCCESS ✓" : "FAILED ✗"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Concentration setter ────────────────────────────────────────── */}
        {onConcentrationChange && !combatant.concentrationSpellName && (
          <div className="border-t pt-2">
            {showConcInput ? (
              <div className="flex gap-1">
                <Input
                  placeholder="Spell name..."
                  value={concSpellInput}
                  onChange={(e) => setConcSpellInput(e.target.value)}
                  className="flex-1 h-7 text-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") commitConcentration(); if (e.key === "Escape") setShowConcInput(false); }}
                  autoFocus
                />
                <Button size="sm" className="h-7 px-2 text-xs" onClick={commitConcentration}>
                  Set
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => { setShowConcInput(false); setConcSpellInput(""); }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground w-full justify-start px-1"
                onClick={() => setShowConcInput(true)}
              >
                <Zap className="w-3 h-3 mr-1.5" />
                Set concentration...
              </Button>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
};
