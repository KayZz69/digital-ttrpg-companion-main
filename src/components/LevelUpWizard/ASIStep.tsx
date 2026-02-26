/**
 * @fileoverview Ability Score Improvement step for the Level Up Wizard.
 * Lets the player choose +2 to one ability or +1 to two abilities (max 20 each).
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DnD5eAbilityScores } from "@/types/character";
import { getAbilityModifier } from "@/lib/dndRules";

type AbilityKey = keyof DnD5eAbilityScores;

type ASIChoice =
  | { mode: "single"; ability: AbilityKey }
  | { mode: "split"; ability1: AbilityKey; ability2: AbilityKey };

interface ASIStepProps {
  abilityScores: DnD5eAbilityScores;
  choice: ASIChoice | null;
  onChange: (choice: ASIChoice) => void;
}

const ABILITIES: { key: AbilityKey; label: string }[] = [
  { key: "strength", label: "STR" },
  { key: "dexterity", label: "DEX" },
  { key: "constitution", label: "CON" },
  { key: "intelligence", label: "INT" },
  { key: "wisdom", label: "WIS" },
  { key: "charisma", label: "CHA" },
];

export function ASIStep({ abilityScores, choice, onChange }: ASIStepProps) {
  const [mode, setMode] = useState<"single" | "split">(choice?.mode ?? "single");
  const [singleAbility, setSingleAbility] = useState<AbilityKey | null>(
    choice?.mode === "single" ? choice.ability : null
  );
  const [splitAbility1, setSplitAbility1] = useState<AbilityKey | null>(
    choice?.mode === "split" ? choice.ability1 : null
  );
  const [splitAbility2, setSplitAbility2] = useState<AbilityKey | null>(
    choice?.mode === "split" ? choice.ability2 : null
  );

  const handleModeChange = (newMode: "single" | "split") => {
    setMode(newMode);
    setSingleAbility(null);
    setSplitAbility1(null);
    setSplitAbility2(null);
  };

  const handleSingleSelect = (key: AbilityKey) => {
    if (abilityScores[key] >= 20) return;
    setSingleAbility(key);
    onChange({ mode: "single", ability: key });
  };

  const handleSplitSelect = (key: AbilityKey) => {
    if (abilityScores[key] >= 20) return;

    if (splitAbility1 === key) {
      setSplitAbility1(splitAbility2);
      setSplitAbility2(null);
      if (splitAbility2) onChange({ mode: "split", ability1: splitAbility2, ability2: splitAbility2 });
      return;
    }
    if (splitAbility2 === key) {
      setSplitAbility2(null);
      if (splitAbility1) onChange({ mode: "split", ability1: splitAbility1, ability2: splitAbility1 });
      return;
    }

    if (!splitAbility1) {
      setSplitAbility1(key);
    } else if (!splitAbility2) {
      setSplitAbility2(key);
      onChange({ mode: "split", ability1: splitAbility1, ability2: key });
    } else {
      // Replace the second selection
      setSplitAbility2(key);
      onChange({ mode: "split", ability1: splitAbility1, ability2: key });
    }
  };

  const getNewScore = (key: AbilityKey): number => {
    const current = abilityScores[key];
    if (mode === "single" && singleAbility === key) return Math.min(20, current + 2);
    if (mode === "split" && (splitAbility1 === key || splitAbility2 === key))
      return Math.min(20, current + 1);
    return current;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose how to apply your Ability Score Improvement. Scores cannot exceed 20.
      </p>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleModeChange("single")}
          className={`p-3 rounded-lg border-2 text-center transition-colors ${
            mode === "single" ? "border-primary bg-primary/10" : "border-muted hover:border-primary/40"
          }`}
        >
          <p className="font-semibold">+2 One Ability</p>
          <p className="text-xs text-muted-foreground">Boost one score by 2</p>
        </button>
        <button
          onClick={() => handleModeChange("split")}
          className={`p-3 rounded-lg border-2 text-center transition-colors ${
            mode === "split" ? "border-primary bg-primary/10" : "border-muted hover:border-primary/40"
          }`}
        >
          <p className="font-semibold">+1 Two Abilities</p>
          <p className="text-xs text-muted-foreground">Boost two scores by 1 each</p>
        </button>
      </div>

      {/* Ability score grid */}
      <div className="grid grid-cols-3 gap-2">
        {ABILITIES.map(({ key, label }) => {
          const current = abilityScores[key];
          const newScore = getNewScore(key);
          const atMax = current >= 20;
          const isSelected =
            mode === "single"
              ? singleAbility === key
              : splitAbility1 === key || splitAbility2 === key;

          return (
            <button
              key={key}
              onClick={() =>
                mode === "single" ? handleSingleSelect(key) : handleSplitSelect(key)
              }
              disabled={atMax}
              className={`p-3 rounded-lg border-2 text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/40"
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{current}</p>
              {isSelected && newScore !== current && (
                <Badge variant="default" className="text-xs mt-1">
                  → {newScore}
                </Badge>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {getAbilityModifier(current) >= 0 ? "+" : ""}
                {getAbilityModifier(current)}
              </p>
              {atMax && <p className="text-xs text-muted-foreground">MAX</p>}
            </button>
          );
        })}
      </div>

      {/* Validation hint */}
      {mode === "split" && splitAbility1 && !splitAbility2 && (
        <p className="text-xs text-muted-foreground text-center">
          Select one more ability to boost
        </p>
      )}
      {!choice && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
          Select an ability score improvement to continue
        </p>
      )}
    </div>
  );
}
