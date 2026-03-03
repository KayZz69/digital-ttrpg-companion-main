/**
 * @fileoverview Unit tests for conditionUtils — condition effect lookups,
 * modifier resolution, exhaustion, speed, and display helpers.
 */

import { describe, it, expect } from "vitest";
import {
    CONDITION_EFFECTS,
    getConditionEffect,
    getConditionEffects,
    getExhaustionEffects,
    getNetAttackModifier,
    getNetDefenseModifier,
    getNetSaveModifier,
    isIncapacitated,
    getSpeedMultiplier,
    getConditionBadgeClasses,
    getEffectSummary,
} from "./conditionUtils";
import type { ConditionType } from "@/types/combat";

// ─── Individual Condition Lookups ───

describe("getConditionEffect", () => {
    it("returns the effect for blinded", () => {
        const e = getConditionEffect("blinded");
        expect(e.attackRolls).toBe("disadvantage");
        expect(e.attacksAgainst).toBe("advantage");
    });

    it("returns the effect for charmed (no combat modifiers)", () => {
        const e = getConditionEffect("charmed");
        expect(e.attackRolls).toBeUndefined();
        expect(e.attacksAgainst).toBeUndefined();
    });

    it("returns the effect for deafened (no combat modifiers)", () => {
        const e = getConditionEffect("deafened");
        expect(e.attackRolls).toBeUndefined();
        expect(e.incapacitated).toBeUndefined();
    });

    it("returns the effect for frightened", () => {
        const e = getConditionEffect("frightened");
        expect(e.attackRolls).toBe("disadvantage");
        expect(e.checkModifiers).toBe("all_disadvantage");
    });

    it("returns the effect for grappled (speed 0)", () => {
        const e = getConditionEffect("grappled");
        expect(e.speedZero).toBe(true);
        expect(e.attackRolls).toBeUndefined();
    });

    it("returns the effect for incapacitated", () => {
        const e = getConditionEffect("incapacitated");
        expect(e.incapacitated).toBe(true);
    });

    it("returns the effect for invisible", () => {
        const e = getConditionEffect("invisible");
        expect(e.attackRolls).toBe("advantage");
        expect(e.attacksAgainst).toBe("disadvantage");
    });

    it("returns the effect for paralyzed", () => {
        const e = getConditionEffect("paralyzed");
        expect(e.incapacitated).toBe(true);
        expect(e.autoFailSaves).toContain("strength");
        expect(e.autoFailSaves).toContain("dexterity");
        expect(e.attacksAgainst).toBe("advantage");
        expect(e.speedZero).toBe(true);
    });

    it("returns the effect for petrified", () => {
        const e = getConditionEffect("petrified");
        expect(e.incapacitated).toBe(true);
        expect(e.autoFailSaves).toContain("strength");
        expect(e.autoFailSaves).toContain("dexterity");
        expect(e.speedZero).toBe(true);
    });

    it("returns the effect for poisoned", () => {
        const e = getConditionEffect("poisoned");
        expect(e.attackRolls).toBe("disadvantage");
        expect(e.checkModifiers).toBe("all_disadvantage");
    });

    it("returns the effect for prone", () => {
        const e = getConditionEffect("prone");
        expect(e.attackRolls).toBe("disadvantage");
        expect(e.attacksAgainst).toBe("advantage");
        expect(e.speedMultiplier).toBe(0.5);
    });

    it("returns the effect for restrained", () => {
        const e = getConditionEffect("restrained");
        expect(e.attackRolls).toBe("disadvantage");
        expect(e.attacksAgainst).toBe("advantage");
        expect(e.speedZero).toBe(true);
        expect(e.saveModifiers).toEqual({ dexterity: "disadvantage" });
    });

    it("returns the effect for stunned", () => {
        const e = getConditionEffect("stunned");
        expect(e.incapacitated).toBe(true);
        expect(e.autoFailSaves).toContain("strength");
        expect(e.attacksAgainst).toBe("advantage");
    });

    it("returns the effect for unconscious", () => {
        const e = getConditionEffect("unconscious");
        expect(e.incapacitated).toBe(true);
        expect(e.autoFailSaves).toContain("strength");
        expect(e.autoFailSaves).toContain("dexterity");
        expect(e.speedZero).toBe(true);
    });
});

describe("getConditionEffects (bulk)", () => {
    it("returns effects for multiple conditions", () => {
        const effects = getConditionEffects(["blinded", "poisoned"]);
        expect(effects).toHaveLength(2);
        expect(effects[0].description).toContain("Can't see");
        expect(effects[1].description).toContain("Disadvantage on attack rolls");
    });

    it("returns empty array for no conditions", () => {
        expect(getConditionEffects([])).toEqual([]);
    });
});

describe("CONDITION_EFFECTS completeness", () => {
    const allConditions: ConditionType[] = [
        "blinded", "charmed", "deafened", "frightened", "grappled",
        "incapacitated", "invisible", "paralyzed", "petrified",
        "poisoned", "prone", "restrained", "stunned", "unconscious",
    ];

    it("has entries for all 14 SRD conditions", () => {
        for (const c of allConditions) {
            expect(CONDITION_EFFECTS[c]).toBeDefined();
            expect(CONDITION_EFFECTS[c].description).toBeTruthy();
        }
    });
});

