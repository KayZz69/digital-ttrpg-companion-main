/**
 * @fileoverview Pure data + lookup functions defining the mechanical effects
 * of all 14 SRD D&D 5e conditions and the 6-level exhaustion system (2014 PHB).
 *
 * These functions are stateless and side-effect-free — they map condition types
 * to their rule effects and resolve conflicts when multiple conditions stack.
 */

import type { DnD5eAbilityScores } from "@/types/character";
import type { ConditionType } from "@/types/combat";

// ─── Interfaces ───

/** Mechanical effects of a single condition per the SRD. */
export interface ConditionEffect {
    /** Human-readable rules summary */
    description: string;
    /** Attack rolls made BY the affected creature */
    attackRolls?: "advantage" | "disadvantage";
    /** Attack rolls made AGAINST the affected creature */
    attacksAgainst?: "advantage" | "disadvantage";
    /** Ability saves affected (e.g., { dexterity: "disadvantage" }) */
    saveModifiers?: Partial<Record<keyof DnD5eAbilityScores, "advantage" | "disadvantage">>;
    /** Ability checks affected — "all_disadvantage" means every ability check */
    checkModifiers?: Partial<Record<keyof DnD5eAbilityScores, "advantage" | "disadvantage">> | "all_disadvantage";
    /** Whether the creature can take actions */
    incapacitated?: boolean;
    /** Abilities whose saving throws the creature auto-fails */
    autoFailSaves?: (keyof DnD5eAbilityScores)[];
    /** Whether the creature's speed is set to 0 */
    speedZero?: boolean;
    /** Speed multiplier (0.5 for prone crawling) */
    speedMultiplier?: number;
}

/** Cumulative effects at a specific exhaustion level (2014 PHB, 6-level model). */
export interface ExhaustionEffect {
    /** Exhaustion level (1–6) */
    level: number;
    /** Human-readable cumulative description */
    description: string;
    /** Whether the creature has disadvantage on ability checks */
    checkDisadvantage?: boolean;
    /** Speed halved */
    speedHalved?: boolean;
    /** Disadvantage on attack rolls and saving throws */
    attackAndSaveDisadvantage?: boolean;
    /** HP maximum halved */
    hpMaxHalved?: boolean;
    /** Speed reduced to 0 */
    speedZero?: boolean;
    /** Instant death */
    death?: boolean;
}

// ─── Condition Effects Map ───

/**
 * Lookup map for all 14 SRD conditions and their mechanical effects.
 * Each entry encodes the rules-relevant properties that the combat system
 * can query to auto-apply advantage/disadvantage, auto-fail saves, etc.
 */
