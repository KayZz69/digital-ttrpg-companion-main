import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  rollD20,
  parseDiceExpression,
  calcAttackBonus,
  rollAttack,
  checkHit,
  rollDamage,
  calcSavingThrowBonus,
  rollSavingThrow,
  calcSpellSaveDC,
  calcSpellAttackBonus,
  calcConcentrationDC,
  resolveWeaponStats,
} from "./combatMathUtils";
import type { DnD5eAbilityScores, InventoryItem } from "@/types/character";
import type { Weapon } from "@/data/types";

// Mock dependencies
vi.mock("@/utils/diceUtils", () => ({ rollDice: vi.fn() }));
vi.mock("@/data/equipment", () => ({ getWeaponById: vi.fn() }));

import { rollDice } from "@/utils/diceUtils";
import { getWeaponById } from "@/data/equipment";

const mockRollDice = vi.mocked(rollDice);
const mockGetWeaponById = vi.mocked(getWeaponById);

const baseAbilityScores: DnD5eAbilityScores = {
  strength: 16,     // +3
  dexterity: 14,    // +2
  constitution: 14, // +2
  intelligence: 10, // +0
  wisdom: 12,       // +1
  charisma: 8,      // -1
};

//  rollD20 

describe("rollD20", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the die roll in normal mode", () => {
    mockRollDice.mockReturnValueOnce(14);
    const result = rollD20();
    expect(result.roll).toBe(14);
    expect(result.hadAdvantage).toBe(false);
    expect(result.hadDisadvantage).toBe(false);
    expect(result.allRolls).toBeUndefined();
  });

  it("advantage: takes the higher of two rolls", () => {
    mockRollDice.mockReturnValueOnce(8).mockReturnValueOnce(17);
    const result = rollD20(true, false);
    expect(result.roll).toBe(17);
    expect(result.hadAdvantage).toBe(true);
    expect(result.allRolls).toEqual([8, 17]);
  });

  it("disadvantage: takes the lower of two rolls", () => {
    mockRollDice.mockReturnValueOnce(15).mockReturnValueOnce(4);
    const result = rollD20(false, true);
    expect(result.roll).toBe(4);
    expect(result.hadDisadvantage).toBe(true);
    expect(result.allRolls).toEqual([15, 4]);
  });

  it("advantage + disadvantage cancel out (normal roll)", () => {
    mockRollDice.mockReturnValueOnce(11);
    const result = rollD20(true, true);
    expect(result.roll).toBe(11);
    expect(result.hadAdvantage).toBe(false);
    expect(result.hadDisadvantage).toBe(false);
    expect(result.allRolls).toBeUndefined();
  });
});

//  parseDiceExpression 

describe("parseDiceExpression", () => {
  it("parses '1d8' correctly", () => {
    expect(parseDiceExpression("1d8")).toEqual({ count: 1, sides: 8, bonus: 0 });
  });

  it("parses '2d6+3' correctly", () => {
    expect(parseDiceExpression("2d6+3")).toEqual({ count: 2, sides: 6, bonus: 3 });
  });

  it("parses '1d4-1' correctly", () => {
    expect(parseDiceExpression("1d4-1")).toEqual({ count: 1, sides: 4, bonus: -1 });
  });

  it("parses flat number '1' (blowgun) as bonus only", () => {
    expect(parseDiceExpression("1")).toEqual({ count: 0, sides: 0, bonus: 1 });
  });

  it("returns all zeros for invalid expression", () => {
    expect(parseDiceExpression("invalid")).toEqual({ count: 0, sides: 0, bonus: 0 });
  });

  it("is case-insensitive and trims spaces", () => {
    expect(parseDiceExpression("  2D6  ")).toEqual({ count: 2, sides: 6, bonus: 0 });
  });
});

//  calcAttackBonus 

describe("calcAttackBonus", () => {
  it("sums ability mod + proficiency bonus", () => {
    expect(calcAttackBonus(3, 3)).toBe(6);
  });

  it("includes magic weapon bonus", () => {
    expect(calcAttackBonus(3, 3, 2)).toBe(8);
  });

  it("handles negative ability modifier", () => {
    expect(calcAttackBonus(-1, 2)).toBe(1);
  });
});

