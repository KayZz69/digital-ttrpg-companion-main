import { describe, it, expect } from "vitest";
import {
  getRaceRegistry,
  getRaceTraits,
  getRaceLanguages,
  getRaceSpeed,
} from "../races";

describe("getRaceRegistry", () => {
  const registry = getRaceRegistry();

  it("returns rules for all 10 races", () => {
    const all = registry.getAllRaceRules();
    expect(all).toHaveLength(10);
  });

  it("returns a RaceRule for each known race id", () => {
    const ids = [
      "aasimar", "dragonborn", "dwarf", "elf", "gnome",
      "goliath", "halfling", "human", "orc", "tiefling",
    ];
    for (const id of ids) {
      const rule = registry.getRaceRules(id);
      expect(rule).not.toBeNull();
      expect(rule!.id).toBe(id);
    }
  });

  it("supports case-insensitive lookup", () => {
    expect(registry.getRaceRules("ELF")).not.toBeNull();
    expect(registry.getRaceRules("Elf")).not.toBeNull();
    expect(registry.getRaceRules("elf")).not.toBeNull();
    expect(registry.getRaceRules(" Elf ")).not.toBeNull();
  });

  it("returns null for unknown race", () => {
    expect(registry.getRaceRules("centaur")).toBeNull();
    expect(registry.getRaceRules("")).toBeNull();
  });

  it("every race has a traits array", () => {
    const all = registry.getAllRaceRules();
    for (const rule of all) {
      expect(Array.isArray(rule.traits)).toBe(true);
    }
  });

  it("every race has required fields", () => {
    const all = registry.getAllRaceRules();
    for (const rule of all) {
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(["Small", "Medium"]).toContain(rule.size);
      expect(rule.speed).toBeGreaterThan(0);
      expect(rule.creatureType).toBeTruthy();
    }
  });

  it("traits contain name and description", () => {
    const dwarf = registry.getRaceRules("dwarf");
    expect(dwarf).not.toBeNull();
    expect(dwarf!.traits.length).toBeGreaterThan(0);
    for (const trait of dwarf!.traits) {
      expect(trait.name).toBeTruthy();
      expect(trait.description).toBeTruthy();
    }
  });

  it("returns a fresh array from getAllRaceRules each call", () => {
    const a = registry.getAllRaceRules();
    const b = registry.getAllRaceRules();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe("getRaceTraits", () => {
  it("returns traits for a valid race", () => {
    const traits = getRaceTraits("dwarf");
    expect(traits.length).toBeGreaterThan(0);
    expect(traits[0].name).toBeTruthy();
  });

  it("returns empty array for unknown race", () => {
    expect(getRaceTraits("unknown")).toEqual([]);
  });

  it("returns empty array for human (no traits)", () => {
    expect(getRaceTraits("human")).toEqual([]);
  });
});

describe("getRaceLanguages", () => {
  it("returns languages for a race with languages", () => {
    const langs = getRaceLanguages("elf");
    expect(langs).toContain("Common");
    expect(langs).toContain("Elvish");
  });

  it("returns empty array for a race without languages", () => {
    const langs = getRaceLanguages("goliath");
    expect(langs).toEqual([]);
  });

  it("returns empty array for unknown race", () => {
    expect(getRaceLanguages("centaur")).toEqual([]);
  });
});

describe("getRaceSpeed", () => {
  it("returns correct speed for dwarf (25)", () => {
    expect(getRaceSpeed("dwarf")).toBe(25);
  });

  it("returns correct speed for elf (30)", () => {
    expect(getRaceSpeed("elf")).toBe(30);
  });

  it("returns default 30 for unknown race", () => {
    expect(getRaceSpeed("unknown")).toBe(30);
  });
});
