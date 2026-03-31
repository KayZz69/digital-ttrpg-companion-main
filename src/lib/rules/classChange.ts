/**
 * @fileoverview Class change reconciliation for character creation wizard.
 *
 * When a user changes their class mid-wizard, spell selections, equipment,
 * and casting metadata must be reconciled against the new class's rules.
 *
 * This module provides pure functions that compute what changes are needed
 * without mutating any state. The caller (CharacterWizard) applies the results.
 *
 * Rules baseline: 2024 Player's Handbook (D&D 5e 2024)
 *
 * This module exports only pure functions — no classes, no side effects.
 */

import { getClassSpells, getClassSpellcastingAbility } from "@/lib/dndCompendium";
import {
  getHighestAvailableSlotLevel,
  getMaxPreparedSpells,
  getSpellcastingType,
  getCantrips,
} from "./spells";
import type { SpellcastingType } from "./RulesRegistry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A spell entry as stored in character state during creation. */
type SpellEntry = {
  id: string;
  sourceSpellId?: string;
  name: string;
  level: number;
  [key: string]: unknown;
};

export interface SpellReconciliationResult {
  /** Spells that survived the reconciliation */
  kept: SpellEntry[];
  /** Spells that were removed with reasons */
  removed: Array<{ name: string; level: number; reason: string }>;
}

export interface EquipmentReconciliationResult {
  /** Whether equipment should be cleared */
  shouldClearEquipment: boolean;
  /** Whether the equipment selection mode should be reset */
  shouldResetMode: boolean;
}

export interface ClassChangeReconciliation {
  spells: SpellReconciliationResult;
  equipment: EquipmentReconciliationResult;
  newSpellcastingType: SpellcastingType;
  newSpellcastingAbility: string | undefined;
  /** Human-readable summary of changes for toast notification */
  changeSummary: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the ability modifier from a raw ability score.
 * @see 2024 PHB — "Ability Scores and Modifiers" table, Chapter 1
 */
function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Capitalizes the first letter of a string for display in summary messages.
 */
function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Spell reconciliation
// ---------------------------------------------------------------------------

/**
 * Reconciles a character's spell selections when their class changes.
 *
 * Steps:
 * 1. Filter out spells not in the new class's spell list
 * 2. Filter out spells whose level exceeds the new class's highest available slot level
 * 3. Trim cantrips to the new class's cantrip limit (keep first N)
 * 4. Trim leveled spells to the new class's known/prepared limit (keep first N)
 *
 * @pure
 */
export function reconcileSpellsForClassChange(
  newClassId: string,
  characterLevel: number,
  abilityScore: number,
  currentSpells: SpellEntry[],
): SpellReconciliationResult {
  const removed: Array<{ name: string; level: number; reason: string }> = [];

  if (currentSpells.length === 0) {
    return { kept: [], removed: [] };
  }

  // Step 1: Filter out spells not in the new class's spell list
  const availableSpellIds = new Set(
    getClassSpells(newClassId).map((spell) => spell.id)
  );

  let surviving = currentSpells.filter((spell) => {
    const spellId = spell.sourceSpellId || spell.id;
    if (!availableSpellIds.has(spellId)) {
      removed.push({
        name: spell.name,
        level: spell.level,
        reason: `Not available to ${capitalize(newClassId)}`,
      });
      return false;
    }
    return true;
  });

  // Step 2: Filter out spells whose level exceeds highest available slot level
  // (cantrips are level 0 and always pass this check)
  const highestSlot = getHighestAvailableSlotLevel(newClassId, characterLevel);

  surviving = surviving.filter((spell) => {
    if (spell.level > 0 && spell.level > highestSlot) {
      removed.push({
        name: spell.name,
        level: spell.level,
        reason: `Spell level ${spell.level} exceeds highest available slot level (${highestSlot})`,
      });
      return false;
    }
    return true;
  });

  // Step 3: Trim cantrips to the new class's cantrip limit (keep first N)
  const cantripData = getCantrips(newClassId, characterLevel);
  const cantripCap = cantripData?.maxKnown ?? 0;

  const cantrips = surviving.filter((s) => s.level === 0);
  const leveledSpells = surviving.filter((s) => s.level > 0);

  if (cantrips.length > cantripCap) {
    const excess = cantrips.slice(cantripCap);
    for (const spell of excess) {
      removed.push({
        name: spell.name,
        level: spell.level,
        reason: `Exceeds cantrip limit (${cantripCap})`,
      });
    }
    cantrips.splice(cantripCap);
  }

  // Step 4: Trim leveled spells to the new class's known/prepared limit (keep first N)
  const modifier = abilityModifier(abilityScore);
  const leveledCap = getMaxPreparedSpells(newClassId, characterLevel, modifier);

  if (leveledSpells.length > leveledCap) {
    const excess = leveledSpells.slice(leveledCap);
    for (const spell of excess) {
      removed.push({
        name: spell.name,
        level: spell.level,
        reason: `Exceeds ${capitalize(newClassId)} spell limit (${leveledCap})`,
      });
    }
    leveledSpells.splice(leveledCap);
  }

  return {
    kept: [...cantrips, ...leveledSpells],
    removed,
  };
}

// ---------------------------------------------------------------------------
// Equipment reconciliation
// ---------------------------------------------------------------------------

/**
 * Determines whether equipment should be reset on class change.
 * Starting equipment is class-dependent, so changing class should
 * clear equipment selections and reset to package mode.
 *
 * @pure
 * @see 2024 PHB — "Starting Equipment" (each class section)
 */
export function reconcileEquipmentForClassChange(
  previousClassId: string,
  newClassId: string,
): EquipmentReconciliationResult {
  const same =
    previousClassId.trim().toLowerCase() === newClassId.trim().toLowerCase();

  return {
    shouldClearEquipment: !same,
    shouldResetMode: !same,
  };
}

// ---------------------------------------------------------------------------
// Full reconciliation orchestrator
// ---------------------------------------------------------------------------

/**
 * Full class change reconciliation.
 * Orchestrates spell and equipment reconciliation and builds a summary.
 *
 * @pure
 */
export function reconcileClassChange(
  previousClassId: string,
  newClassId: string,
  characterLevel: number,
  abilityScore: number,
  currentSpells: SpellEntry[],
): ClassChangeReconciliation {
  const spells = reconcileSpellsForClassChange(
    newClassId,
    characterLevel,
    abilityScore,
    currentSpells,
  );

  const equipment = reconcileEquipmentForClassChange(previousClassId, newClassId);

  const newSpellcastingType = getSpellcastingType(newClassId);
  const newSpellcastingAbility = getClassSpellcastingAbility(newClassId);

  // Build human-readable summary
  const changeSummary: string[] = [];

  if (spells.removed.length > 0) {
    // Group removal reasons for a cleaner summary
    const byReason = new Map<string, number>();
    for (const r of spells.removed) {
      const count = byReason.get(r.reason) ?? 0;
      byReason.set(r.reason, count + 1);
    }
    for (const [reason, count] of byReason) {
      changeSummary.push(
        `Removed ${count} ${count === 1 ? "spell" : "spells"}: ${reason}`
      );
    }
  }

  if (equipment.shouldClearEquipment) {
    changeSummary.push("Equipment selections cleared");
  }

  if (newSpellcastingType === "none") {
    changeSummary.push(`${capitalize(newClassId)} has no spellcasting`);
  }

  return {
    spells,
    equipment,
    newSpellcastingType,
    newSpellcastingAbility,
    changeSummary,
  };
}