export const CONDITION_EFFECTS: Record<ConditionType, ConditionEffect> = {
    blinded: {
        description:
            "Can't see. Auto-fails checks requiring sight. Attack rolls have disadvantage. Attacks against have advantage.",
        attackRolls: "disadvantage",
        attacksAgainst: "advantage",
    },
    charmed: {
        description: "Can't attack the charmer. Charmer has advantage on social checks against the creature.",
    },
    deafened: {
        description: "Can't hear. Auto-fails checks requiring hearing.",
    },
    frightened: {
        description:
            "Disadvantage on ability checks and attack rolls while the source of fear is in line of sight.",
        attackRolls: "disadvantage",
        checkModifiers: "all_disadvantage",
    },
    grappled: {
        description: "Speed becomes 0. The condition ends if the grappler is incapacitated or moved apart.",
        speedZero: true,
    },
    incapacitated: {
        description: "Can't take actions or reactions.",
        incapacitated: true,
    },
    invisible: {
        description:
            "Impossible to see without magic or special sense. Attacks have advantage. Attacks against have disadvantage.",
        attackRolls: "advantage",
        attacksAgainst: "disadvantage",
    },
    paralyzed: {
        description:
            "Incapacitated, can't move or speak. Auto-fails STR and DEX saves. Attacks against have advantage. Hits within 5 ft are automatic critical hits.",
        incapacitated: true,
        autoFailSaves: ["strength", "dexterity"],
        attacksAgainst: "advantage",
        speedZero: true,
    },
    petrified: {
        description:
            "Transformed to inanimate substance. Incapacitated, can't move or speak. Auto-fails STR and DEX saves. Attacks against have advantage. Resistance to all damage. Immune to poison and disease.",
        incapacitated: true,
        autoFailSaves: ["strength", "dexterity"],
        attacksAgainst: "advantage",
        speedZero: true,
    },
    poisoned: {
        description: "Disadvantage on attack rolls and ability checks.",
        attackRolls: "disadvantage",
        checkModifiers: "all_disadvantage",
    },
    prone: {
        description:
            "Disadvantage on attack rolls. Melee attacks within 5 ft have advantage against; ranged attacks have disadvantage. Crawling costs extra movement.",
        attackRolls: "disadvantage",
        attacksAgainst: "advantage", // simplified: melee within 5 ft
        speedMultiplier: 0.5,
    },
    restrained: {
        description:
            "Speed becomes 0. Attack rolls have disadvantage. Attacks against have advantage. Disadvantage on DEX saves.",
        attackRolls: "disadvantage",
        attacksAgainst: "advantage",
        saveModifiers: { dexterity: "disadvantage" },
        speedZero: true,
    },
    stunned: {
        description:
            "Incapacitated, can't move, can speak only falteringly. Auto-fails STR and DEX saves. Attacks against have advantage.",
        incapacitated: true,
        autoFailSaves: ["strength", "dexterity"],
        attacksAgainst: "advantage",
    },
    unconscious: {
        description:
            "Incapacitated, can't move or speak, unaware of surroundings. Drops held items, falls prone. Auto-fails STR and DEX saves. Attacks against have advantage. Hits within 5 ft are automatic critical hits.",
        incapacitated: true,
        autoFailSaves: ["strength", "dexterity"],
        attacksAgainst: "advantage",
        speedZero: true,
    },
};

// ─── Exhaustion Effects (2014 PHB, 6-level model) ───

/**
 * Cumulative exhaustion effects by level.
 * Each level includes the effects of all previous levels.
 */
const EXHAUSTION_LEVELS: ExhaustionEffect[] = [
    { level: 1, description: "Disadvantage on ability checks", checkDisadvantage: true },
    { level: 2, description: "Disadvantage on ability checks; speed halved", checkDisadvantage: true, speedHalved: true },
    {
        level: 3,
        description: "Disadvantage on ability checks; speed halved; disadvantage on attacks and saves",
        checkDisadvantage: true,
        speedHalved: true,
        attackAndSaveDisadvantage: true,
    },
    {
        level: 4,
        description: "Disadvantage on ability checks; speed halved; disadvantage on attacks and saves; HP max halved",
        checkDisadvantage: true,
        speedHalved: true,
        attackAndSaveDisadvantage: true,
        hpMaxHalved: true,
    },
    {
        level: 5,
        description: "Disadvantage on ability checks; speed 0; disadvantage on attacks and saves; HP max halved",
        checkDisadvantage: true,
        speedZero: true,
        attackAndSaveDisadvantage: true,
        hpMaxHalved: true,
    },
    {
        level: 6,
        description: "Death",
        checkDisadvantage: true,
        speedZero: true,
        attackAndSaveDisadvantage: true,
        hpMaxHalved: true,
        death: true,
    },
];

// ─── Lookup Functions ───

/** Returns the mechanical effects for a single condition type. */
export function getConditionEffect(type: ConditionType): ConditionEffect {
    return CONDITION_EFFECTS[type];
}

/** Returns mechanical effects for multiple condition types. */
export function getConditionEffects(types: ConditionType[]): ConditionEffect[] {
    return types.map((t) => CONDITION_EFFECTS[t]);
}

/**
 * Returns cumulative exhaustion effects for the given level (1–6).
 * Returns null for level 0 (no exhaustion) or out-of-range values.
 */
