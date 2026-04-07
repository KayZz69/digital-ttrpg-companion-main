/**
 * @fileoverview Ability scores, modifiers, saving throws, and computed values.
 * Wires into the rules engine for proficiency bonus, passive Perception,
 * spell save DC, and spell attack bonus (CCR-018).
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingThrowsManager } from "@/components/SavingThrowsManager";
import { DnD5eAbilityScores, SavingThrowProficiency, SkillProficiency } from "@/types/character";
import { getAbilityModifier, formatModifier, getProficiencyBonus } from "@/lib/dndRules";

type AbilityKey = keyof DnD5eAbilityScores;

interface StatsBlockProps {
  abilityScores: DnD5eAbilityScores;
  level: number;
  savingThrows: SavingThrowProficiency;
  skills?: SkillProficiency;
  spellcastingAbility?: string;
  onUpdateSavingThrows: (savingThrows: SavingThrowProficiency) => void;
  readOnly?: boolean;
}

const ABILITY_LABELS: Record<AbilityKey, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

/**
 * Compute passive Perception: 10 + Wisdom modifier + proficiency bonus (if proficient in Perception).
 */
function getPassivePerception(
  wisdomScore: number,
  level: number,
  skills?: SkillProficiency
): number {
  const wisMod = getAbilityModifier(wisdomScore);
  const profLevel = skills?.["Perception"] ?? "none";
  const profMultiplier = profLevel === "expert" ? 2 : profLevel === "proficient" ? 1 : 0;
  return 10 + wisMod + profMultiplier * getProficiencyBonus(level);
}

export const StatsBlock = ({
  abilityScores,
  level,
  savingThrows,
  skills,
  spellcastingAbility,
  onUpdateSavingThrows,
  readOnly = false,
}: StatsBlockProps) => {
  const profBonus = getProficiencyBonus(level);
  const passivePerception = getPassivePerception(abilityScores.wisdom, level, skills);

  // Spell save DC and spell attack bonus (if character is a caster)
  const spellcastingMod = spellcastingAbility
    ? getAbilityModifier(abilityScores[spellcastingAbility as AbilityKey] ?? 10)
    : null;
  const spellSaveDC = spellcastingMod !== null ? 8 + profBonus + spellcastingMod : null;
  const spellAttackBonus = spellcastingMod !== null ? profBonus + spellcastingMod : null;

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Ability Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(Object.entries(abilityScores) as [AbilityKey, number][]).map(([ability, score]) => {
                const mod = getAbilityModifier(score);
                return (
                  <div key={ability} className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {ABILITY_LABELS[ability]}
                    </div>
                    <div className="text-3xl font-bold">{score}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatModifier(mod)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Computed values */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Passive Perception</span>
                <span className="font-mono font-bold">{passivePerception}</span>
              </div>
              {spellSaveDC !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Spell Save DC</span>
                  <span className="font-mono font-bold">{spellSaveDC}</span>
                </div>
              )}
              {spellAttackBonus !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Spell Attack Bonus</span>
                  <span className="font-mono font-bold">{formatModifier(spellAttackBonus)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <SavingThrowsManager
          abilityScores={abilityScores}
          level={level}
          savingThrows={savingThrows}
          onUpdateSavingThrows={onUpdateSavingThrows}
          readOnly={readOnly}
        />
      </div>
    </>
  );
};
