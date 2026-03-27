/**
 * @fileoverview UI-facing spell selection helpers backed by the RulesRegistry.
 *
 * All spell slot tables, cantrip limits, and known/prepared counts are now
 * delegated to the registry (src/lib/rules/spells.ts). This module provides
 * higher-level functions for the character creation wizard and spell managers
 * that translate registry output into the SpellSlots shape used by CharacterData.
 *
 * CCR-003: Registry-driven spell logic migration.
 */

import { type SpellSlots } from "@/types/character";
import { getClassHitDie, isSpellcastingClass } from "./dndCompendium";
import {
  getCantrips,
  getMaxPreparedSpells,
  getSpellcastingType,
  getSpellSlots,
} from "./rules/spells";
import type { SpellcastingType } from "./rules/RulesRegistry";

// ---------------------------------------------------------------------------
// Re-export SpellcastingType for consumers that need the full union
// ---------------------------------------------------------------------------
export type { SpellcastingType };

// ---------------------------------------------------------------------------
// UI-layer types
// ---------------------------------------------------------------------------

/**
 * Simplified spellcasting mode for the spell selection UI.
 * "pact" casters (warlock) are presented as "known" in the selection UI.
 */
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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

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
 * Maps the full SpellcastingType to the simplified UI mode.
 * "pact" → "known" (warlock spell selection works like known-caster UI).
 */
function toRuleMode(type: SpellcastingType): SpellcastingRuleMode {
  if (type === "pact") return "known";
  return type;
}

// ---------------------------------------------------------------------------
// Registry-backed spell helpers
// ---------------------------------------------------------------------------

export function getMaxCantrips(className: string, level: number): number | null {
  const cantrip = getCantrips(className, level);
  return cantrip ? cantrip.maxKnown : null;
}

export function getSpellcastingRuleMode(className: string): SpellcastingRuleMode {
  if (!className.trim() || !isSpellcastingClass(className)) {
    return "none";
  }
  return toRuleMode(getSpellcastingType(className));
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

  const maxLeveledSpells =
    mode === "none"
      ? null
      : getMaxPreparedSpells(className, level, getAbilityModifier(abilityScore)) || null;

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

// ---------------------------------------------------------------------------
// General character helpers (not spell-specific)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// SpellSlots shape conversion (registry SpellSlot[] → CharacterData SpellSlots)
// ---------------------------------------------------------------------------

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
 * Converts the registry SpellSlot[] output into the SpellSlots shape
 * used by CharacterData. Slots start at current=max (fully rested).
 */
export function getDefaultSpellSlots(className: string, level: number): SpellSlots {
  const registrySlots = getSpellSlots(className, level);
  const result = createEmptySpellSlots();

  for (const slot of registrySlots) {
    if (slot.level >= 1 && slot.level <= 9) {
      const key = `level${slot.level}` as keyof SpellSlots;
      result[key] = { current: slot.max, max: slot.max };
    }
  }

  return result;
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