export function getExhaustionEffects(level: number): ExhaustionEffect | null {
    if (level < 1 || level > 6) return null;
    return EXHAUSTION_LEVELS[level - 1];
}

// ─── Modifier Resolution ───

/**
 * Resolves the net attack roll modifier for a creature with multiple conditions.
 * Advantage and disadvantage from any source cancel each other out (5e rule):
 * if both are present, the roll is "normal" regardless of how many sources.
 */
export function getNetAttackModifier(
    conditions: ConditionType[],
    exhaustionLevel = 0
): "advantage" | "disadvantage" | "normal" {
    let hasAdv = false;
    let hasDisadv = false;

    for (const type of conditions) {
        const effect = CONDITION_EFFECTS[type];
        if (effect.attackRolls === "advantage") hasAdv = true;
        if (effect.attackRolls === "disadvantage") hasDisadv = true;
    }

    // Exhaustion level 3+ gives disadvantage on attack rolls
    if (exhaustionLevel >= 3) hasDisadv = true;

    if (hasAdv && hasDisadv) return "normal";
    if (hasAdv) return "advantage";
    if (hasDisadv) return "disadvantage";
    return "normal";
}

/**
 * Resolves the net modifier for attacks AGAINST a creature with multiple conditions.
 * Same advantage/disadvantage cancellation rules apply.
 */
export function getNetDefenseModifier(
    conditions: ConditionType[]
): "advantage" | "disadvantage" | "normal" {
    let hasAdv = false;
    let hasDisadv = false;

    for (const type of conditions) {
        const effect = CONDITION_EFFECTS[type];
        if (effect.attacksAgainst === "advantage") hasAdv = true;
        if (effect.attacksAgainst === "disadvantage") hasDisadv = true;
    }

    if (hasAdv && hasDisadv) return "normal";
    if (hasAdv) return "advantage";
    if (hasDisadv) return "disadvantage";
    return "normal";
}

/**
 * Resolves the net saving throw modifier for a specific ability.
 * Returns "auto-fail" if any condition causes automatic failure for that ability,
 * otherwise resolves advantage/disadvantage as usual.
 */
export function getNetSaveModifier(
    conditions: ConditionType[],
    ability: keyof DnD5eAbilityScores,
    exhaustionLevel = 0
): "advantage" | "disadvantage" | "normal" | "auto-fail" {
    let hasAdv = false;
    let hasDisadv = false;

    for (const type of conditions) {
        const effect = CONDITION_EFFECTS[type];

        // Check auto-fail saves first — if any condition auto-fails this ability, return immediately
        if (effect.autoFailSaves?.includes(ability)) return "auto-fail";

        // Check save modifiers for this specific ability
        if (effect.saveModifiers && typeof effect.saveModifiers === "object") {
            const mod = effect.saveModifiers[ability];
            if (mod === "advantage") hasAdv = true;
            if (mod === "disadvantage") hasDisadv = true;
        }
    }

    // Exhaustion level 3+ gives disadvantage on saving throws
    if (exhaustionLevel >= 3) hasDisadv = true;

    if (hasAdv && hasDisadv) return "normal";
    if (hasAdv) return "advantage";
    if (hasDisadv) return "disadvantage";
    return "normal";
}

/**
 * Returns true if any of the given conditions cause incapacitation.
 * Incapacitated creatures can't take actions or reactions.
 */
export function isIncapacitated(conditions: ConditionType[]): boolean {
    return conditions.some((type) => CONDITION_EFFECTS[type].incapacitated === true);
}

/**
 * Calculates the effective speed multiplier from active conditions and exhaustion.
 * Returns 0 if speed is reduced to zero (grappled, restrained, paralyzed, etc.).
 * Returns 0.5 if only prone (crawling) or exhaustion level 2+ (speed halved).
 * Multipliers stack multiplicatively (prone + exhaustion 2 = 0.25).
 */