//  rollAttack 

describe("rollAttack", () => {
  beforeEach(() => vi.clearAllMocks());

  it("detects a critical hit on natural 20", () => {
    mockRollDice.mockReturnValueOnce(20);
    const result = rollAttack(5);
    expect(result.isCrit).toBe(true);
    expect(result.isFumble).toBe(false);
    expect(result.total).toBe(25);
  });

  it("detects a fumble on natural 1", () => {
    mockRollDice.mockReturnValueOnce(1);
    const result = rollAttack(5);
    expect(result.isCrit).toBe(false);
    expect(result.isFumble).toBe(true);
    expect(result.total).toBe(6);
  });

  it("returns correct total for normal roll", () => {
    mockRollDice.mockReturnValueOnce(12);
    const result = rollAttack(4);
    expect(result.total).toBe(16);
    expect(result.isCrit).toBe(false);
    expect(result.isFumble).toBe(false);
  });
});

//  checkHit 

describe("checkHit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("natural 20 always hits regardless of AC", () => {
    mockRollDice.mockReturnValueOnce(20);
    const result = rollAttack(0);
    expect(checkHit(result, 30)).toBe(true);
  });

  it("natural 1 always misses regardless of bonus", () => {
    mockRollDice.mockReturnValueOnce(1);
    const result = rollAttack(20);
    expect(checkHit(result, 1)).toBe(false);
  });

  it("hits when total >= AC", () => {
    mockRollDice.mockReturnValueOnce(14);
    const result = rollAttack(5); // total 19
    expect(checkHit(result, 19)).toBe(true);
    expect(checkHit(result, 20)).toBe(false);
  });
});

//  rollDamage 

describe("rollDamage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rolls normal damage and applies bonus", () => {
    mockRollDice.mockReturnValueOnce(5);
    const result = rollDamage("1d8", 3, false, "slashing");
    expect(result.dice).toEqual([5]);
    expect(result.critDice).toEqual([]);
    expect(result.bonus).toBe(3);
    expect(result.total).toBe(8);
    expect(result.damageType).toBe("slashing");
  });

  it("doubles the dice on a critical hit (but not the bonus)", () => {
    mockRollDice
      .mockReturnValueOnce(6)  // normal die
      .mockReturnValueOnce(4); // crit die
    const result = rollDamage("1d8", 3, true);
    expect(result.dice).toEqual([6]);
    expect(result.critDice).toEqual([4]);
    expect(result.bonus).toBe(3);
    expect(result.total).toBe(13); // 6 + 4 + 3
  });

  it("handles multiple dice on crit", () => {
    // 2d6 becomes 4d6 on crit
    mockRollDice
      .mockReturnValueOnce(3).mockReturnValueOnce(5)  // normal 2d6
      .mockReturnValueOnce(2).mockReturnValueOnce(6); // crit 2d6
    const result = rollDamage("2d6", 0, true);
    expect(result.dice).toEqual([3, 5]);
    expect(result.critDice).toEqual([2, 6]);
    expect(result.total).toBe(16); // 3+5+2+6
  });

  it("handles flat damage expression (no dice)", () => {
    const result = rollDamage("1", 0, false);
    expect(result.dice).toEqual([]);
    expect(result.total).toBe(1);
  });

  it("applies diceExpression bonus from parsed expression", () => {
    mockRollDice.mockReturnValueOnce(4);
    // "1d6+2" has +2 baked in, plus an additional +1 bonus arg
    const result = rollDamage("1d6+2", 1, false);
    expect(result.bonus).toBe(3); // 2 from expression + 1 from arg
    expect(result.total).toBe(7); // 4 + 3
  });
});

//  calcSavingThrowBonus 

describe("calcSavingThrowBonus", () => {
  it("adds proficiency when proficient", () => {
    expect(calcSavingThrowBonus(2, 3, true)).toBe(5);
  });

  it("excludes proficiency when not proficient", () => {
    expect(calcSavingThrowBonus(2, 3, false)).toBe(2);
  });

  it("handles negative ability modifier", () => {
    expect(calcSavingThrowBonus(-1, 3, true)).toBe(2);
    expect(calcSavingThrowBonus(-1, 3, false)).toBe(-1);
  });
});

