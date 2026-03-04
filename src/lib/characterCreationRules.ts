import { DnD5eAbilityScores } from "@/types/character";

export type AbilityKey = keyof DnD5eAbilityScores;
export type AbilityBonuses = Partial<Record<AbilityKey, number>>;

const ABILITY_NAMES: Record<string, AbilityKey> = {
  strength: "strength",
  dexterity: "dexterity",
  constitution: "constitution",
  intelligence: "intelligence",
  wisdom: "wisdom",
  charisma: "charisma",
};

export interface ParsedAbilityScoreIncrease {
  fixedBonuses: AbilityBonuses;
  choiceBonuses: number[];
  requireDistinctChoices: boolean;
}

export const ABILITY_KEYS: AbilityKey[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

export function parseAbilityScoreIncrease(value?: string): ParsedAbilityScoreIncrease {
  const fixedBonuses: AbilityBonuses = {};
  const choiceBonuses: number[] = [];
  const text = (value || "").trim();
  if (!text) {
    return { fixedBonuses, choiceBonuses, requireDistinctChoices: false };
  }

  const fixedPattern =
    /(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s*\+(\d+)/gi;
  let fixedMatch = fixedPattern.exec(text);
  while (fixedMatch) {
    const ability = ABILITY_NAMES[fixedMatch[1].toLowerCase()];
    const amount = Number(fixedMatch[2]);
    fixedBonuses[ability] = (fixedBonuses[ability] || 0) + amount;
    fixedMatch = fixedPattern.exec(text);
  }

  const choicePattern =
    /choose\s*\+?(\d+)\s*to one ability(?:\s*and\s*\+?(\d+)\s*to another)?/i;
  const choiceMatch = text.match(choicePattern);
  if (choiceMatch) {
    choiceBonuses.push(Number(choiceMatch[1]));
    if (choiceMatch[2]) {
      choiceBonuses.push(Number(choiceMatch[2]));
    }
  }

  return {
    fixedBonuses,
    choiceBonuses,
    requireDistinctChoices: choiceBonuses.length > 1,
  };
}

export function buildRaceAbilityBonuses(
  abilityScoreIncrease: string | undefined,
  selectedChoices: AbilityKey[] = []
): AbilityBonuses {
  const parsed = parseAbilityScoreIncrease(abilityScoreIncrease);
  const bonuses: AbilityBonuses = { ...parsed.fixedBonuses };

  const seenChoices = new Set<AbilityKey>();
  parsed.choiceBonuses.forEach((amount, index) => {
    const chosen = selectedChoices[index];
    if (!chosen) {
      return;
    }
    if (parsed.requireDistinctChoices && seenChoices.has(chosen)) {
      return;
    }
    bonuses[chosen] = (bonuses[chosen] || 0) + amount;
    seenChoices.add(chosen);
  });

  return bonuses;
}

export function applyAbilityBonuses(
  base: DnD5eAbilityScores,
  bonuses?: AbilityBonuses
): DnD5eAbilityScores {
  return {
    strength: Math.min(20, base.strength + (bonuses?.strength || 0)),
    dexterity: Math.min(20, base.dexterity + (bonuses?.dexterity || 0)),
    constitution: Math.min(20, base.constitution + (bonuses?.constitution || 0)),
    intelligence: Math.min(20, base.intelligence + (bonuses?.intelligence || 0)),
    wisdom: Math.min(20, base.wisdom + (bonuses?.wisdom || 0)),
    charisma: Math.min(20, base.charisma + (bonuses?.charisma || 0)),
  };
}

export function hasRequiredRaceAbilityChoices(
  abilityScoreIncrease: string | undefined,
  selectedChoices: AbilityKey[] = []
): boolean {
  const parsed = parseAbilityScoreIncrease(abilityScoreIncrease);
  if (parsed.choiceBonuses.length === 0) {
    return true;
  }
  if (selectedChoices.length < parsed.choiceBonuses.length) {
    return false;
  }
  if (parsed.requireDistinctChoices && selectedChoices[0] === selectedChoices[1]) {
    return false;
  }
  return true;
}

