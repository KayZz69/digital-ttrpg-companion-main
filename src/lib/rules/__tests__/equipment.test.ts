/**
 * @fileoverview Tests for equipment rules stub (equipment.ts).
 *
 * Full implementation deferred to CCR-007.
 * These tests validate stub behavior and interface shape.
 */

import { describe, expect, it } from "vitest";
import { getEquipmentRegistry } from "../equipment";

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
  });

  it("all 12 core classes have stub entries", () => {
    const reg = getEquipmentRegistry();
    const classes = [
      "barbarian", "bard", "cleric", "druid", "fighter",
      "monk", "paladin", "ranger", "rogue", "sorcerer",
      "warlock", "wizard",
    ];
    for (const cls of classes) {
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
