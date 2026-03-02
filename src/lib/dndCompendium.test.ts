import { describe, expect, it } from "vitest";
import {
  formatSpellComponents,
  getAllCompendiumEquipment,
  getClassByName,
  getClassSavingThrowProficiencies,
  getClassSpells,
  toInventoryItem,
  toPreparedSpell,
} from "./dndCompendium";

describe("dndCompendium helpers", () => {
  it("finds classes by name case-insensitively", () => {
    const wizard = getClassByName("wizard");
    expect(wizard?.id).toBe("wizard");
  });

  it("builds saving throw proficiency map from class data", () => {
    const saves = getClassSavingThrowProficiencies("Wizard");
    expect(saves.intelligence).toBe(true);
    expect(saves.wisdom).toBe(true);
    expect(saves.strength).toBeUndefined();
  });

  it("returns class spell list sorted by level and name", () => {
    const wizardSpells = getClassSpells("Wizard");
    expect(wizardSpells.length).toBeGreaterThan(0);
    expect(wizardSpells[0].level).toBe(0);
  });

  it("formats spell components and creates prepared spell payloads", () => {
    const components = formatSpellComponents({
      verbal: true,
      somatic: true,
      material: { required: true, components: "a tiny bell" },
    });
    expect(components).toContain("V");
    expect(components).toContain("S");
    expect(components).toContain("M (a tiny bell)");

    const wizardSpells = getClassSpells("Wizard");
    const prepared = toPreparedSpell(wizardSpells[0], "spell-1");
    expect(prepared.id).toBe("spell-1");
    expect(prepared.sourceSpellId).toBe(wizardSpells[0].id);
  });

  it("creates inventory items linked to compendium equipment", () => {
    const equipment = getAllCompendiumEquipment();
    expect(equipment.length).toBeGreaterThan(0);
    const inventory = toInventoryItem(equipment[0], 2);
    expect(inventory.sourceItemId).toBe(equipment[0].id);
    expect(inventory.quantity).toBe(2);
  });

  it("preserves concentration and ritual flags in toPreparedSpell", () => {
    const wizardSpells = getClassSpells("Wizard");
    // Find a concentration spell (e.g., Dancing Lights or True Strike)
    const concentrationSpell = wizardSpells.find((s) => s.concentration === true);
    expect(concentrationSpell).toBeDefined();
    const prepared = toPreparedSpell(concentrationSpell!);
    expect(prepared.concentration).toBe(true);

    // Find a ritual spell (e.g., Alarm, Detect Magic)
    const ritualSpell = wizardSpells.find((s) => s.ritual === true);
    expect(ritualSpell).toBeDefined();
    const preparedRitual = toPreparedSpell(ritualSpell!);
    expect(preparedRitual.ritual).toBe(true);

    // Non-ritual non-concentration spell
    const normalSpell = wizardSpells.find((s) => !s.concentration && !s.ritual);
    expect(normalSpell).toBeDefined();
    const preparedNormal = toPreparedSpell(normalSpell!);
    expect(preparedNormal.concentration).toBe(false);
    expect(preparedNormal.ritual).toBe(false);
  });
});