// ─── Exhaustion ───

describe("getExhaustionEffects", () => {
    it("returns null for level 0 (no exhaustion)", () => {
        expect(getExhaustionEffects(0)).toBeNull();
    });

    it("level 1: disadvantage on ability checks", () => {
        const e = getExhaustionEffects(1);
        expect(e).not.toBeNull();
        expect(e!.checkDisadvantage).toBe(true);
        expect(e!.speedHalved).toBeUndefined();
    });

    it("level 2: speed halved + check disadvantage", () => {
        const e = getExhaustionEffects(2);
        expect(e!.checkDisadvantage).toBe(true);
        expect(e!.speedHalved).toBe(true);
    });

    it("level 3: adds attack and save disadvantage", () => {
        const e = getExhaustionEffects(3);
        expect(e!.attackAndSaveDisadvantage).toBe(true);
        expect(e!.speedHalved).toBe(true);
    });

    it("level 4: HP max halved", () => {
        const e = getExhaustionEffects(4);
        expect(e!.hpMaxHalved).toBe(true);
        expect(e!.attackAndSaveDisadvantage).toBe(true);
    });

    it("level 5: speed 0 (replaces halved)", () => {
        const e = getExhaustionEffects(5);
        expect(e!.speedZero).toBe(true);
        expect(e!.hpMaxHalved).toBe(true);
    });

    it("level 6: death", () => {
        const e = getExhaustionEffects(6);
        expect(e!.death).toBe(true);
    });

    it("returns null for out-of-range levels", () => {
        expect(getExhaustionEffects(7)).toBeNull();
        expect(getExhaustionEffects(-1)).toBeNull();
    });
});

// ─── Net Attack Modifier ───

describe("getNetAttackModifier", () => {
    it("returns 'normal' with no conditions", () => {
        expect(getNetAttackModifier([])).toBe("normal");
    });

    it("returns 'disadvantage' for poisoned", () => {
        expect(getNetAttackModifier(["poisoned"])).toBe("disadvantage");
    });

    it("returns 'advantage' for invisible", () => {
        expect(getNetAttackModifier(["invisible"])).toBe("advantage");
    });

    it("blinded + invisible cancel to 'normal'", () => {
        expect(getNetAttackModifier(["blinded", "invisible"])).toBe("normal");
    });

    it("multiple disadvantage sources don't change result", () => {
        expect(getNetAttackModifier(["blinded", "poisoned", "prone"])).toBe("disadvantage");
    });

    it("exhaustion level 3 adds disadvantage", () => {
        expect(getNetAttackModifier([], 3)).toBe("disadvantage");
    });

    it("invisible + exhaustion 3 cancel to normal", () => {
        expect(getNetAttackModifier(["invisible"], 3)).toBe("normal");
    });
});

// ─── Net Defense Modifier ───

describe("getNetDefenseModifier", () => {
    it("returns 'normal' with no conditions", () => {
        expect(getNetDefenseModifier([])).toBe("normal");
    });

    it("returns 'advantage' for stunned (attacks against have advantage)", () => {
        expect(getNetDefenseModifier(["stunned"])).toBe("advantage");
    });

    it("returns 'disadvantage' for invisible", () => {
        expect(getNetDefenseModifier(["invisible"])).toBe("disadvantage");
    });

    it("blinded + invisible cancel out", () => {
        expect(getNetDefenseModifier(["blinded", "invisible"])).toBe("normal");
    });
});

// ─── Net Save Modifier ───

describe("getNetSaveModifier", () => {
    it("returns 'normal' with no conditions", () => {
        expect(getNetSaveModifier([], "dexterity")).toBe("normal");
    });

    it("returns 'auto-fail' for paralyzed creature's DEX save", () => {
        expect(getNetSaveModifier(["paralyzed"], "dexterity")).toBe("auto-fail");
    });

    it("returns 'auto-fail' for paralyzed creature's STR save", () => {
        expect(getNetSaveModifier(["paralyzed"], "strength")).toBe("auto-fail");
    });

    it("returns 'normal' for paralyzed creature's WIS save", () => {
        expect(getNetSaveModifier(["paralyzed"], "wisdom")).toBe("normal");
    });

    it("returns 'disadvantage' for restrained creature's DEX save", () => {
        expect(getNetSaveModifier(["restrained"], "dexterity")).toBe("disadvantage");
    });

    it("returns 'normal' for restrained creature's STR save", () => {
        expect(getNetSaveModifier(["restrained"], "strength")).toBe("normal");
    });

    it("auto-fail trumps disadvantage", () => {
        // stunned auto-fails STR/DEX; restrained gives disadvantage on DEX
        expect(getNetSaveModifier(["stunned", "restrained"], "dexterity")).toBe("auto-fail");
    });

    it("exhaustion 3 gives disadvantage on saves", () => {
        expect(getNetSaveModifier([], "wisdom", 3)).toBe("disadvantage");
    });

    it("auto-fail still wins over exhaustion", () => {
        expect(getNetSaveModifier(["paralyzed"], "dexterity", 3)).toBe("auto-fail");
    });
});

