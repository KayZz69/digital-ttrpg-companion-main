/**
 * @fileoverview Ability Score Improvement step for the Level Up Wizard.
 * Lets the player choose +2 to one ability or +1 to two abilities (max 20 each).
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DnD5eAbilityScores } from "@/types/character";
import { getAbilityModifier } from "@/lib/dndRules";
import { type ASIChoice } from "@/utils/progressionUtils";

type AbilityKey = keyof DnD5eAbilityScores;

interface ASIStepProps {
  abilityScores: DnD5eAbilityScores;
  choice: ASIChoice | null;
  onChange: (choice: ASIChoice | null) => void;
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
  const [splitAbilities, setSplitAbilities] = useState<AbilityKey[]>(
    choice?.mode === "split" ? [choice.ability1, choice.ability2] : []
  );

  const handleModeChange = (newMode: "single" | "split") => {
    setMode(newMode);
    setSingleAbility(null);
    setSplitAbilities([]);
    onChange(null);
  };

  const handleSingleSelect = (key: AbilityKey) => {
    if (abilityScores[key] >= 20) return;
    if (singleAbility === key) {
      setSingleAbility(null);
      onChange(null);
      return;
    }
    setSingleAbility(key);
    onChange({ mode: "single", ability: key });
  };

  const handleSplitSelect = (key: AbilityKey) => {
    if (abilityScores[key] >= 20) return;

    let next: AbilityKey[];
    if (splitAbilities.includes(key)) {
      next = splitAbilities.filter((ability) => ability !== key);
    } else if (splitAbilities.length < 2) {
      next = [...splitAbilities, key];
    } else {
      next = [splitAbilities[0], key];
    }

    setSplitAbilities(next);
    if (next.length === 2 && next[0] !== next[1]) {
      onChange({ mode: "split", ability1: next[0], ability2: next[1] });
    } else {
      onChange(null);
    }
  };

  const getNewScore = (key: AbilityKey): number => {
    const current = abilityScores[key];
    if (mode === "single" && singleAbility === key) return Math.min(20, current + 2);
    if (mode === "split" && splitAbilities.includes(key))
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
              : splitAbilities.includes(key);

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
                    {"->"} {newScore}
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
      {mode === "split" && splitAbilities.length === 1 && (
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
