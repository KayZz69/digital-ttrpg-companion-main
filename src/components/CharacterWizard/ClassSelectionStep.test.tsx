import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClassSelectionStep } from "./ClassSelectionStep";
import { DnD5eCharacter } from "@/types/character";
import { getAllClasses } from "@/data/classes";

function makePartialCharacter(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return {
    class: "",
    skills: {},
    ...overrides,
  };
}

describe("ClassSelectionStep", () => {
  it("renders all 12 core class cards", () => {
    const setCharacter = vi.fn();
    render(
      <ClassSelectionStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    const classes = getAllClasses();
    expect(classes).toHaveLength(12);
    classes.forEach((cls) => {
      expect(screen.getByText(cls.name)).toBeInTheDocument();
    });
  });

  it("each card shows class name and hit die", () => {
    const setCharacter = vi.fn();
    render(
      <ClassSelectionStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    const classes = getAllClasses();
    classes.forEach((cls) => {
      expect(screen.getByText(cls.name)).toBeInTheDocument();
    });

    // Verify hit die values are present (some are shared across classes, so use getAllByText)
    const hitDieValues = new Set(classes.map((cls) => cls.hitDie));
    hitDieValues.forEach((hitDie) => {
      const matchingClasses = classes.filter((cls) => cls.hitDie === hitDie);
      const elements = screen.getAllByText(`Hit Die: d${hitDie}`);
      expect(elements).toHaveLength(matchingClasses.length);
    });
  });

  it("clicking a class card calls setCharacter with class, classId, spellcastingAbility, and savingThrows", () => {
    const setCharacter = vi.fn();
    render(
      <ClassSelectionStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    const wizardCard = screen.getByText("Wizard").closest("[class*='cursor-pointer']");
    expect(wizardCard).toBeTruthy();
    fireEvent.click(wizardCard!);

    expect(setCharacter).toHaveBeenCalledTimes(1);
    const updated = setCharacter.mock.calls[0][0];
    expect(updated.class).toBe("Wizard");
    expect(updated.classId).toBe("wizard");
    expect(updated.spellcastingAbility).toBe("intelligence");
    expect(updated.savingThrows).toEqual({
      intelligence: true,
      wisdom: true,
    });
  });

  it("selected class card has visual distinction", () => {
    const setCharacter = vi.fn();
    render(
      <ClassSelectionStep
        character={makePartialCharacter({ class: "Fighter" })}
        setCharacter={setCharacter}
      />
    );

    // The selected card should show a "Selected:" summary at the bottom
    const selectedText = screen.getByText(/Selected:/);
    expect(selectedText).toBeInTheDocument();
    // The selected class name should appear within the same card as the "Selected:" label
    const selectedCard = selectedText.closest("[class*='border-primary']");
    expect(selectedCard).toBeTruthy();
    expect(selectedCard!.textContent).toContain("Fighter");
  });

  it("shows spellcasting info for caster classes", () => {
    const setCharacter = vi.fn();
    render(
      <ClassSelectionStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    // Wizard is the only intelligence caster
    expect(screen.getByText("Spellcaster (intelligence)")).toBeInTheDocument();
    // Cleric, Druid, Ranger all cast with wisdom
    expect(screen.getAllByText("Spellcaster (wisdom)")).toHaveLength(3);
    // Bard, Paladin, Sorcerer, Warlock cast with charisma
    expect(screen.getAllByText("Spellcaster (charisma)")).toHaveLength(4);
  });

  it("does not show spellcasting info for non-caster classes", () => {
    const setCharacter = vi.fn();
    render(
      <ClassSelectionStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    // Fighter, Barbarian, Monk, Rogue have no spellcasting
    // The total number of "Spellcaster" labels should equal the number of caster classes
    const casterClasses = getAllClasses().filter((cls) => cls.spellcasting);
    const spellcasterLabels = screen.getAllByText(/^Spellcaster \(/);
    expect(spellcasterLabels).toHaveLength(casterClasses.length);
  });

  it("switching classes updates character state properly", () => {
    const setCharacter = vi.fn();
    const { rerender } = render(
      <ClassSelectionStep
        character={makePartialCharacter({ class: "Fighter" })}
        setCharacter={setCharacter}
      />
    );

    // Switch to Cleric
    const clericCard = screen.getByText("Cleric").closest("[class*='cursor-pointer']");
    fireEvent.click(clericCard!);

    expect(setCharacter).toHaveBeenCalledTimes(1);
    const updated = setCharacter.mock.calls[0][0];
    expect(updated.class).toBe("Cleric");
    expect(updated.classId).toBe("cleric");
    expect(updated.spellcastingAbility).toBe("wisdom");
    expect(updated.savingThrows).toEqual({
      wisdom: true,
      charisma: true,
    });
  });

  it("clicking a non-caster class sets spellcastingAbility to undefined", () => {
    const setCharacter = vi.fn();
    render(
      <ClassSelectionStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    const fighterCard = screen.getByText("Fighter").closest("[class*='cursor-pointer']");
    fireEvent.click(fighterCard!);

    const updated = setCharacter.mock.calls[0][0];
    expect(updated.class).toBe("Fighter");
    expect(updated.spellcastingAbility).toBeUndefined();
  });
});
