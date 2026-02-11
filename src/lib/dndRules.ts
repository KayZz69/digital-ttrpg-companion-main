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
