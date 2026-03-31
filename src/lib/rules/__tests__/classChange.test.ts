/**
 * @fileoverview Tests for class change reconciliation (classChange.ts).
 *
 * Coverage targets:
 * - reconcileSpellsForClassChange(): class availability filtering, slot level
 *   filtering, cantrip cap trimming, leveled spell cap trimming
 * - reconcileEquipmentForClassChange(): same-class no-op, different-class clear
 * - reconcileClassChange(): full orchestration flow and changeSummary output
 */

import { describe, expect, it } from "vitest";
import { getClassSpells } from "@/lib/dndCompendium";
import {
  reconcileSpellsForClassChange,
  reconcileEquipmentForClassChange,
  reconcileClassChange,
} from "../classChange";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Creates a minimal spell entry for testing. */
function makeSpell(
  id: string,
  name: string,
  level: number,
  sourceSpellId?: string,
): { id: string; sourceSpellId?: string; name: string; level: number } {
  return { id, sourceSpellId: sourceSpellId ?? id, name, level };
}

/**
 * Finds the first N spell IDs from a class's spell list at a given level.
 * Uses the compendium to ensure IDs are real.
 */
function findClassSpellIds(
  classId: string,
  spellLevel: number,
  count: number,
): Array<{ id: string; name: string; level: number }> {
  return getClassSpells(classId)
    .filter((s) => s.level === spellLevel)
    .slice(0, count)
    .map((s) => ({ id: s.id, name: s.name, level: s.level }));
}

/**
 * Finds a spell that belongs to classA but NOT classB.
 * Returns undefined if no such spell exists in the data.
 */
function findExclusiveSpell(
  classA: string,
  classB: string,
  spellLevel: number,
): { id: string; name: string; level: number } | undefined {
  const classASpells = getClassSpells(classA);
  const classBIds = new Set(getClassSpells(classB).map((s) => s.id));

  const exclusive = classASpells.find(
    (s) => s.level === spellLevel && !classBIds.has(s.id),
  );
  if (!exclusive) return undefined;
  return { id: exclusive.id, name: exclusive.name, level: exclusive.level };
}

/**
 * Finds a spell shared by both classes at a given level.
 */
function findSharedSpell(
  classA: string,
  classB: string,
  spellLevel: number,
): { id: string; name: string; level: number } | undefined {
  const classBIds = new Set(getClassSpells(classB).map((s) => s.id));
  const shared = getClassSpells(classA).find(
    (s) => s.level === spellLevel && classBIds.has(s.id),
  );
  if (!shared) return undefined;
  return { id: shared.id, name: shared.name, level: shared.level };
}

// ---------------------------------------------------------------------------
// reconcileSpellsForClassChange
// ---------------------------------------------------------------------------

