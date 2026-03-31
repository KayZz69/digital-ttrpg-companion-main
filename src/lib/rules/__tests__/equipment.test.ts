/**
 * @fileoverview Tests for equipment rules (equipment.ts).
 *
 * Covers CCR-008: Equipment Rules Foundation.
 * Tests registry, packageItems, helper functions, and budget validation.
 */

import { describe, expect, it } from "vitest";
import {
  getEquipmentRegistry,
  getEquipmentPackageItems,
  resolvePackageToInventory,
  validateEquipmentBudget,
} from "../equipment";
import { weapons, armor, adventuringGear } from "@/data/equipment";

const ALL_CLASSES = [
  "barbarian", "bard", "cleric", "druid", "fighter",
  "monk", "paladin", "ranger", "rogue", "sorcerer",
  "warlock", "wizard",
];

/** Build a set of all known equipment IDs from the compendium. */
function getAllEquipmentIds(): Set<string> {
  const ids = new Set<string>();
  for (const w of weapons) ids.add(w.id);
  for (const a of armor) ids.add(a.id);
  for (const g of adventuringGear) ids.add(g.id);
  return ids;
}

describe("getEquipmentRegistry", () => {
  it("returns a registry object with getEquipmentRules", () => {
    const reg = getEquipmentRegistry();
    expect(typeof reg.getEquipmentRules).toBe("function");
  });

  it("returns EquipmentRule for known classes", () => {
    const reg = getEquipmentRegistry();
    const wizard = reg.getEquipmentRules("wizard");
    expect(wizard).not.toBeNull();
    expect(wizard!.classId).toBe("wizard");
    expect(wizard!.packages.length).toBeGreaterThan(0);
    expect(wizard!.startingGoldGP).toBeGreaterThan(0);
  });

  it("returns null for unknown class", () => {
    const reg = getEquipmentRegistry();
    expect(reg.getEquipmentRules("artificer")).toBeNull();
    expect(reg.getEquipmentRules("")).toBeNull();
    expect(reg.getEquipmentRules("unknown")).toBeNull();
  });

  it("case-insensitive lookup", () => {
    const reg = getEquipmentRegistry();
    expect(reg.getEquipmentRules("Wizard")).not.toBeNull();
    expect(reg.getEquipmentRules("FIGHTER")).not.toBeNull();
    expect(reg.getEquipmentRules("  Barbarian  ")).not.toBeNull();
  });

  it("all 12 core classes have equipment rules", () => {
    const reg = getEquipmentRegistry();
    for (const cls of ALL_CLASSES) {
      const rule = reg.getEquipmentRules(cls);
      expect(rule, `${cls} should have an entry`).not.toBeNull();
      expect(rule!.packages.length).toBeGreaterThan(0);
    }
  });

  it("packages have required fields", () => {
    const reg = getEquipmentRegistry();
    const fighter = reg.getEquipmentRules("fighter");
    expect(fighter).not.toBeNull();
    for (const pkg of fighter!.packages) {
      expect(typeof pkg.id).toBe("string");
      expect(typeof pkg.label).toBe("string");
      expect(Array.isArray(pkg.items)).toBe(true);
      expect(pkg.items.length).toBeGreaterThan(0);
    }
  });
});