//  rollSavingThrow 

describe("rollSavingThrow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes when total >= DC", () => {
    mockRollDice.mockReturnValueOnce(12);
    const result = rollSavingThrow(15, 3, 2, true); // 12+3+2=17 >= 15
    expect(result.success).toBe(true);
    expect(result.total).toBe(17);
  });

  it("fails when total < DC", () => {
    mockRollDice.mockReturnValueOnce(5);
    const result = rollSavingThrow(15, 2, 2, false); // 5+2=7 < 15
    expect(result.success).toBe(false);
    expect(result.total).toBe(7);
  });

  it("passes exactly at DC (equal counts as success)", () => {
    mockRollDice.mockReturnValueOnce(10);
    const result = rollSavingThrow(15, 3, 2, true); // 10+5=15 >= 15
    expect(result.success).toBe(true);
  });
});

//  calcSpellSaveDC 

describe("calcSpellSaveDC", () => {
  it("equals 8 + proficiency + spellcasting mod", () => {
    expect(calcSpellSaveDC(3, 4)).toBe(15);
  });

  it("level 1 wizard with INT 16 (+3) and prof +2 gives DC 13", () => {
    expect(calcSpellSaveDC(2, 3)).toBe(13);
  });
});

//  calcSpellAttackBonus 

describe("calcSpellAttackBonus", () => {
  it("equals proficiency + spellcasting mod", () => {
    expect(calcSpellAttackBonus(3, 4)).toBe(7);
  });
});

//  calcConcentrationDC 

describe("calcConcentrationDC", () => {
  it("minimum DC is 10 even for tiny damage", () => {
    expect(calcConcentrationDC(1)).toBe(10);
    expect(calcConcentrationDC(0)).toBe(10);
    expect(calcConcentrationDC(18)).toBe(10);
  });

  it("DC is half the damage for 20+ damage", () => {
    expect(calcConcentrationDC(20)).toBe(10);
    expect(calcConcentrationDC(22)).toBe(11);
    expect(calcConcentrationDC(30)).toBe(15);
  });

  it("floors the result (rounds down)", () => {
    expect(calcConcentrationDC(21)).toBe(10); // floor(21/2)=10
    expect(calcConcentrationDC(23)).toBe(11); // floor(23/2)=11
  });
});

//  resolveWeaponStats 

