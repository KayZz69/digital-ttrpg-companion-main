import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  XP_THRESHOLDS,
  getLevelFromXP,
  getXPForLevel,
  getXPProgress,
  canLevelUp,
  getAverageHPGain,
  rollHPGain,
  getHitDiceMax,
  getASILevelsFromFeatures,
  isASILevel,
  getNewFeaturesAtLevel,
  getNewMaxHP,
  applyASI,
  MAX_LEVEL,
} from "./progressionUtils";
import type { ClassFeature } from "@/data/types";

// --- XP_THRESHOLDS ---
describe("XP_THRESHOLDS", () => {
  it("has 20 entries", () => {
    expect(XP_THRESHOLDS.length).toBe(20);
  });

  it("starts at 0 for level 1", () => {
    expect(XP_THRESHOLDS[0]).toBe(0);
  });

  it("ends at 355000 for level 20", () => {
    expect(XP_THRESHOLDS[19]).toBe(355000);
  });

  it("is strictly increasing", () => {
    for (let i = 1; i < XP_THRESHOLDS.length; i++) {
      expect(XP_THRESHOLDS[i]).toBeGreaterThan(XP_THRESHOLDS[i - 1]);
    }
  });
});

// --- getLevelFromXP ---
describe("getLevelFromXP", () => {
  it("returns level 1 at 0 XP", () => {
    expect(getLevelFromXP(0)).toBe(1);
  });

  it("returns level 1 just below level 2 threshold", () => {
    expect(getLevelFromXP(299)).toBe(1);
  });

  it("returns level 2 at exactly 300 XP", () => {
    expect(getLevelFromXP(300)).toBe(2);
  });

  it("returns level 5 at 6500 XP", () => {
    expect(getLevelFromXP(6500)).toBe(5);
  });

  it("returns level 20 at max XP", () => {
    expect(getLevelFromXP(355000)).toBe(20);
  });

  it("caps at level 20 for huge XP values", () => {
    expect(getLevelFromXP(999999999)).toBe(20);
  });

  it("handles negative XP as level 1", () => {
    expect(getLevelFromXP(-100)).toBe(1);
  });
});

// --- getXPForLevel ---
describe("getXPForLevel", () => {
  it("returns 0 for level 1", () => {
    expect(getXPForLevel(1)).toBe(0);
  });

  it("returns 300 for level 2", () => {
    expect(getXPForLevel(2)).toBe(300);
  });

  it("returns 355000 for level 20", () => {
    expect(getXPForLevel(20)).toBe(355000);
  });

  it("clamps to level 1 for input 0", () => {
    expect(getXPForLevel(0)).toBe(0);
  });

  it("clamps to level 20 for input 25", () => {
    expect(getXPForLevel(25)).toBe(355000);
  });
});

// --- getXPProgress ---
describe("getXPProgress", () => {
  it("returns level 1 at 0 XP with 0% progress", () => {
    const p = getXPProgress(0);
    expect(p.level).toBe(1);
    expect(p.percentage).toBe(0);
    expect(p.xpToNext).toBe(300);
  });

  it("returns 50% progress mid-level", () => {
    const p = getXPProgress(150); // halfway to level 2
    expect(p.level).toBe(1);
    expect(p.percentage).toBe(50);
  });

  it("returns 100% at level 20 cap", () => {
    const p = getXPProgress(355000);
    expect(p.level).toBe(20);
    expect(p.percentage).toBe(100);
    expect(p.xpToNext).toBe(0);
  });
});

// --- canLevelUp ---
describe("canLevelUp", () => {
  it("returns true when XP meets next level threshold", () => {
    expect(canLevelUp(1, 300)).toBe(true);
  });

  it("returns false when XP is below next level threshold", () => {
    expect(canLevelUp(1, 299)).toBe(false);
  });

  it("returns false at level 20 regardless of XP", () => {
    expect(canLevelUp(20, 999999)).toBe(false);
  });

  it("returns true at level 19 with enough XP", () => {
    expect(canLevelUp(19, 355000)).toBe(true);
  });
});

// --- getAverageHPGain ---
describe("getAverageHPGain", () => {
  it("returns 5 for d8 with +0 CON", () => {
    expect(getAverageHPGain(8, 0)).toBe(5); // floor(8/2)+1 = 5
  });

  it("returns 7 for d10 with +1 CON (Fighter)", () => {
    expect(getAverageHPGain(10, 1)).toBe(7); // floor(10/2)+1+1 = 7
  });

  it("returns 1 minimum even with negative CON", () => {
    expect(getAverageHPGain(6, -5)).toBe(1); // floor(6/2)+1-5 = -1 → 1
  });

  it("handles d12 (Barbarian) with +2 CON", () => {
    expect(getAverageHPGain(12, 2)).toBe(9); // floor(12/2)+1+2 = 9
  });
});