describe("packageItems — structured item references", () => {
  it("all 12 classes have packageItems in every package", () => {
    const reg = getEquipmentRegistry();
    for (const cls of ALL_CLASSES) {
      const rule = reg.getEquipmentRules(cls)!;
      for (const pkg of rule.packages) {
        expect(
          pkg.packageItems.length,
          `${cls} ${pkg.id} should have packageItems`
        ).toBeGreaterThan(0);
      }
    }
  });

  it("every packageItem has an itemId, itemName, and quantity >= 1", () => {
    const reg = getEquipmentRegistry();
    for (const cls of ALL_CLASSES) {
      const rule = reg.getEquipmentRules(cls)!;
      for (const pkg of rule.packages) {
        for (const item of pkg.packageItems) {
          expect(item.itemId, `${cls}/${pkg.id} itemId`).toBeTruthy();
          expect(item.itemName, `${cls}/${pkg.id} itemName`).toBeTruthy();
          expect(item.quantity, `${cls}/${pkg.id} ${item.itemName} quantity`).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("all packageItem IDs reference valid compendium equipment", () => {
    const validIds = getAllEquipmentIds();
    const reg = getEquipmentRegistry();
    for (const cls of ALL_CLASSES) {
      const rule = reg.getEquipmentRules(cls)!;
      for (const pkg of rule.packages) {
        for (const item of pkg.packageItems) {
          expect(
            validIds.has(item.itemId),
            `${cls}/${pkg.id}: "${item.itemId}" (${item.itemName}) is not a valid compendium ID`
          ).toBe(true);
        }
      }
    }
  });

  it("fighter has two packages", () => {
    const reg = getEquipmentRegistry();
    const fighter = reg.getEquipmentRules("fighter")!;
    expect(fighter.packages.length).toBe(2);
    expect(fighter.packages[0].id).toBe("fighter-a");
    expect(fighter.packages[1].id).toBe("fighter-b");
  });
});

describe("getEquipmentPackageItems", () => {
  it("returns items for a valid class and package", () => {
    const items = getEquipmentPackageItems("barbarian", "barbarian-a");
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].itemId).toBe("greataxe");
  });

  it("returns empty array for unknown class", () => {
    expect(getEquipmentPackageItems("artificer", "artificer-a")).toEqual([]);
  });

  it("returns empty array for unknown package", () => {
    expect(getEquipmentPackageItems("barbarian", "nonexistent")).toEqual([]);
  });

  it("is case-insensitive on classId", () => {
    const items = getEquipmentPackageItems("WIZARD", "wizard-a");
    expect(items.length).toBeGreaterThan(0);
  });
});

describe("resolvePackageToInventory", () => {
  it("returns a mutable copy of package items", () => {
    const items = resolvePackageToInventory("rogue", "rogue-a");
    expect(items.length).toBeGreaterThan(0);
    // Verify it's a mutable array (can push)
    const originalLength = items.length;
    items.push({ itemId: "test", itemName: "Test", quantity: 1 });
    expect(items.length).toBe(originalLength + 1);
  });

  it("returns empty array for unknown class", () => {
    expect(resolvePackageToInventory("unknown", "unknown-a")).toEqual([]);
  });

  it("matches getEquipmentPackageItems content", () => {
    const fromHelper = getEquipmentPackageItems("monk", "monk-a");
    const fromResolver = resolvePackageToInventory("monk", "monk-a");
    expect(fromResolver).toEqual([...fromHelper]);
  });
});

describe("validateEquipmentBudget", () => {
  it("returns true when cost is within budget", () => {
    expect(validateEquipmentBudget("barbarian", 50)).toBe(true);
    expect(validateEquipmentBudget("barbarian", 75)).toBe(true);
  });

  it("returns false when cost exceeds budget", () => {
    expect(validateEquipmentBudget("barbarian", 76)).toBe(false);
    expect(validateEquipmentBudget("monk", 13)).toBe(false);
  });

  it("returns false for unknown class", () => {
    expect(validateEquipmentBudget("artificer", 10)).toBe(false);
  });

  it("validates specific class budgets", () => {
    const budgets: Record<string, number> = {
      barbarian: 75,
      bard: 125,
      cleric: 125,
      druid: 50,
      fighter: 175,
      monk: 12,
      paladin: 175,
      ranger: 125,
      rogue: 100,
      sorcerer: 75,
      warlock: 100,
      wizard: 75,
    };
    for (const [cls, budget] of Object.entries(budgets)) {
      expect(validateEquipmentBudget(cls, budget), `${cls} at exact budget`).toBe(true);
      expect(validateEquipmentBudget(cls, budget + 1), `${cls} over budget`).toBe(false);
    }
  });

  it("is case-insensitive on classId", () => {
    expect(validateEquipmentBudget("FIGHTER", 100)).toBe(true);
    expect(validateEquipmentBudget("  wizard  ", 75)).toBe(true);
  });
});
