/**
 * @fileoverview HP Gain step for the Level Up Wizard.
 * Lets the player choose between taking the average or rolling their hit die.
 */

import { Button } from "@/components/ui/button";
import { getClassHitDie } from "@/lib/dndCompendium";
import { getAverageHPGain, rollHPGain } from "@/utils/progressionUtils";
import { Dices } from "lucide-react";

interface HPGainStepProps {
  className: string;
  conMod: number;
  useAverage: boolean;
  rolledValue: number | null;
  onSetUseAverage: (v: boolean) => void;
  onRoll: (v: number) => void;
}

export function HPGainStep({
  className,
  conMod,
  useAverage,
  rolledValue,
  onSetUseAverage,
  onRoll,
}: HPGainStepProps) {
  const hitDie = getClassHitDie(className);
  const average = getAverageHPGain(hitDie, conMod);

  const handleRoll = () => {
    const result = rollHPGain(hitDie, conMod);
    onRoll(result);
    onSetUseAverage(false);
  };

  const handleUseAverage = () => {
    onSetUseAverage(true);
  };

  const displayHP = useAverage ? average : (rolledValue ?? average);

  return (
    <div className="space-y-4">
      <div className="text-center p-4 rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground mb-1">Hit Die</p>
        <p className="text-3xl font-bold font-display">d{hitDie}</p>
        {conMod !== 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            CON modifier: {conMod >= 0 ? "+" : ""}{conMod}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleUseAverage}
          className={`p-4 rounded-lg border-2 text-center transition-colors ${
            useAverage
              ? "border-primary bg-primary/10"
              : "border-muted hover:border-primary/50"
          }`}
        >
          <p className="text-2xl font-bold">{average}</p>
          <p className="text-xs text-muted-foreground mt-1">Take average</p>
          <p className="text-xs text-muted-foreground">
            ({Math.floor(hitDie / 2) + 1}{conMod !== 0 ? ` + ${conMod} CON` : ""})
          </p>
        </button>

        <button
          onClick={handleRoll}
          className={`p-4 rounded-lg border-2 text-center transition-colors ${
            !useAverage
              ? "border-primary bg-primary/10"
              : "border-muted hover:border-primary/50"
          }`}
        >
          {!useAverage && rolledValue !== null ? (
            <>
              <p className="text-2xl font-bold">{rolledValue}</p>
              <p className="text-xs text-muted-foreground mt-1">Rolled result</p>
            </>
          ) : (
            <>
              <Dices className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Roll the dice</p>
            </>
          )}
        </button>
      </div>

      {!useAverage && rolledValue !== null && (
        <Button variant="outline" size="sm" className="w-full" onClick={handleRoll}>
          <Dices className="w-4 h-4 mr-2" />
          Re-roll (1d{hitDie}{conMod !== 0 ? ` ${conMod >= 0 ? "+" : ""}${conMod}` : ""})
        </Button>
      )}

      <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm text-muted-foreground">HP to gain</p>
        <p className="text-4xl font-bold text-primary">+{displayHP}</p>
      </div>
    </div>
  );
}
