/**
 * @fileoverview Dice Roller Interface component with full rolling controls and history.
 * Supports all standard polyhedral dice with advantage/disadvantage mechanics.
 */

import { useState } from "react";
import { DiceType, RollMode, DiceRoll, DICE_TYPES } from "@/types/dice";
import { createDiceRoll, formatRollResult } from "@/utils/diceUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dices, Plus, Minus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Dice Roller Interface component.
 * Provides a complete dice rolling UI with:
 * - Dice type selection (d4, d6, d8, d10, d12, d20, d100)
 * - Number of dice (1-20) with increment/decrement
 * - Static modifier with increment/decrement
 * - Roll mode (normal, advantage, disadvantage)
 * - Optional description for context
 * - Roll history with formatted results
 */
export const DiceRollerInterface = () => {
  const [diceType, setDiceType] = useState<DiceType>("d20");
  const [numberOfDice, setNumberOfDice] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollMode, setRollMode] = useState<RollMode>("normal");
  const [description, setDescription] = useState("");
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);

  const handleRoll = () => {
    const roll = createDiceRoll(
      diceType,
      numberOfDice,
      modifier,
      rollMode,
      description || undefined
    );

    setRollHistory([roll, ...rollHistory]);
    setDescription("");

    toast({
      title: "Dice Rolled!",
      description: `Total: ${roll.total}`,
    });
  };

  const clearHistory = () => {
    setRollHistory([]);
    toast({
      title: "History Cleared",
      description: "All roll history has been cleared.",
    });
  };

  const incrementDice = () => {
    if (numberOfDice < 20) setNumberOfDice(numberOfDice + 1);
  };

  const decrementDice = () => {
    if (numberOfDice > 1) setNumberOfDice(numberOfDice - 1);
  };

  const incrementModifier = () => {
    setModifier(modifier + 1);
  };

  const decrementModifier = () => {
    setModifier(modifier - 1);
  };

  const getRollModeColor = (mode: RollMode) => {
    switch (mode) {
      case "advantage":
        return "bg-accent/20 text-accent-foreground";
      case "disadvantage":
        return "bg-destructive/20 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Dice Roller Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="w-5 h-5" />
            Roll Dice
          </CardTitle>
          <CardDescription>Configure your dice roll parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dice Type Selection */}
          <div className="space-y-3">
            <Label>Dice Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {DICE_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={diceType === type ? "default" : "outline"}
                  onClick={() => setDiceType(type)}
                  className="h-12 text-lg font-bold"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Number of Dice */}
          <div className="space-y-2">
            <Label>Number of Dice</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementDice}
                disabled={numberOfDice <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max="20"
                value={numberOfDice}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setNumberOfDice(Math.min(Math.max(val, 1), 20));
                }}
                className="text-center text-lg font-bold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={incrementDice}
                disabled={numberOfDice >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Modifier */}
          <div className="space-y-2">
            <Label>Modifier</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={decrementModifier}>
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="text-center text-lg font-bold"
              />
              <Button variant="outline" size="icon" onClick={incrementModifier}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Roll Mode */}
          <div className="space-y-2">
            <Label>Roll Mode</Label>
            <Select value={rollMode} onValueChange={(value) => setRollMode(value as RollMode)}>
              <SelectTrigger className="bg-popover">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="advantage">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Advantage
                  </div>
                </SelectItem>
                <SelectItem value="disadvantage">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Disadvantage
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Input
              placeholder="e.g., Attack roll, Perception check..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Roll Button */}
          <Button onClick={handleRoll} size="lg" className="w-full">
            <Dices className="w-5 h-5 mr-2" />
            Roll {numberOfDice}
            {diceType}
            {modifier !== 0 && ` ${modifier >= 0 ? "+" : ""}${modifier}`}
          </Button>

          {/* Preview */}
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Roll Preview</p>
            <p className="text-lg font-bold">
              {numberOfDice}
              {diceType}
              {modifier !== 0 && ` ${modifier >= 0 ? "+" : ""}${modifier}`}
              {rollMode !== "normal" && ` (${rollMode})`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Roll History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roll History</CardTitle>
              <CardDescription>
                {rollHistory.length} roll{rollHistory.length !== 1 ? "s" : ""} recorded
              </CardDescription>
            </div>
            {rollHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rollHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Dices className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rolls yet. Start rolling!</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {rollHistory.map((roll) => (
                  <div
                    key={roll.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    {roll.description && (
                      <p className="text-sm font-medium mb-2">{roll.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {roll.timestamp.toLocaleTimeString()}
                      </span>
                      <Badge variant="outline" className={getRollModeColor(roll.mode)}>
                        {roll.mode}
                      </Badge>
                    </div>
                    <p className="text-sm font-mono mb-2">{formatRollResult(roll)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Individual: {roll.results.join(", ")}
                      </span>
                      <span className="text-2xl font-bold text-primary">{roll.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
