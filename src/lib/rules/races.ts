/**
 * @fileoverview D&D 5e race rules registry.
 *
 * Provides a registry-pattern interface over the race data in src/data/races.ts,
 * exposing race traits, languages, speed, and other racial properties as pure
 * lookup functions.
 *
 * This module exports only pure functions — no classes, no side effects.
 */

import { getAllRaces } from "@/data/races";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface RaceRule {
  readonly id: string;
  readonly name: string;
  readonly size: "Small" | "Medium";
  readonly speed: number;
  readonly creatureType: string;
  readonly traits: ReadonlyArray<{ readonly name: string; readonly description: string }>;
  readonly languages: ReadonlyArray<string>;
  readonly abilityScoreIncrease?: string;
}

export interface RaceRegistry {
  getRaceRules(raceId: string): RaceRule | null;
  getAllRaceRules(): RaceRule[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalises a race ID for case-insensitive lookup.
 */
function normalizeId(id: string): string {
  return id.trim().toLowerCase();
}

/**
 * Converts a Race data record to a frozen RaceRule.
 */
function toRaceRule(race: ReturnType<typeof getAllRaces>[number]): RaceRule {
  return Object.freeze({
    id: race.id,
    name: race.name,
    size: race.size,
    speed: race.speed,
    creatureType: race.creatureType,
    traits: Object.freeze(
      race.traits.map((t) => Object.freeze({ name: t.name, description: t.description }))
    ),
    languages: Object.freeze([...(race.languages ?? [])]),
    ...(race.abilityScoreIncrease !== undefined
      ? { abilityScoreIncrease: race.abilityScoreIncrease }
      : {}),
  });
}

// ---------------------------------------------------------------------------
// Registry factory
// ---------------------------------------------------------------------------

/**
 * Creates and returns a race rules registry backed by the static race data.
 *
 * The returned object is a plain object (not a class instance) for easy
 * mocking in tests and composition in DI patterns.
 *
 * @pure — the returned registry object contains only pure functions.
 */
export function getRaceRegistry(): RaceRegistry {
  const allRaces = getAllRaces();
  const rulesMap = new Map<string, RaceRule>();
  const rulesList: RaceRule[] = [];

  for (const race of allRaces) {
    const rule = toRaceRule(race);
    rulesMap.set(normalizeId(race.id), rule);
    rulesList.push(rule);
  }

  return {
    getRaceRules(raceId: string): RaceRule | null {
      return rulesMap.get(normalizeId(raceId)) ?? null;
    },

    getAllRaceRules(): RaceRule[] {
      return [...rulesList];
    },
  };
}

// ---------------------------------------------------------------------------
// Convenience functions
// ---------------------------------------------------------------------------

/**
 * Returns the traits array for a given race, or an empty array if the race
 * is not found.
 *
 * @pure
 */
export function getRaceTraits(
  raceId: string
): ReadonlyArray<{ readonly name: string; readonly description: string }> {
  const registry = getRaceRegistry();
  const rule = registry.getRaceRules(raceId);
  return rule?.traits ?? [];
}

/**
 * Returns the languages array for a given race, or an empty array if the
 * race is not found.
 *
 * @pure
 */
export function getRaceLanguages(raceId: string): ReadonlyArray<string> {
  const registry = getRaceRegistry();
  const rule = registry.getRaceRules(raceId);
  return rule?.languages ?? [];
}

/**
 * Returns the speed for a given race, or the default 30 ft if the race
 * is not found.
 *
 * @pure
 */
export function getRaceSpeed(raceId: string): number {
  const registry = getRaceRegistry();
  const rule = registry.getRaceRules(raceId);
  return rule?.speed ?? 30;
}
