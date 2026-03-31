/**
 * @fileoverview Tests for background rules registry (backgrounds.ts).
 *
 * Coverage targets:
 * - getBackgroundRules(): lookup by ID, case-insensitive, null for unknown
 * - getAllBackgroundRules(): returns all 13 backgrounds
 * - getBackgroundSkills(): skill arrays for all backgrounds
 * - getBackgroundToolProficiencies(): tool arrays where expected
 * - getBackgroundRegistry(): registry shape and delegation
 */

import { describe, expect, it } from "vitest";
import {
  getBackgroundRegistry,
  getBackgroundRules,
  getBackgroundSkills,
  getBackgroundToolProficiencies,
  getAllBackgroundRules,
} from "../backgrounds";

// ---------------------------------------------------------------------------
// getAllBackgroundRules
// ---------------------------------------------------------------------------

describe("getAllBackgroundRules", () => {
  it("returns all 13 backgrounds", () => {
    const all = getAllBackgroundRules();
    expect(all).toHaveLength(13);
  });

  it("every background has at least one skill", () => {
    const all = getAllBackgroundRules();
    for (const bg of all) {
      expect(bg.skills.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every background has an id, name, and description", () => {
    const all = getAllBackgroundRules();
    for (const bg of all) {
      expect(bg.id).toBeTruthy();
      expect(bg.name).toBeTruthy();
      expect(bg.description).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// getBackgroundRules
// ---------------------------------------------------------------------------

describe("getBackgroundRules", () => {
  it("returns rules for a known background", () => {
    const acolyte = getBackgroundRules("acolyte");
    expect(acolyte).not.toBeNull();
    expect(acolyte!.name).toBe("Acolyte");
    expect(acolyte!.skills).toEqual(["Insight", "Religion"]);
  });

  it("performs case-insensitive lookup", () => {
    const upper = getBackgroundRules("ACOLYTE");
    const mixed = getBackgroundRules("Acolyte");
    const lower = getBackgroundRules("acolyte");
    expect(upper).toEqual(lower);
    expect(mixed).toEqual(lower);
  });

  it("trims whitespace from the ID", () => {
    const result = getBackgroundRules("  criminal  ");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("criminal");
  });

  it("returns null for an unknown background", () => {
    expect(getBackgroundRules("unknown")).toBeNull();
    expect(getBackgroundRules("")).toBeNull();
  });

  it("returns tool proficiencies for backgrounds that have them", () => {
    const criminal = getBackgroundRules("criminal");
    expect(criminal!.toolProficiencies).toEqual(["Thieves' Tools"]);

    const sailor = getBackgroundRules("sailor");
    expect(sailor!.toolProficiencies).toEqual(["Navigator's Tools", "Vehicles (Water)"]);
  });

  it("returns empty tool proficiencies for Sage (no tools)", () => {
    const sage = getBackgroundRules("sage");
    expect(sage!.toolProficiencies).toEqual([]);
  });

  it("returns languages for backgrounds that have them", () => {
    const acolyte = getBackgroundRules("acolyte");
    expect(acolyte!.languages).toEqual(["Celestial", "Choose one"]);

    const sage = getBackgroundRules("sage");
    expect(sage!.languages).toEqual(["Choose two"]);
  });

  it("returns empty languages for backgrounds without language grants", () => {
    const criminal = getBackgroundRules("criminal");
    expect(criminal!.languages).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getBackgroundSkills
// ---------------------------------------------------------------------------

describe("getBackgroundSkills", () => {
  it("returns skills for a known background", () => {
    expect(getBackgroundSkills("folk-hero")).toEqual(["Animal Handling", "Survival"]);
  });

  it("returns empty array for unknown background", () => {
    expect(getBackgroundSkills("nonexistent")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getBackgroundToolProficiencies
// ---------------------------------------------------------------------------

describe("getBackgroundToolProficiencies", () => {
  it("returns tools for a background with tool proficiencies", () => {
    expect(getBackgroundToolProficiencies("charlatan")).toEqual(["Disguise Kit", "Forgery Kit"]);
  });

  it("returns empty array for a background without tools", () => {
    expect(getBackgroundToolProficiencies("sage")).toEqual([]);
  });

  it("returns empty array for unknown background", () => {
    expect(getBackgroundToolProficiencies("nonexistent")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getBackgroundRegistry (factory)
// ---------------------------------------------------------------------------

describe("getBackgroundRegistry", () => {
  it("returns an object with all registry methods", () => {
    const registry = getBackgroundRegistry();
    expect(typeof registry.getBackgroundRules).toBe("function");
    expect(typeof registry.getAllBackgroundRules).toBe("function");
    expect(typeof registry.getBackgroundSkills).toBe("function");
    expect(typeof registry.getBackgroundToolProficiencies).toBe("function");
  });

  it("delegates to the same underlying functions", () => {
    const registry = getBackgroundRegistry();
    const direct = getBackgroundRules("urchin");
    const viaRegistry = registry.getBackgroundRules("urchin");
    expect(viaRegistry).toEqual(direct);
  });
});
