import { type SpellSlots } from "@/types/character";
import { getClassHitDie, isSpellcastingClass } from "./dndCompendium";
import { getCantrips, getMaxPreparedSpells, getSpellSlots, getSpellcastingType } from "./rules/spells";
export { getRules } from "./rules/spells";

export type SpellcastingRuleMode = "none" | "prepared" | "known";

export interface SpellSelectionState {
  mode: SpellcastingRuleMode;
  label: "Prepared spells" | "Known spells" | "Spells";
  maxCantrips: number | null;
  currentCantrips: number;
  remainingCantrips: number | null;
  maxLeveledSpells: number | null;
  currentLeveledSpells: number;
  remainingLeveledSpells: number | null;
  isAtLimit: boolean;
  isOverLimit: boolean;
}

export interface SpellSelectionValidation extends SpellSelectionState {
  canAdd: boolean;
  reason?: string;
}

const toRuleLabel = (mode: SpellcastingRuleMode): SpellSelectionState["label"] => {
  if (mode === "known") {
    return "Known spells";
  }
  if (mode === "prepared") {
    return "Prepared spells";
  }
  return "Spells";
};

/**
 * Returns the maximum cantrips known for a class at a given level.
 * Delegates to the rules registry.
 */
export function getMaxCantrips(className: string, level: number): number | null {
  const cantrip = getCantrips(className, level);
  return cantrip ? cantrip.maxKnown : null;
}

/**
 * Returns the spellcasting rule mode for a class.
 * Delegates to the registry's SpellcastingType and maps to the legacy mode union.
 */
export function getSpellcastingRuleMode(className: string): SpellcastingRuleMode {
  if (!className.trim() || !isSpellcastingClass(className)) {
    return "none";
  }
  const type = getSpellcastingType(className);
  if (type === "known" || type === "pact") return "known";
  if (type === "prepared") return "prepared";
  return "none";
}

export function getSpellSelectionState(
  className: string,
  level: number,
  abilityScore: number,
  spells: Array<{ level: number }>
): SpellSelectionState {
  const mode = getSpellcastingRuleMode(className);
  const currentCantrips = spells.filter((spell) => spell.level === 0).length;
  const currentLeveledSpells = spells.filter((spell) => spell.level > 0).length;
  const label = toRuleLabel(mode);
  const maxCantrips = mode === "none" ? 0 : getMaxCantrips(className, level);

  let maxLeveledSpells: number | null = null;
  if (mode !== "none") {
    const modifier = getAbilityModifier(abilityScore);
    maxLeveledSpells = getMaxPreparedSpells(className, level, modifier);
    if (maxLeveledSpells === 0) maxLeveledSpells = null;
  }

  const remainingLeveledSpells =
    maxLeveledSpells === null ? null : Math.max(maxLeveledSpells - currentLeveledSpells, 0);
  const remainingCantrips =
    maxCantrips === null ? null : Math.max(maxCantrips - currentCantrips, 0);

  return {
    mode,
    label,
    maxCantrips,
    currentCantrips,
    remainingCantrips,
    maxLeveledSpells,
    currentLeveledSpells,
    remainingLeveledSpells,
    isAtLimit: maxLeveledSpells !== null && currentLeveledSpells >= maxLeveledSpells,
    isOverLimit:
      (maxLeveledSpells !== null && currentLeveledSpells > maxLeveledSpells) ||
      (maxCantrips !== null && currentCantrips > maxCantrips),
  };
}

export function validateSpellSelection(
  className: string,
  level: number,
  abilityScore: number,
  spells: Array<{ level: number }>,
  candidateSpellLevel: number
): SpellSelectionValidation {
  const state = getSpellSelectionState(className, level, abilityScore, spells);

  if (state.mode === "none") {
    return {
      ...state,
      canAdd: false,
      reason: "This class does not use spellcasting.",
    };
  }

  if (candidateSpellLevel <= 0) {
    if (state.maxCantrips !== null && state.currentCantrips >= state.maxCantrips) {
      return {
        ...state,
        canAdd: false,
        reason: `Cantrip limit reached (${state.currentCantrips}/${state.maxCantrips}).`,
      };
    }
    return {
      ...state,
      canAdd: true,
    };
  }

  if (state.maxLeveledSpells === null) {
    return {
      ...state,
      canAdd: true,
    };
  }

  if (state.currentLeveledSpells >= state.maxLeveledSpells) {
    return {
      ...state,
      canAdd: false,
      reason: `${state.label} limit reached (${state.currentLeveledSpells}/${state.maxLeveledSpells} leveled spells).`,
    };
  }

  return {
    ...state,
    canAdd: true,
  };
}

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

export function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function getLevelOneHitPoints(className: string, constitutionScore: number): number {
  const base = getClassHitDie(className) + getAbilityModifier(constitutionScore);
  return Math.max(1, base);
}

export function createEmptySpellSlots(): SpellSlots {
  return {
    level1: { current: 0, max: 0 },
    level2: { current: 0, max: 0 },
    level3: { current: 0, max: 0 },
    level4: { current: 0, max: 0 },
    level5: { current: 0, max: 0 },
    level6: { current: 0, max: 0 },
    level7: { current: 0, max: 0 },
    level8: { current: 0, max: 0 },
    level9: { current: 0, max: 0 },
  };
}

/**
 * Returns spell slots for a class at a given level.
 * Delegates to the rules registry and converts SpellSlot[] to the SpellSlots shape
 * expected by the character data model.
 */
export function getDefaultSpellSlots(className: string, level: number): SpellSlots {
  const slots = createEmptySpellSlots();
  const registrySlots = getSpellSlots(className, level);
  for (const slot of registrySlots) {
    const key = `level${slot.level}` as keyof SpellSlots;
    slots[key] = { current: slot.max, max: slot.max };
  }
  return slots;
}

export function getHighestSlotLevel(spellSlots: SpellSlots): number {
  for (let level = 9; level >= 1; level -= 1) {
    const key = `level${level}` as keyof SpellSlots;
    if (spellSlots[key].max > 0) {
      return level;
    }
  }
  return 0;
}