export function getSpeedMultiplier(
    conditions: ConditionType[],
    exhaustionLevel = 0
): number {
    // Any condition that sets speed to 0 wins outright
    for (const type of conditions) {
        if (CONDITION_EFFECTS[type].speedZero) return 0;
    }

    // Exhaustion level 5+ sets speed to 0
    if (exhaustionLevel >= 5) return 0;

    let multiplier = 1;

    // Condition-based multipliers (currently only prone = 0.5)
    for (const type of conditions) {
        const effect = CONDITION_EFFECTS[type];
        if (effect.speedMultiplier !== undefined) {
            multiplier *= effect.speedMultiplier;
        }
    }

    // Exhaustion level 2+ halves speed
    if (exhaustionLevel >= 2) {
        multiplier *= 0.5;
    }

    return multiplier;
}

// ─── Display Helpers ───

/** Severity category for color-coding condition badges. */
export type ConditionSeverity = "severe" | "movement" | "beneficial" | "perception" | "mild";

/** Maps each condition to a severity category for badge coloring. */
const CONDITION_SEVERITY: Record<ConditionType, ConditionSeverity> = {
    blinded: "perception",
    charmed: "mild",
    deafened: "mild",
    frightened: "mild",
    grappled: "movement",
    incapacitated: "severe",
    invisible: "beneficial",
    paralyzed: "severe",
    petrified: "severe",
    poisoned: "mild",
    prone: "movement",
    restrained: "movement",
    stunned: "severe",
    unconscious: "severe",
};

/**
 * Returns CSS class names for a condition badge based on severity.
 *   - 🔴 Red: severe/incapacitating (incapacitated, paralyzed, petrified, stunned, unconscious)
 *   - 🟡 Yellow: movement (grappled, prone, restrained)
 *   - 🟢 Green: beneficial (invisible)
 *   - 🟣 Purple: perception (blinded)
 *   - 🟠 Amber: mild (charmed, deafened, frightened, poisoned)
 */
export function getConditionBadgeClasses(type: ConditionType): string {
    const severity = CONDITION_SEVERITY[type];
    switch (severity) {
        case "severe":
            return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
        case "movement":
            return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
        case "beneficial":
            return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
        case "perception":
            return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
        case "mild":
        default:
            return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    }
}

/**
 * Builds a compact summary of active mechanical effects from conditions and exhaustion.
 * Returns an array of { icon, label } objects for display.
 */
export function getEffectSummary(
    conditions: ConditionType[],
    exhaustionLevel = 0
): { icon: string; label: string }[] {
    if (conditions.length === 0 && exhaustionLevel === 0) return [];

    const summary: { icon: string; label: string }[] = [];

    const attackMod = getNetAttackModifier(conditions, exhaustionLevel);
    if (attackMod !== "normal") {
        summary.push({ icon: "⚔️", label: `Attacks: ${attackMod === "advantage" ? "Adv" : "Disadv"}` });
    }

    const defenseMod = getNetDefenseModifier(conditions);
    if (defenseMod !== "normal") {
        summary.push({ icon: "🛡️", label: `Attacked: ${defenseMod === "advantage" ? "Adv" : "Disadv"}` });
    }

    const speedMult = getSpeedMultiplier(conditions, exhaustionLevel);
    if (speedMult === 0) {
        summary.push({ icon: "🏃", label: "Speed: 0" });
    } else if (speedMult < 1) {
        summary.push({ icon: "🏃", label: `Speed: ×${speedMult}` });
    }

    if (isIncapacitated(conditions)) {
        summary.push({ icon: "🚫", label: "Incapacitated" });
    }

    // Check for auto-fail saves
    const autoFailAbilities = new Set<keyof DnD5eAbilityScores>();
    for (const type of conditions) {
        const effect = CONDITION_EFFECTS[type];
        if (effect.autoFailSaves) {
            for (const ability of effect.autoFailSaves) {
                autoFailAbilities.add(ability);
            }
        }
    }
    if (autoFailAbilities.size > 0) {
        const abbrs = [...autoFailAbilities].map((a) => a.slice(0, 3).toUpperCase());
        summary.push({ icon: "❌", label: `Auto-fail: ${abbrs.join("/")} saves` });
    }

    return summary;
}
