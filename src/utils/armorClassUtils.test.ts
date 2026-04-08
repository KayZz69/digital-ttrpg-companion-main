import { describe, it, expect } from "vitest";
import { parseArmorClass, computeArmorClass } from "./armorClassUtils";
import { InventoryItem, DnD5eAbilityScores } from "@/types/character";

const DEFAULT_SCORES: DnD5eAbilityScores = {
  strength: 10,
  dexterity: 14, // +2 mod
  constitution: 12,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: crypto.randomUUID(),
    name: "Test Item",
    quantity: 1,
    weight: 0,
    equipped: false,
    ...overrides,
  };
}

describe("parseArmorClass", () => {
  it("parses flat AC (heavy armor)", () => {
    expect(parseArmorClass("16")).toEqual({ base: 16, addsDex: false, maxDex: null });
  });

  it("parses light armor (full Dex)", () => {
    expect(parseArmorClass("11 + Dex modifier")).toEqual({ base: 11, addsDex: true, maxDex: null });
  });

  it("parses medium armor (capped Dex)", () => {
    expect(parseArmorClass("14 + Dex modifier (max 2)")).toEqual({ base: 14, addsDex: true, maxDex: 2 });
  });

  it("parses studded leather", () => {
    expect(parseArmorClass("12 + Dex modifier")).toEqual({ base: 12, addsDex: true, maxDex: null });
  });

  it("returns unarmored fallback for unrecognized strings", () => {
    expect(parseArmorClass("unknown")).toEqual({ base: 10, addsDex: true, maxDex: null });
  });
});

describe("computeArmorClass", () => {
  it("returns 10 + Dex for unarmored character", () => {
    const result = computeArmorClass([], DEFAULT_SCORES);
    expect(result.total).toBe(12); // 10 + 2
    expect(result.baseSource).toBe("Unarmored");
    expect(result.dexBonus).toBe(2);
    expect(result.shieldBonus).toBe(0);
  });

  it("computes AC for chain mail (flat 16, no Dex)", () => {
    const inventory = [
      makeItem({
        name: "Chain Mail",
        equipped: true,
        equipmentSlot: "armor",
        sourceItemId: "chain-mail",
        sourceItemType: "armor",
      }),
    ];
    const result = computeArmorClass(inventory, DEFAULT_SCORES);
    expect(result.total).toBe(16);
    expect(result.dexBonus).toBe(0);
    expect(result.stealthDisadvantage).toBe(true);
  });

  it("computes AC for leather armor (11 + full Dex)", () => {
    const inventory = [
      makeItem({
        name: "Leather Armor",
        equipped: true,
        equipmentSlot: "armor",
        sourceItemId: "leather-armor",
        sourceItemType: "armor",
      }),
    ];
    const result = computeArmorClass(inventory, DEFAULT_SCORES);
    expect(result.total).toBe(13); // 11 + 2
    expect(result.dexBonus).toBe(2);
  });

  it("caps Dex for medium armor (breastplate, max 2)", () => {
    const highDex: DnD5eAbilityScores = { ...DEFAULT_SCORES, dexterity: 20 }; // +5 mod
    const inventory = [
      makeItem({
        name: "Breastplate",
        equipped: true,
        equipmentSlot: "armor",
        sourceItemId: "breastplate",
        sourceItemType: "armor",
      }),
    ];
    const result = computeArmorClass(inventory, highDex);
    expect(result.total).toBe(16); // 14 + 2 (capped)
    expect(result.dexBonus).toBe(2);
  });

  it("adds +2 for shield by name", () => {
    const inventory = [
      makeItem({
        name: "Shield",
        equipped: true,
        equipmentSlot: "offHand",
      }),
    ];
    const result = computeArmorClass(inventory, DEFAULT_SCORES);
    expect(result.total).toBe(14); // 10 + 2 (Dex) + 2 (shield)
    expect(result.shieldBonus).toBe(2);
  });

  it("combines armor and shield", () => {
    const inventory = [
      makeItem({
        name: "Chain Mail",
        equipped: true,
        equipmentSlot: "armor",
        sourceItemId: "chain-mail",
        sourceItemType: "armor",
      }),
      makeItem({
        name: "Shield",
        equipped: true,
        equipmentSlot: "offHand",
      }),
    ];
    const result = computeArmorClass(inventory, DEFAULT_SCORES);
    expect(result.total).toBe(18); // 16 + 2
  });

  it("ignores unequipped armor", () => {
    const inventory = [
      makeItem({
        name: "Plate Armor",
        equipped: false,
        equipmentSlot: "armor",
        sourceItemId: "plate-armor",
        sourceItemType: "armor",
      }),
    ];
    const result = computeArmorClass(inventory, DEFAULT_SCORES);
    expect(result.total).toBe(12); // unarmored
  });

  it("handles negative Dex modifier", () => {
    const lowDex: DnD5eAbilityScores = { ...DEFAULT_SCORES, dexterity: 8 }; // -1 mod
    const result = computeArmorClass([], lowDex);
    expect(result.total).toBe(9); // 10 + (-1)
  });
});