describe("reconcileSpellsForClassChange", () => {
  it("returns empty kept and removed for empty spell list", () => {
    const result = reconcileSpellsForClassChange("sorcerer", 1, 14, []);
    expect(result.kept).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
  });

  it("removes wizard-only spells when switching to sorcerer", () => {
    const wizardExclusive = findExclusiveSpell("wizard", "sorcerer", 1);
    if (!wizardExclusive) {
      // If the data has no wizard-exclusive level 1 spell, skip gracefully
      return;
    }

    const spells = [makeSpell(wizardExclusive.id, wizardExclusive.name, 1)];
    const result = reconcileSpellsForClassChange("sorcerer", 1, 14, spells);

    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].reason).toContain("Not available to Sorcerer");
    expect(result.kept).toHaveLength(0);
  });

  it("keeps shared spells when switching between casters", () => {
    const shared = findSharedSpell("wizard", "sorcerer", 1);
    if (!shared) return;

    const spells = [makeSpell(shared.id, shared.name, 1)];
    // Sorcerer level 1 knows 3 leveled spells — 1 spell is within limit
    const result = reconcileSpellsForClassChange("sorcerer", 1, 14, spells);

    expect(result.kept).toHaveLength(1);
    expect(result.kept[0].id).toBe(shared.id);
  });

  it("removes all spells when switching to non-caster (fighter)", () => {
    const wizardCantrips = findClassSpellIds("wizard", 0, 2);
    const wizardLeveled = findClassSpellIds("wizard", 1, 2);
    const allSpells = [
      ...wizardCantrips.map((s) => makeSpell(s.id, s.name, s.level)),
      ...wizardLeveled.map((s) => makeSpell(s.id, s.name, s.level)),
    ];

    const result = reconcileSpellsForClassChange("fighter", 1, 14, allSpells);

    expect(result.kept).toHaveLength(0);
    expect(result.removed).toHaveLength(allSpells.length);
    for (const r of result.removed) {
      expect(r.reason).toContain("Not available to Fighter");
    }
  });

  it("returns empty when switching from non-caster to caster with no spells", () => {
    const result = reconcileSpellsForClassChange("wizard", 1, 16, []);
    expect(result.kept).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
  });

  it("trims cantrips to new class limit", () => {
    // Wizard at level 1 has 3 cantrips max.
    // Give 5 wizard cantrips to simulate switching from a class with more.
    const wizardCantrips = findClassSpellIds("wizard", 0, 5);
    if (wizardCantrips.length < 5) return; // need at least 5 cantrips in data

    const spells = wizardCantrips.map((s) => makeSpell(s.id, s.name, 0));
    // Wizard level 1: 3 cantrips max
    const result = reconcileSpellsForClassChange("wizard", 1, 16, spells);

    const keptCantrips = result.kept.filter((s) => s.level === 0);
    expect(keptCantrips).toHaveLength(3);
    // 2 should be trimmed
    const trimmedCantrips = result.removed.filter((r) =>
      r.reason.includes("cantrip limit"),
    );
    expect(trimmedCantrips).toHaveLength(2);
  });

  it("trims leveled spells to new class known/prepared limit", () => {
    // Sorcerer level 1 knows 3 leveled spells. Give 5 valid sorcerer spells.
    const sorcererLeveled = findClassSpellIds("sorcerer", 1, 5);
    if (sorcererLeveled.length < 5) return;

    const spells = sorcererLeveled.map((s) => makeSpell(s.id, s.name, 1));
    // Sorcerer level 1, CHA 14 (mod +2) — known caster, so 3 spells known
    const result = reconcileSpellsForClassChange("sorcerer", 1, 14, spells);

    const keptLeveled = result.kept.filter((s) => s.level > 0);
    expect(keptLeveled).toHaveLength(3);
    const trimmedLeveled = result.removed.filter((r) =>
      r.reason.includes("spell limit"),
    );
    expect(trimmedLeveled).toHaveLength(2);
  });

  it("removes spells whose level exceeds highest available slot", () => {
    // Paladin level 2 has only 1st-level slots. A level 2 spell should be removed.
    // Find a paladin spell at level 2
    const paladinL2 = findClassSpellIds("paladin", 2, 1);
    const paladinL1 = findClassSpellIds("paladin", 1, 1);
    if (paladinL2.length === 0 || paladinL1.length === 0) return;

    const spells = [
      makeSpell(paladinL1[0].id, paladinL1[0].name, 1),
      makeSpell(paladinL2[0].id, paladinL2[0].name, 2),
    ];
    // Paladin level 2: highest slot = 1
    const result = reconcileSpellsForClassChange("paladin", 2, 14, spells);

    expect(result.removed.some((r) => r.level === 2)).toBe(true);
    expect(
      result.removed.find((r) => r.level === 2)?.reason,
    ).toContain("exceeds highest available slot level");
  });

  it("half-caster at level 1 (paladin): all leveled spells removed (no slots)", () => {
    // Paladin level 1 has NO spell slots at all
    const paladinL1 = findClassSpellIds("paladin", 1, 3);
    if (paladinL1.length === 0) return;

    const spells = paladinL1.map((s) => makeSpell(s.id, s.name, 1));
    const result = reconcileSpellsForClassChange("paladin", 1, 14, spells);

    // All leveled spells removed — paladin has no slots at level 1
    // They are removed either by slot level check (highest = 0) or by prepared limit (0)
    expect(result.kept.filter((s) => s.level > 0)).toHaveLength(0);
    expect(result.removed.length).toBe(paladinL1.length);
  });

  it("matches spells by sourceSpellId when present", () => {
    const shared = findSharedSpell("wizard", "sorcerer", 1);
    if (!shared) return;

    // Spell with a different id but sourceSpellId matching the compendium
    const spells = [
      makeSpell("custom-uuid-123", shared.name, 1, shared.id),
    ];
    const result = reconcileSpellsForClassChange("sorcerer", 1, 14, spells);

    expect(result.kept).toHaveLength(1);
    expect(result.kept[0].id).toBe("custom-uuid-123");
  });

  it("wizard → sorcerer full scenario: filters, trims cantrips and leveled", () => {
    // Build a mixed spell list:
    // - Some cantrips shared between wizard and sorcerer
    // - Some leveled spells shared
    // - Possibly a wizard-exclusive spell
    const sharedCantrips = getClassSpells("wizard")
      .filter((s) => s.level === 0)
      .filter((s) => getClassSpells("sorcerer").some((ss) => ss.id === s.id))
      .slice(0, 5);

    const sharedLeveled = getClassSpells("wizard")
      .filter((s) => s.level === 1)
      .filter((s) => getClassSpells("sorcerer").some((ss) => ss.id === s.id))
      .slice(0, 5);

    if (sharedCantrips.length < 5 || sharedLeveled.length < 4) return;

    const spells = [
      ...sharedCantrips.map((s) => makeSpell(s.id, s.name, 0)),
      ...sharedLeveled.map((s) => makeSpell(s.id, s.name, 1)),
    ];

    // Sorcerer level 1: 4 cantrips, 3 known leveled spells
    const result = reconcileSpellsForClassChange("sorcerer", 1, 14, spells);

    const keptCantrips = result.kept.filter((s) => s.level === 0);
    const keptLeveled = result.kept.filter((s) => s.level > 0);

    // Sorcerer level 1 cantrip cap = 4
    expect(keptCantrips.length).toBeLessThanOrEqual(4);
    // Sorcerer level 1 known cap = 3
    expect(keptLeveled.length).toBeLessThanOrEqual(3);
    // Total removed should account for the trims
    expect(result.removed.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// reconcileEquipmentForClassChange
// ---------------------------------------------------------------------------

describe("reconcileEquipmentForClassChange", () => {
  it("clears equipment when class changes", () => {
    const result = reconcileEquipmentForClassChange("wizard", "sorcerer");
    expect(result.shouldClearEquipment).toBe(true);
    expect(result.shouldResetMode).toBe(true);
  });

  it("does not clear equipment when class stays the same", () => {
    const result = reconcileEquipmentForClassChange("wizard", "wizard");
    expect(result.shouldClearEquipment).toBe(false);
    expect(result.shouldResetMode).toBe(false);
  });

  it("is case-insensitive for class comparison", () => {
    const result = reconcileEquipmentForClassChange("Wizard", "wizard");
    expect(result.shouldClearEquipment).toBe(false);
    expect(result.shouldResetMode).toBe(false);
  });

  it("trims whitespace for class comparison", () => {
    const result = reconcileEquipmentForClassChange(" wizard ", "wizard");
    expect(result.shouldClearEquipment).toBe(false);
    expect(result.shouldResetMode).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// reconcileClassChange — full orchestration
// ---------------------------------------------------------------------------

describe("reconcileClassChange", () => {
  it("wizard → sorcerer: produces correct reconciliation shape", () => {
    const wizardCantrips = findClassSpellIds("wizard", 0, 2);
    const wizardLeveled = findClassSpellIds("wizard", 1, 2);
    const spells = [
      ...wizardCantrips.map((s) => makeSpell(s.id, s.name, 0)),
      ...wizardLeveled.map((s) => makeSpell(s.id, s.name, 1)),
    ];

    const result = reconcileClassChange("wizard", "sorcerer", 1, 14, spells);

    expect(result.newSpellcastingType).toBe("known");
    expect(result.newSpellcastingAbility).toBeDefined();
    expect(result.equipment.shouldClearEquipment).toBe(true);
    expect(result.spells).toBeDefined();
    expect(result.changeSummary).toBeInstanceOf(Array);
  });

  it("non-caster → caster: no spells removed, summary mentions no removals", () => {
    const result = reconcileClassChange("fighter", "wizard", 1, 16, []);

    expect(result.spells.kept).toHaveLength(0);
    expect(result.spells.removed).toHaveLength(0);
    expect(result.newSpellcastingType).toBe("prepared");
    expect(result.newSpellcastingAbility).toBeDefined();
    expect(result.equipment.shouldClearEquipment).toBe(true);
    // No spell removal messages
    const spellRemovalSummary = result.changeSummary.filter((s) =>
      s.startsWith("Removed"),
    );
    expect(spellRemovalSummary).toHaveLength(0);
  });

  it("caster → non-caster: all spells removed, summary indicates no spellcasting", () => {
    const wizardCantrips = findClassSpellIds("wizard", 0, 3);
    const wizardLeveled = findClassSpellIds("wizard", 1, 3);
    const spells = [
      ...wizardCantrips.map((s) => makeSpell(s.id, s.name, 0)),
      ...wizardLeveled.map((s) => makeSpell(s.id, s.name, 1)),
    ];

    const result = reconcileClassChange("wizard", "fighter", 1, 16, spells);

    expect(result.spells.kept).toHaveLength(0);
    expect(result.spells.removed).toHaveLength(spells.length);
    expect(result.newSpellcastingType).toBe("none");
    expect(result.newSpellcastingAbility).toBeUndefined();
    expect(result.changeSummary.some((s) => s.includes("no spellcasting"))).toBe(
      true,
    );
  });

  it("changeSummary includes equipment cleared message", () => {
    const result = reconcileClassChange("wizard", "sorcerer", 1, 14, []);
    expect(result.changeSummary).toContain("Equipment selections cleared");
  });

  it("changeSummary includes spell removal reasons", () => {
    const wizardCantrips = findClassSpellIds("wizard", 0, 2);
    const wizardLeveled = findClassSpellIds("wizard", 1, 2);
    const spells = [
      ...wizardCantrips.map((s) => makeSpell(s.id, s.name, 0)),
      ...wizardLeveled.map((s) => makeSpell(s.id, s.name, 1)),
    ];

    const result = reconcileClassChange("wizard", "fighter", 1, 16, spells);

    // Should have removal summary messages
    const removalMessages = result.changeSummary.filter((s) =>
      s.startsWith("Removed"),
    );
    expect(removalMessages.length).toBeGreaterThan(0);
    // Messages should mention count and reason
    expect(removalMessages[0]).toMatch(/Removed \d+ spells?:/);
  });

  it("groups removal reasons in changeSummary", () => {
    // Create spells that will be removed for different reasons
    const wizardCantrips = findClassSpellIds("wizard", 0, 3);
    const wizardLeveled = findClassSpellIds("wizard", 1, 3);
    const spells = [
      ...wizardCantrips.map((s) => makeSpell(s.id, s.name, 0)),
      ...wizardLeveled.map((s) => makeSpell(s.id, s.name, 1)),
    ];

    // Fighter has no spells — all removed with same reason
    const result = reconcileClassChange("wizard", "fighter", 1, 16, spells);

    // All removals should be grouped under one reason
    const removalMessages = result.changeSummary.filter((s) =>
      s.startsWith("Removed"),
    );
    // Should be exactly 1 grouped message (all "Not available to Fighter")
    expect(removalMessages).toHaveLength(1);
    expect(removalMessages[0]).toContain("Fighter");
  });
});
