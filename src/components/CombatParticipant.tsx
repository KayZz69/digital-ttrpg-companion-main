/**
 * @fileoverview Combat Participant component for displaying combatants in the initiative order.
 * Provides HP management, condition tracking, and quick actions during combat.
 */

import { Combatant, Condition, ConditionType } from "@/types/combat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Shield, Heart, Skull, Trash2, User, UserPlus, Plus, X, AlertCircle } from "lucide-react";
import { useState } from "react";

/**
 * Props for the CombatParticipant component.
 */
interface CombatParticipantProps {
  /** The combatant data to display */
  combatant: Combatant;
  /** Whether this combatant has the current turn */
  isCurrentTurn: boolean;
  /** Callback to update the combatant's HP */
  onUpdateHP: (id: string, newHP: number) => void;
  /** Callback to remove the combatant from combat */
  onRemove: (id: string) => void;
  /** Callback to update the combatant's conditions */
  onUpdateConditions: (id: string, conditions: Condition[]) => void;
}

/**
 * Combat Participant card component.
 * Displays a single combatant with their stats and provides interactive controls:
 * - HP bar with quick adjustment buttons (-5, -1, +1, +5)
 * - Damage/heal input with apply buttons
 * - Condition management with duration tracking
 * - Visual indicators for type (player/ally/enemy) and current turn
 *
 * @param props - Component props including combatant data and callbacks
 */
export const CombatParticipant = ({
  combatant,
  isCurrentTurn,
  onUpdateHP,
  onRemove,
  onUpdateConditions,
}: CombatParticipantProps) => {
  const [damageInput, setDamageInput] = useState("");
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [newCondition, setNewCondition] = useState<ConditionType>("poisoned");
  const [conditionDuration, setConditionDuration] = useState("1");
  const [conditionNotes, setConditionNotes] = useState("");

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
      const newHP = Math.max(0, combatant.hitPoints.current - amount);
      onUpdateHP(combatant.id, newHP);
      setDamageInput("");
    }
  };

  const applyHealing = () => {
    const amount = parseInt(damageInput) || 0;
    if (amount > 0) {
      const newHP = Math.min(combatant.hitPoints.max, combatant.hitPoints.current + amount);
      onUpdateHP(combatant.id, newHP);
      setDamageInput("");
    }
  };

  const quickAdjust = (amount: number) => {
    const newHP = Math.max(0, Math.min(combatant.hitPoints.max, combatant.hitPoints.current + amount));
    onUpdateHP(combatant.id, newHP);
  };

  const addCondition = () => {
    const duration = parseInt(conditionDuration);
    if (isNaN(duration) || duration < -1) return;

    const condition = {
      id: crypto.randomUUID(),
      type: newCondition,
      duration,
      notes: conditionNotes || undefined,
    };

    const updatedConditions = [...(combatant.conditions || []), condition];
    onUpdateConditions(combatant.id, updatedConditions);

    setNewCondition("poisoned");
    setConditionDuration("1");
    setConditionNotes("");
    setShowConditionDialog(false);
  };

  const removeCondition = (conditionId: string) => {
    const updatedConditions = (combatant.conditions || []).filter((c) => c.id !== conditionId);
    onUpdateConditions(combatant.id, updatedConditions);
  };

  const typeConfig = {
    player: { icon: User, color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
    ally: { icon: UserPlus, color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
    enemy: { icon: Skull, color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
  };

  const TypeIcon = typeConfig[combatant.type].icon;
  const isDead = combatant.hitPoints.current === 0;

  return (
    <Card
      className={`transition-all ${isCurrentTurn ? "border-primary border-2 shadow-lg shadow-primary/20" : ""
        } ${isDead ? "opacity-60" : ""}`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={typeConfig[combatant.type].color}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {combatant.type}
              </Badge>
              {isCurrentTurn && (
                <Badge className="animate-pulse">Active Turn</Badge>
              )}
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
                  <span className="text-xs">({combatant.initiativeBonus >= 0 ? '+' : ''}{combatant.initiativeBonus})</span>
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
                {condition.duration === -1 && " (∞)"}
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

        <div className="grid grid-cols-4 gap-1">
          <Button variant="outline" size="sm" onClick={() => quickAdjust(-5)}>
            -5
          </Button>
          <Button variant="outline" size="sm" onClick={() => quickAdjust(-1)}>
            -1
          </Button>
          <Button variant="outline" size="sm" onClick={() => quickAdjust(1)}>
            +1
          </Button>
          <Button variant="outline" size="sm" onClick={() => quickAdjust(5)}>
            +5
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Amount"
            value={damageInput}
            onChange={(e) => setDamageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyDamage();
            }}
            className="flex-1"
          />
          <Button variant="destructive" size="sm" onClick={applyDamage}>
            Damage
          </Button>
          <Button variant="default" size="sm" onClick={applyHealing}>
            Heal
          </Button>
        </div>

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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Button onClick={addCondition} className="flex-1">
                  Add Condition
                </Button>
                <Button variant="outline" onClick={() => setShowConditionDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