// ─── isIncapacitated ───

describe("isIncapacitated", () => {
    it("returns false for no conditions", () => {
        expect(isIncapacitated([])).toBe(false);
    });

    it("returns true for incapacitated", () => {
        expect(isIncapacitated(["incapacitated"])).toBe(true);
    });

    it("returns true for paralyzed", () => {
        expect(isIncapacitated(["paralyzed"])).toBe(true);
    });

    it("returns true for petrified", () => {
        expect(isIncapacitated(["petrified"])).toBe(true);
    });

    it("returns true for stunned", () => {
        expect(isIncapacitated(["stunned"])).toBe(true);
    });

    it("returns true for unconscious", () => {
        expect(isIncapacitated(["unconscious"])).toBe(true);
    });

    it("returns false for poisoned (not incapacitating)", () => {
        expect(isIncapacitated(["poisoned"])).toBe(false);
    });

    it("returns false for blinded (not incapacitating)", () => {
        expect(isIncapacitated(["blinded"])).toBe(false);
    });

    it("returns true if at least one condition incapacitates", () => {
        expect(isIncapacitated(["poisoned", "stunned"])).toBe(true);
    });
});

// ─── Speed Multiplier ───

describe("getSpeedMultiplier", () => {
    it("returns 1 with no conditions and no exhaustion", () => {
        expect(getSpeedMultiplier([])).toBe(1);
    });

    it("returns 0 for grappled", () => {
        expect(getSpeedMultiplier(["grappled"])).toBe(0);
    });

    it("returns 0 for restrained", () => {
        expect(getSpeedMultiplier(["restrained"])).toBe(0);
    });

    it("returns 0 for paralyzed", () => {
        expect(getSpeedMultiplier(["paralyzed"])).toBe(0);
    });

    it("returns 0 for unconscious", () => {
        expect(getSpeedMultiplier(["unconscious"])).toBe(0);
    });

    it("returns 0.5 for prone (crawling)", () => {
        expect(getSpeedMultiplier(["prone"])).toBe(0.5);
    });

    it("returns 0.5 for exhaustion level 2", () => {
        expect(getSpeedMultiplier([], 2)).toBe(0.5);
    });

    it("prone + exhaustion 2 stack multiplicatively = 0.25", () => {
        expect(getSpeedMultiplier(["prone"], 2)).toBe(0.25);
    });

    it("returns 0 for exhaustion level 5", () => {
        expect(getSpeedMultiplier([], 5)).toBe(0);
    });

    it("speedZero conditions take priority over multiplier conditions", () => {
        // grappled (speed 0) + prone (0.5) → 0
        expect(getSpeedMultiplier(["grappled", "prone"])).toBe(0);
    });

    it("returns 1 for conditions without speed effects", () => {
        expect(getSpeedMultiplier(["poisoned", "blinded"])).toBe(1);
    });
});

// ─── Badge Classes ───

describe("getConditionBadgeClasses", () => {
    it("returns red classes for severe conditions", () => {
        const result = getConditionBadgeClasses("paralyzed");
        expect(result).toContain("red");
    });

    it("returns yellow classes for movement conditions", () => {
        const result = getConditionBadgeClasses("grappled");
        expect(result).toContain("yellow");
    });

    it("returns green classes for beneficial conditions", () => {
        const result = getConditionBadgeClasses("invisible");
        expect(result).toContain("green");
    });

    it("returns purple classes for perception conditions", () => {
        const result = getConditionBadgeClasses("blinded");
        expect(result).toContain("purple");
    });

    it("returns amber classes for mild conditions", () => {
        const result = getConditionBadgeClasses("poisoned");
        expect(result).toContain("amber");
    });
});

// ─── Effect Summary ───

describe("getEffectSummary", () => {
    it("returns empty array for no conditions", () => {
        expect(getEffectSummary([])).toEqual([]);
    });

    it("includes attack disadvantage for poisoned", () => {
        const summary = getEffectSummary(["poisoned"]);
        expect(summary.some((s) => s.label.includes("Attacks") && s.label.includes("Disadv"))).toBe(true);
    });

    it("includes speed 0 for grappled", () => {
        const summary = getEffectSummary(["grappled"]);
        expect(summary.some((s) => s.label.includes("Speed: 0"))).toBe(true);
    });

    it("includes incapacitated for stunned", () => {
        const summary = getEffectSummary(["stunned"]);
        expect(summary.some((s) => s.label.includes("Incapacitated"))).toBe(true);
    });

    it("includes auto-fail saves for paralyzed", () => {
        const summary = getEffectSummary(["paralyzed"]);
        expect(summary.some((s) => s.label.includes("Auto-fail"))).toBe(true);
    });
});