// --- rollHPGain ---
describe("rollHPGain", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random");
  });

  it("returns at least 1 even with very negative CON", () => {
    vi.mocked(Math.random).mockReturnValue(0); // roll = 1
    expect(rollHPGain(6, -10)).toBe(1);
  });

  it("returns max hit die + CON on max roll", () => {
    vi.mocked(Math.random).mockReturnValue(0.9999); // roll = hitDie
    expect(rollHPGain(8, 2)).toBe(10); // 8 + 2
  });

  it("returns minimum roll + CON correctly", () => {
    vi.mocked(Math.random).mockReturnValue(0); // roll = 1
    expect(rollHPGain(8, 3)).toBe(4); // 1 + 3
  });
});

// --- getHitDiceMax ---
describe("getHitDiceMax", () => {
  it("returns 1 for level 1", () => {
    expect(getHitDiceMax(1)).toBe(1);
  });

  it("returns level value", () => {
    expect(getHitDiceMax(5)).toBe(5);
    expect(getHitDiceMax(20)).toBe(20);
  });
});

// --- getASILevelsFromFeatures ---
describe("getASILevelsFromFeatures", () => {
  const features: ClassFeature[] = [
    { level: 1, name: "Spellcasting", description: "" },
    { level: 4, name: "Ability Score Improvement", description: "" },
    { level: 8, name: "Ability Score Improvement", description: "" },
    { level: 8, name: "Something Else", description: "" },
    { level: 12, name: "Ability Score Improvement", description: "" },
  ];

  it("returns sorted ASI levels", () => {
    expect(getASILevelsFromFeatures(features)).toEqual([4, 8, 12]);
  });

  it("deduplicates ASI at the same level", () => {
    const duped: ClassFeature[] = [
      { level: 4, name: "Ability Score Improvement", description: "" },
      { level: 4, name: "Ability Score Improvement", description: "" },
    ];
    expect(getASILevelsFromFeatures(duped)).toEqual([4]);
  });

  it("returns empty array with no ASI features", () => {
    expect(getASILevelsFromFeatures([{ level: 1, name: "Rage", description: "" }])).toEqual([]);
  });
});

// --- isASILevel ---
describe("isASILevel", () => {
  const features: ClassFeature[] = [
    { level: 4, name: "Ability Score Improvement", description: "" },
    { level: 8, name: "Ability Score Improvement", description: "" },
  ];

  it("returns true at an ASI level", () => {
    expect(isASILevel(features, 4)).toBe(true);
  });

  it("returns false at a non-ASI level", () => {
    expect(isASILevel(features, 5)).toBe(false);
  });
});

// --- getNewFeaturesAtLevel ---
describe("getNewFeaturesAtLevel", () => {
  const features: ClassFeature[] = [
    { level: 1, name: "Rage", description: "" },
    { level: 1, name: "Unarmored Defense", description: "" },
    { level: 2, name: "Danger Sense", description: "" },
  ];

  it("returns all features at level 1", () => {
    expect(getNewFeaturesAtLevel(features, 1)).toHaveLength(2);
  });

  it("returns features at level 2", () => {
    expect(getNewFeaturesAtLevel(features, 2)).toHaveLength(1);
    expect(getNewFeaturesAtLevel(features, 2)[0].name).toBe("Danger Sense");
  });

  it("returns empty array for level with no features", () => {
    expect(getNewFeaturesAtLevel(features, 5)).toHaveLength(0);
  });
});

// --- applyASI ---
describe("applyASI", () => {
  const baseScores = {
    strength: 14,
    dexterity: 16,
    constitution: 12,
    intelligence: 10,
    wisdom: 8,
    charisma: 10,
  };

  it("adds 2 to single ability in single mode", () => {
    const result = applyASI(baseScores, { mode: "single", ability: "strength" });
    expect(result.strength).toBe(16);
    expect(result.dexterity).toBe(16); // unchanged
  });

  it("caps single mode at 20", () => {
    const capped = { ...baseScores, strength: 19 };
    const result = applyASI(capped, { mode: "single", ability: "strength" });
    expect(result.strength).toBe(20);
  });

  it("does not exceed 20 when starting at 20", () => {
    const maxed = { ...baseScores, dexterity: 20 };
    const result = applyASI(maxed, { mode: "single", ability: "dexterity" });
    expect(result.dexterity).toBe(20);
  });

  it("adds 1 to each ability in split mode", () => {
    const result = applyASI(baseScores, {
      mode: "split",
      ability1: "strength",
      ability2: "dexterity",
    });
    expect(result.strength).toBe(15);
    expect(result.dexterity).toBe(17);
    expect(result.constitution).toBe(12); // unchanged
  });

  it("caps split mode at 20", () => {
    const nearMax = { ...baseScores, strength: 20, dexterity: 20 };
    const result = applyASI(nearMax, {
      mode: "split",
      ability1: "strength",
      ability2: "dexterity",
    });
    expect(result.strength).toBe(20);
    expect(result.dexterity).toBe(20);
  });

  it("does not mutate original scores", () => {
    const original = { ...baseScores };
    applyASI(baseScores, { mode: "single", ability: "strength" });
    expect(baseScores.strength).toBe(original.strength);
  });
});
