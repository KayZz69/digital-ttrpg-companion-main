/**
 * @fileoverview Level Up Wizard — a multi-step dialog for advancing a character by one level.
 * Steps: Overview → HP Gain → ASI (if applicable) → Confirm
 */

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Character, DnD5eCharacter } from "@/types/character";
import { getClassByName } from "@/lib/dndCompendium";
import { getProficiencyBonus, getAbilityModifier } from "@/lib/dndRules";
import {
  getNewFeaturesAtLevel,
  isASILevel,
  getNewMaxHP,
  applyASI,
  getHitDiceMax,
} from "@/utils/progressionUtils";
import { HPGainStep } from "./HPGainStep";
import { ASIStep } from "./ASIStep";
import { Sparkles, TrendingUp, Shield } from "lucide-react";

type WizardStep = "overview" | "hp" | "asi" | "confirm";

type AbilityKey = keyof DnD5eCharacter["abilityScores"];
type ASIChoice =
  | { mode: "single"; ability: AbilityKey }
  | { mode: "split"; ability1: AbilityKey; ability2: AbilityKey };

interface LevelUpResult {
  newLevel: number;
  hpGained: number;
  newMaxHP: number;
  newAbilityScores: DnD5eCharacter["abilityScores"];
}

interface LevelUpWizardProps {
  open: boolean;
  character: Character;
  onClose: () => void;
  onConfirm: (result: LevelUpResult) => void;
}

export function LevelUpWizard({ open, character, onClose, onConfirm }: LevelUpWizardProps) {
  const dnd = character.data as DnD5eCharacter;
  const newLevel = dnd.level + 1;
  const classData = getClassByName(dnd.class);
  const features = classData?.features ?? [];

  const newProfBonus = getProficiencyBonus(newLevel);
  const oldProfBonus = getProficiencyBonus(dnd.level);
  const profBonusIncreased = newProfBonus > oldProfBonus;

  const newFeatures = useMemo(() => getNewFeaturesAtLevel(features, newLevel), [features, newLevel]);
  const hasASI = useMemo(() => isASILevel(features, newLevel), [features, newLevel]);

  // Filter out ASI from "new features" display since it has its own step
  const displayFeatures = newFeatures.filter((f) => f.name !== "Ability Score Improvement");

  // Determine wizard steps based on whether ASI applies
  const steps: WizardStep[] = hasASI
    ? ["overview", "hp", "asi", "confirm"]
    : ["overview", "hp", "confirm"];

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];

  const conMod = getAbilityModifier(dnd.abilityScores.constitution);
  const [useAverage, setUseAverage] = useState(true);
  const [rolledHP, setRolledHP] = useState<number | null>(null);
  const [asiChoice, setASIChoice] = useState<ASIChoice | null>(null);

  const hpGainPreview = useMemo(() => {
    const { hpGained } = getNewMaxHP(dnd.hitPoints.max, dnd.class, conMod, useAverage);
    return rolledHP !== null && !useAverage ? rolledHP : hpGained;
  }, [dnd.hitPoints.max, dnd.class, conMod, useAverage, rolledHP]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleConfirm = () => {
    const finalHP = rolledHP !== null && !useAverage ? rolledHP : hpGainPreview;
    const newAbilityScores = asiChoice
      ? applyASI(dnd.abilityScores, asiChoice)
      : { ...dnd.abilityScores };

    onConfirm({
      newLevel,
      hpGained: finalHP,
      newMaxHP: dnd.hitPoints.max + finalHP,
      newAbilityScores,
    });
  };

  const handleReset = () => {
    setStepIndex(0);
    setUseAverage(true);
    setRolledHP(null);
    setASIChoice(null);
  };

  const canProceedFromCurrentStep = (): boolean => {
    if (currentStep === "asi" && !asiChoice) return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { handleReset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Level Up! {dnd.name} → Level {newLevel}
          </DialogTitle>
          <DialogDescription>
            Step {stepIndex + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Overview */}
        {currentStep === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-lg">
                  {dnd.class} Level {newLevel}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dnd.race} • {dnd.name}
                </p>
              </div>
            </div>

            {profBonusIncreased && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <span className="font-medium">Proficiency Bonus increases: </span>
                  <span className="text-muted-foreground">+{oldProfBonus} → </span>
                  <Badge variant="default">+{newProfBonus}</Badge>
                </div>
              </div>
            )}

            {hasASI && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  Ability Score Improvement available at this level
                </p>
              </div>
            )}

            {displayFeatures.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">New Class Features:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {displayFeatures.map((f) => (
                    <div key={f.name} className="p-3 rounded-lg bg-muted/60">
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                        {f.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {displayFeatures.length === 0 && !hasASI && !profBonusIncreased && (
              <p className="text-sm text-muted-foreground italic">
                No new class features at this level.
              </p>
            )}
          </div>
        )}

        {/* Step: HP Gain */}
        {currentStep === "hp" && (
          <HPGainStep
            className={dnd.class}
            conMod={conMod}
            useAverage={useAverage}
            rolledValue={rolledHP}
            onSetUseAverage={setUseAverage}
            onRoll={setRolledHP}
          />
        )}

        {/* Step: ASI */}
        {currentStep === "asi" && (
          <ASIStep
            abilityScores={dnd.abilityScores}
            choice={asiChoice}
            onChange={setASIChoice}
          />
        )}

        {/* Step: Confirm */}
        {currentStep === "confirm" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review your choices before applying the level up.
            </p>
            <div className="space-y-2">
              <SummaryRow label="New Level" value={`${newLevel}`} />
              <SummaryRow label="Proficiency Bonus" value={`+${newProfBonus}`} />
              <SummaryRow
                label="HP Gained"
                value={`+${hpGainPreview} (${dnd.hitPoints.max} → ${dnd.hitPoints.max + hpGainPreview})`}
              />
              <SummaryRow
                label="Hit Dice"
                value={`${getHitDiceMax(dnd.level)} → ${getHitDiceMax(newLevel)}`}
              />
              {asiChoice && (
                <SummaryRow
                  label="ASI"
                  value={
                    asiChoice.mode === "single"
                      ? `+2 ${asiChoice.ability}`
                      : `+1 ${asiChoice.ability1}, +1 ${asiChoice.ability2}`
                  }
                />
              )}
              {displayFeatures.length > 0 && (
                <SummaryRow
                  label="New Features"
                  value={displayFeatures.map((f) => f.name).join(", ")}
                />
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={stepIndex === 0 ? () => { handleReset(); onClose(); } : handleBack}
          >
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>
          {currentStep !== "confirm" ? (
            <Button onClick={handleNext} disabled={!canProceedFromCurrentStep()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleConfirm} className="bg-primary">
              Apply Level Up
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 border-b border-muted last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