describe("resolveWeaponStats", () => {
  beforeEach(() => vi.clearAllMocks());

  const longsword: Partial<Weapon> = {
    id: "longsword",
    name: "Longsword",
    damage: { dice: "1d8", type: "slashing" },
    properties: ["Versatile (1d10)"],
    weaponType: "melee",
    category: "martial",
  };

  const dagger: Partial<Weapon> = {
    id: "dagger",
    name: "Dagger",
    damage: { dice: "1d4", type: "piercing" },
    properties: ["Finesse", "Light", "Thrown"],
    weaponType: "melee",
    category: "simple",
  };

  const shortbow: Partial<Weapon> = {
    id: "shortbow",
    name: "Shortbow",
    damage: { dice: "1d6", type: "piercing" },
    properties: ["Ammunition", "Two-handed"],
    weaponType: "ranged",
    category: "simple",
  };

  const longswordItem: InventoryItem = {
    id: "item-1",
    name: "Longsword",
    quantity: 1,
    weight: 3,
    equipped: true,
    equipmentSlot: "mainHand",
    sourceItemId: "longsword",
    sourceItemType: "weapon",
  };

  it("resolves STR-based melee weapon with proficiency", () => {
    mockGetWeaponById.mockReturnValue(longsword as Weapon);
    const result = resolveWeaponStats(longswordItem, baseAbilityScores, 3, ["Martial weapons"]);
    expect(result).not.toBeNull();
    expect(result!.damageDice).toBe("1d8");
    expect(result!.damageType).toBe("slashing");
    // STR +3, prof +3 = attack +6
    expect(result!.attackBonus).toBe(6);
    // damage bonus = STR +3 (no prof)
    expect(result!.damageBonus).toBe(3);
    expect(result!.isFinesse).toBe(false);
    expect(result!.isRanged).toBe(false);
  });

  it("resolves finesse weapon using best of STR/DEX", () => {
    mockGetWeaponById.mockReturnValue(dagger as Weapon);
    const daggerItem = { ...longswordItem, sourceItemId: "dagger", name: "Dagger" };
    // STR +3, DEX +2 -> finesse uses STR (+3) since it's higher
    const result = resolveWeaponStats(daggerItem, baseAbilityScores, 2, ["Simple weapons"]);
    expect(result!.isFinesse).toBe(true);
    expect(result!.attackBonus).toBe(5); // STR +3 + prof +2
    expect(result!.damageBonus).toBe(3); // STR +3
  });

  it("resolves finesse weapon using DEX when DEX is higher", () => {
    mockGetWeaponById.mockReturnValue(dagger as Weapon);
    const daggerItem = { ...longswordItem, sourceItemId: "dagger", name: "Dagger" };
    const dexFocusedScores = { ...baseAbilityScores, strength: 8, dexterity: 18 }; // DEX +4
    const result = resolveWeaponStats(daggerItem, dexFocusedScores, 2, ["Simple weapons"]);
    expect(result!.attackBonus).toBe(6); // DEX +4 + prof +2
    expect(result!.damageBonus).toBe(4); // DEX +4
  });

  it("resolves ranged weapon using DEX", () => {
    mockGetWeaponById.mockReturnValue(shortbow as Weapon);
    const bowItem = { ...longswordItem, sourceItemId: "shortbow", name: "Shortbow" };
    const result = resolveWeaponStats(bowItem, baseAbilityScores, 2, ["Simple weapons"]);
    expect(result!.isRanged).toBe(true);
    expect(result!.attackBonus).toBe(4); // DEX +2 + prof +2
    expect(result!.damageBonus).toBe(2); // DEX +2
  });

  it("excludes proficiency bonus when not proficient", () => {
    mockGetWeaponById.mockReturnValue(longsword as Weapon);
    const result = resolveWeaponStats(longswordItem, baseAbilityScores, 3, ["Simple weapons"]);
    // Longsword is martial; "Simple weapons" doesn't grant proficiency with it
    expect(result!.attackBonus).toBe(3); // STR +3 only, no prof
  });

  it("includes magic bonus in both attack and damage", () => {
    mockGetWeaponById.mockReturnValue(longsword as Weapon);
    const magicSword = { ...longswordItem, weaponAttackBonus: 2 };
    const result = resolveWeaponStats(magicSword, baseAbilityScores, 3, ["Martial weapons"]);
    expect(result!.attackBonus).toBe(8); // STR +3 + prof +3 + magic +2
    expect(result!.damageBonus).toBe(5); // STR +3 + magic +2
  });

  it("returns null when no damage dice available", () => {
    mockGetWeaponById.mockReturnValue(undefined);
    const noWeaponItem: InventoryItem = {
      id: "item-x",
      name: "Shield",
      quantity: 1,
      weight: 6,
      equipped: true,
      equipmentSlot: "offHand",
    };
    const result = resolveWeaponStats(noWeaponItem, baseAbilityScores, 2, []);
    expect(result).toBeNull();
  });

  it("uses inline damageDice when no sourceItemId", () => {
    const customItem: InventoryItem = {
      id: "item-custom",
      name: "Custom Sword",
      quantity: 1,
      weight: 3,
      equipped: true,
      equipmentSlot: "mainHand",
      damageDice: "1d10",
      damageType: "slashing",
    };
    const result = resolveWeaponStats(customItem, baseAbilityScores, 2, ["Custom Sword"]);
    expect(result!.damageDice).toBe("1d10");
    expect(result!.damageType).toBe("slashing");
    expect(result!.attackBonus).toBe(5); // STR +3 + prof +2 (name match)
  });
});
