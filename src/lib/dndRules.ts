import { type SpellSlots } from "@/types/character";
import { getClassHitDie, isSpellcastingClass } from "./dndCompendium";

const FULL_CASTER_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const HALF_CASTER_SLOTS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
];

const WARLOCK_PACT_SLOTS: Array<{ spellLevel: number; slots: number }> = [
  { spellLevel: 1, slots: 1 },
  { spellLevel: 1, slots: 2 },
  { spellLevel: 2, slots: 2 },
  { spellLevel: 2, slots: 2 },
  { spellLevel: 3, slots: 2 },
  { spellLevel: 3, slots: 2 },
  { spellLevel: 4, slots: 2 },
  { spellLevel: 4, slots: 2 },
  { spellLevel: 5, slots: 2 },
  { spellLevel: 5, slots: 2 },
  { spellLevel: 5, slots: 3 },
  { spellLevel: 5, slots: 3 },
  { spellLevel: 5, slots: 3 },
  { spellLevel: 5, slots: 3 },
  { spellLevel: 5, slots: 3 },
  { spellLevel: 5, slots: 3 },
  { spellLevel: 5, slots: 4 },
  { spellLevel: 5, slots: 4 },
  { spellLevel: 5, slots: 4 },
  { spellLevel: 5, slots: 4 },
];

const HALF_CASTER_CLASSES = new Set(["paladin", "ranger"]);
const PREPARED_SPELLCASTERS = new Set(["cleric", "druid", "paladin", "ranger", "wizard"]);
const KNOWN_SPELL_LIMITS: Record<string, number[]> = {
  bard: [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 17, 18, 19, 20, 22, 22],
  sorcerer: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
  warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
};

export type SpellcastingRuleMode = "none" | "prepared" | "known";

export interface SpellSelectionState {
  mode: SpellcastingRuleMode;
  label: "Prepared spells" | "Known spells" | "Spells";
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

const clampLevel = (level: number): number => Math.min(Math.max(level, 1), 20);

const toRuleLabel = (mode: SpellcastingRuleMode): SpellSelectionState["label"] => {
  if (mode === "known") {
    return "Known spells";
  }
  if (mode === "prepared") {
    return "Prepared spells";
  }
  return "Spells";
};

const getPreparedLeveledLimit = (
  className: string,
  level: number,
  abilityModifier: number
): number => {
  const lower = className.toLowerCase();
  if (lower === "paladin" || lower === "ranger") {
    return Math.max(1, Math.floor(level / 2) + abilityModifier);
  }
  return Math.max(1, level + abilityModifier);
};

export function getSpellcastingRuleMode(className: string): SpellcastingRuleMode {
  const lower = className.trim().toLowerCase();
  if (!lower || !isSpellcastingClass(className)) {
    return "none";
  }
  if (KNOWN_SPELL_LIMITS[lower]) {
    return "known";
  }
  if (PREPARED_SPELLCASTERS.has(lower)) {
    return "prepared";
  }
  return "prepared";
}

export function getSpellSelectionState(
  className: string,
  level: number,
  abilityScore: number,
  spells: Array<{ level: number }>
): SpellSelectionState {
  const mode = getSpellcastingRuleMode(className);
  const normalizedLevel = clampLevel(level);
  const currentLeveledSpells = spells.filter((spell) => spell.level > 0).length;
  const label = toRuleLabel(mode);

  let maxLeveledSpells: number | null = null;
  if (mode === "known") {
    const counts = KNOWN_SPELL_LIMITS[className.trim().toLowerCase()] || [];
    maxLeveledSpells = counts[normalizedLevel - 1] ?? null;
  } else if (mode === "prepared") {
    maxLeveledSpells = getPreparedLeveledLimit(
      className,
      normalizedLevel,
      getAbilityModifier(abilityScore)
    );
  }

  const remainingLeveledSpells =
    maxLeveledSpells === null ? null : Math.max(maxLeveledSpells - currentLeveledSpells, 0);

  return {
    mode,
    label,
    maxLeveledSpells,
    currentLeveledSpells,
    remainingLeveledSpells,
    isAtLimit: maxLeveledSpells !== null && currentLeveledSpells >= maxLeveledSpells,
    isOverLimit: maxLeveledSpells !== null && currentLeveledSpells > maxLeveledSpells,
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

  if (candidateSpellLevel <= 0 || state.maxLeveledSpells === null) {
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

function fillSlotsFromArray(values: number[]): SpellSlots {
  const slots = createEmptySpellSlots();
  values.forEach((value, index) => {
    const key = `level${index + 1}` as keyof SpellSlots;
    slots[key] = {
      current: value,
      max: value,
    };
  });
  return slots;
}

export function getDefaultSpellSlots(className: string, level: number): SpellSlots {
  const clampedLevel = Math.min(Math.max(level, 1), 20);
  if (!isSpellcastingClass(className)) {
    return createEmptySpellSlots();
  }

  const lower = className.toLowerCase();
  if (lower === "warlock") {
    const pact = WARLOCK_PACT_SLOTS[clampedLevel - 1];
    const slots = createEmptySpellSlots();
    const key = `level${pact.spellLevel}` as keyof SpellSlots;
    slots[key] = {
      current: pact.slots,
      max: pact.slots,
    };
    return slots;
  }

  if (HALF_CASTER_CLASSES.has(lower)) {
    return fillSlotsFromArray(HALF_CASTER_SLOTS[clampedLevel - 1]);
  }

  return fillSlotsFromArray(FULL_CASTER_SLOTS[clampedLevel - 1]);
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
