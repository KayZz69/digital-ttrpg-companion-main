/**
 * @fileoverview Background rules registry for 2024 D&D 5e.
 *
 * Provides a pure, stateless registry for background data including
 * skill proficiencies, tool proficiencies, languages, and descriptions.
 *
 * Follows the same registry factory pattern as spells.ts.
 * This module exports only pure functions — no classes, no side effects.
 */

import { getAllBackgrounds } from "@/data/backgrounds";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface BackgroundRule {
  readonly id: string;
  readonly name: string;
  readonly skills: ReadonlyArray<string>;
  readonly toolProficiencies: ReadonlyArray<string>;
  readonly languages: ReadonlyArray<string>;
  readonly description: string;
}

export interface BackgroundRegistry {
  getBackgroundRules(backgroundId: string): BackgroundRule | null;
  getAllBackgroundRules(): BackgroundRule[];
  getBackgroundSkills(backgroundId: string): ReadonlyArray<string>;
  getBackgroundToolProficiencies(backgroundId: string): ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Maps a Background data record to a BackgroundRule.
 * Missing optional fields default to empty arrays / empty string.
 *
 * @pure
 */
function toBackgroundRule(bg: ReturnType<typeof getAllBackgrounds>[number]): BackgroundRule {
  return {
    id: bg.id,
    name: bg.name,
    skills: bg.skills,
    toolProficiencies: bg.tools ?? [],
    languages: bg.languages ?? [],
    description: bg.description ?? "",
  };
}

// ---------------------------------------------------------------------------
// Public rule functions (exported for direct use / testing)
// ---------------------------------------------------------------------------

/**
 * Returns the BackgroundRule for a given background ID, or null if not found.
 * Lookup is case-insensitive and trims whitespace.
 *
 * @pure
 */
export function getBackgroundRules(backgroundId: string): BackgroundRule | null {
  const id = backgroundId.trim().toLowerCase();
  const bg = getAllBackgrounds().find((b) => b.id.toLowerCase() === id);
  if (!bg) return null;
  return toBackgroundRule(bg);
}

/**
 * Returns BackgroundRule objects for all registered backgrounds.
 *
 * @pure
 */
export function getAllBackgroundRules(): BackgroundRule[] {
  return getAllBackgrounds().map(toBackgroundRule);
}

/**
 * Returns the skill proficiencies for a background, or an empty array if not found.
 *
 * @pure
 */
export function getBackgroundSkills(backgroundId: string): ReadonlyArray<string> {
  const rule = getBackgroundRules(backgroundId);
  return rule?.skills ?? [];
}

/**
 * Returns the tool proficiencies for a background, or an empty array if not found.
 *
 * @pure
 */
export function getBackgroundToolProficiencies(backgroundId: string): ReadonlyArray<string> {
  const rule = getBackgroundRules(backgroundId);
  return rule?.toolProficiencies ?? [];
}

// ---------------------------------------------------------------------------
// Registry factory
// ---------------------------------------------------------------------------

/**
 * Creates and returns the background rules registry.
 *
 * The returned object is a plain object (not a class instance) for easy
 * mocking in tests and composition in DI patterns.
 *
 * @pure — the returned registry object contains only pure functions.
 *
 * @example
 * ```ts
 * const registry = getBackgroundRegistry();
 * const acolyte = registry.getBackgroundRules("acolyte");
 * // acolyte.toolProficiencies → ["Calligrapher's Supplies"]
 * ```
 */
export function getBackgroundRegistry(): BackgroundRegistry {
  return {
    getBackgroundRules,
    getAllBackgroundRules,
    getBackgroundSkills,
    getBackgroundToolProficiencies,
  };
}
