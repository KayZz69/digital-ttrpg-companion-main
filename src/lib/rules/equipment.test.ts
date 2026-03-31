import { describe, it, expect, beforeEach } from "vitest";
import { getEquipmentRegistry } from "./equipment";
import type { EquipmentRegistry } from "./equipment";

const ALL_CLASS_IDS = [
  "barbarian", "bard", "cleric", "druid", "fighter", "monk",
  "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard",
];

const ALL_BACKGROUND_IDS = [
  "acolyte", "charlatan", "criminal", "entertainer", "folk-hero",
  "guild-artisan", "hermit", "noble", "outlander", "sage",
  "sailor", "soldier", "urchin",
];

describe("equipment rules", () => {
  let registry: EquipmentRegistry;

  beforeEach(() => {
    registry = getEquipmentRegistry();
  });

  // -----------------------------------------------------------------------
  // Class equipment packages
  // -----------------------------------------------------------------------

  describe("class equipment packages", () => {
    it.each(ALL_CLASS_IDS)("%s has at least one valid equipment package", (classId) => {
      const rule = registry.getEquipmentRules(classId);
      expect(rule).not.toBeNull();
      expect(rule!.packages.length).toBeGreaterThanOrEqual(1);
    });

    it.each(ALL_CLASS_IDS)("%s classId matches the lookup key", (classId) => {
      const rule = registry.getEquipmentRules(classId);
      expect(rule!.classId).toBe(classId);
    });

    it.each(ALL_CLASS_IDS)("%s packages have non-empty items arrays", (classId) => {
      const rule = registry.getEquipmentRules(classId);
      for (const pkg of rule!.packages) {
        expect(pkg.items.length).toBeGreaterThan(0);
        expect(pkg.items.every((item) => typeof item === "string" && item.length > 0)).toBe(true);
      }
    });

    it.each(ALL_CLASS_IDS)("%s packages have unique IDs", (classId) => {
      const rule = registry.getEquipmentRules(classId);
      const ids = rule!.packages.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(ALL_CLASS_IDS)("%s packages have non-empty labels", (classId) => {
      const rule = registry.getEquipmentRules(classId);
      for (const pkg of rule!.packages) {
        expect(pkg.label.length).toBeGreaterThan(0);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Gold-buy budgets
  // -----------------------------------------------------------------------

  describe("gold-buy budgets", () => {
    it.each(ALL_CLASS_IDS)("%s has a positive integer gold budget", (classId) => {
      const rule = registry.getEquipmentRules(classId);
      expect(rule!.startingGoldGP).toBeGreaterThan(0);
      expect(Number.isInteger(rule!.startingGoldGP)).toBe(true);
    });

    it("gold budgets are within reasonable range (1-500 gp)", () => {
      for (const classId of ALL_CLASS_IDS) {
        const rule = registry.getEquipmentRules(classId);
        expect(rule!.startingGoldGP).toBeGreaterThanOrEqual(1);
        expect(rule!.startingGoldGP).toBeLessThanOrEqual(500);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Background equipment
  // -----------------------------------------------------------------------

  describe("background equipment", () => {
    it.each(ALL_BACKGROUND_IDS)("%s has valid background equipment", (bgId) => {
      const bg = registry.getBackgroundEquipment(bgId);
      expect(bg).not.toBeNull();
      expect(bg!.backgroundId).toBe(bgId);
      expect(bg!.items.length).toBeGreaterThan(0);
      expect(bg!.label.length).toBeGreaterThan(0);
    });

    it.each(ALL_BACKGROUND_IDS)("%s items are non-empty strings", (bgId) => {
      const bg = registry.getBackgroundEquipment(bgId);
      for (const item of bg!.items) {
        expect(typeof item).toBe("string");
        expect(item.length).toBeGreaterThan(0);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Registry interface
  // -----------------------------------------------------------------------

  describe("registry interface", () => {
    it("returns null for unknown class IDs", () => {
      expect(registry.getEquipmentRules("unknown")).toBeNull();
      expect(registry.getEquipmentRules("")).toBeNull();
    });

    it("returns null for unknown background IDs", () => {
      expect(registry.getBackgroundEquipment("unknown")).toBeNull();
      expect(registry.getBackgroundEquipment("")).toBeNull();
    });

    it("handles case-insensitive and trimmed class lookups", () => {
      const rule = registry.getEquipmentRules("  Wizard  ");
      expect(rule).not.toBeNull();
      expect(rule!.classId).toBe("wizard");
    });

    it("handles case-insensitive and trimmed background lookups", () => {
      const bg = registry.getBackgroundEquipment("  Acolyte  ");
      expect(bg).not.toBeNull();
      expect(bg!.backgroundId).toBe("acolyte");
    });

    it("getSupportedClassIds returns all 12 classes", () => {
      const ids = registry.getSupportedClassIds();
      expect(ids).toHaveLength(12);
      for (const classId of ALL_CLASS_IDS) {
        expect(ids).toContain(classId);
      }
    });

    it("getSupportedBackgroundIds returns all 13 backgrounds", () => {
      const ids = registry.getSupportedBackgroundIds();
      expect(ids).toHaveLength(13);
      for (const bgId of ALL_BACKGROUND_IDS) {
        expect(ids).toContain(bgId);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Singleton export
  // -----------------------------------------------------------------------

  describe("singleton export", () => {
    it("equipment singleton works identically to factory result", async () => {
      const { equipment } = await import("./equipment");
      for (const classId of ALL_CLASS_IDS) {
        const fromSingleton = equipment.getEquipmentRules(classId);
        const fromFactory = registry.getEquipmentRules(classId);
        expect(fromSingleton).toEqual(fromFactory);
      }
    });
  });
});
