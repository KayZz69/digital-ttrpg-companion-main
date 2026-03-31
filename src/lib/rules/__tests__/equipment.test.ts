/**
 * @fileoverview Tests for equipment rules (equipment.ts).
 *
 * Validates class equipment packages, background equipment grants,
 * and registry interface shape.
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

  it("all 12 core classes have entries", () => {
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

  it("package items have itemName string property", () => {
    const reg = getEquipmentRegistry();
    const classes = [
      "barbarian", "bard", "cleric", "druid", "fighter",
      "monk", "paladin", "ranger", "rogue", "sorcerer",
      "warlock", "wizard",
    ];
    for (const cls of classes) {
      const rule = reg.getEquipmentRules(cls);
      expect(rule).not.toBeNull();
      for (const pkg of rule!.packages) {
        for (const itm of pkg.items) {
          expect(typeof itm.itemName).toBe("string");
          expect(itm.itemName.length).toBeGreaterThan(0);
          if (itm.quantity != null) {
            expect(typeof itm.quantity).toBe("number");
            expect(itm.quantity).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("fighter has two packages", () => {
    const reg = getEquipmentRegistry();
    const fighter = reg.getEquipmentRules("fighter");
    expect(fighter).not.toBeNull();
    expect(fighter!.packages.length).toBe(2);
    expect(fighter!.packages[0].id).toBe("fighter-a");
    expect(fighter!.packages[1].id).toBe("fighter-b");
  });
});

describe("getBackgroundEquipmentRules", () => {
  it("returns a registry object with getBackgroundEquipmentRules", () => {
    const reg = getEquipmentRegistry();
    expect(typeof reg.getBackgroundEquipmentRules).toBe("function");
  });

  it("returns rule for known background", () => {
    const reg = getEquipmentRegistry();
    const acolyte = reg.getBackgroundEquipmentRules("acolyte");
    expect(acolyte).not.toBeNull();
    expect(acolyte!.backgroundId).toBe("acolyte");
    expect(acolyte!.items.length).toBeGreaterThan(0);
    expect(acolyte!.startingGoldGP).toBe(8);
  });

  it("returns null for unknown background", () => {
    const reg = getEquipmentRegistry();
    expect(reg.getBackgroundEquipmentRules("unknown")).toBeNull();
    expect(reg.getBackgroundEquipmentRules("")).toBeNull();
    expect(reg.getBackgroundEquipmentRules("pirate")).toBeNull();
  });

  it("all 13 backgrounds have entries", () => {
    const reg = getEquipmentRegistry();
    const backgrounds = [
      "acolyte", "charlatan", "criminal", "entertainer", "folk-hero",
      "guild-artisan", "hermit", "noble", "outlander", "sage",
      "sailor", "soldier", "urchin",
    ];
    expect(backgrounds.length).toBe(13);
    for (const bg of backgrounds) {
      const rule = reg.getBackgroundEquipmentRules(bg);
      expect(rule, `${bg} should have an entry`).not.toBeNull();
      expect(rule!.items.length).toBeGreaterThan(0);
      expect(rule!.startingGoldGP).toBeGreaterThanOrEqual(0);
    }
  });

  it("case-insensitive lookup", () => {
    const reg = getEquipmentRegistry();
    expect(reg.getBackgroundEquipmentRules("Acolyte")).not.toBeNull();
    expect(reg.getBackgroundEquipmentRules("NOBLE")).not.toBeNull();
    expect(reg.getBackgroundEquipmentRules("Folk-Hero")).not.toBeNull();
  });

  it("each background rule has items and startingGoldGP", () => {
    const reg = getEquipmentRegistry();
    const backgrounds = [
      "acolyte", "charlatan", "criminal", "entertainer", "folk-hero",
      "guild-artisan", "hermit", "noble", "outlander", "sage",
      "sailor", "soldier", "urchin",
    ];
    for (const bg of backgrounds) {
      const rule = reg.getBackgroundEquipmentRules(bg);
      expect(rule).not.toBeNull();
      expect(Array.isArray(rule!.items)).toBe(true);
      expect(rule!.items.length).toBeGreaterThan(0);
      expect(typeof rule!.startingGoldGP).toBe("number");
      expect(rule!.startingGoldGP).toBeGreaterThan(0);
      for (const itm of rule!.items) {
        expect(typeof itm.itemName).toBe("string");
        expect(itm.itemName.length).toBeGreaterThan(0);
      }
    }
  });
});
