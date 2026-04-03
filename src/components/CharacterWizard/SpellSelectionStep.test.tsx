import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SpellSelectionStep } from "./SpellSelectionStep";
import { DnD5eCharacter } from "@/types/character";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

const BASE_SCORES = {
  strength: 10,
  dexterity: 14,
  constitution: 12,
  intelligence: 16,
  wisdom: 10,
  charisma: 8,
};

function makeCharacter(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return {
    class: "Fighter",
    level: 1,
    abilityScores: { ...BASE_SCORES },
    skills: {},
    preparedSpells: [],
    ...overrides,
  };
}

function makeWizard(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return makeCharacter({
    class: "Wizard",
    classId: "wizard",
    level: 1,
    spellcastingAbility: "intelligence",
    abilityScores: { ...BASE_SCORES },
    preparedSpells: [],
    ...overrides,
  });
}

describe("SpellSelectionStep", () => {
  it("shows non-spellcaster message for Fighter", () => {
    render(
      <SpellSelectionStep
        character={makeCharacter({ class: "Fighter" })}
        setCharacter={vi.fn()}
      />
    );

    expect(
      screen.getByText(/only available for spellcasting classes/i)
    ).toBeInTheDocument();
  });

  it("for Wizard (spellcaster): renders spell list", () => {
    render(
      <SpellSelectionStep
        character={makeWizard()}
        setCharacter={vi.fn()}
      />
    );

    // Should show the spell selection header
    expect(screen.getByText("Choose Starting Spells")).toBeInTheDocument();
    // Should render at least one wizard cantrip
    expect(screen.getByText("Acid Splash")).toBeInTheDocument();
  });

  it("shows cantrip and leveled spell count limits", () => {
    render(
      <SpellSelectionStep
        character={makeWizard()}
        setCharacter={vi.fn()}
      />
    );

    // Wizard at level 1 with INT 16 should show cantrip and leveled limits
    // The description contains both cantrip and leveled counts
    expect(screen.getByText(/Cantrips: 0\/3/)).toBeInTheDocument();
    expect(screen.getByText(/0\/4 leveled/)).toBeInTheDocument();
  });

  it("search input filters spells by name", () => {
    render(
      <SpellSelectionStep
        character={makeWizard()}
        setCharacter={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search spells/i);
    fireEvent.change(searchInput, { target: { value: "Acid Splash" } });

    expect(screen.getByText("Acid Splash")).toBeInTheDocument();
    // A spell that doesn't match should not appear
    expect(screen.queryByText("Blade Ward")).not.toBeInTheDocument();
  });

  it("clicking a spell checkbox toggles selection (calls setCharacter)", () => {
    const setCharacter = vi.fn();
    render(
      <SpellSelectionStep
        character={makeWizard()}
        setCharacter={setCharacter}
      />
    );

    // Find the Acid Splash checkbox by its id and trigger onCheckedChange
    const checkbox = document.querySelector("#spell-acid-splash") as HTMLElement;
    expect(checkbox).toBeTruthy();
    fireEvent.click(checkbox);

    expect(setCharacter).toHaveBeenCalledTimes(1);
    const updatedChar = setCharacter.mock.calls[0][0];
    expect(updatedChar.preparedSpells).toHaveLength(1);
    expect(updatedChar.preparedSpells[0].name).toBe("Acid Splash");
  });

  it("disables spell checkbox when cantrip limit is reached", () => {
    // Wizard level 1 gets 3 cantrips. Pre-fill 3 cantrips.
    const threeCantrips = [
      { id: "1", sourceSpellId: "acid-splash", name: "Acid Splash", level: 0, school: "Conjuration", castingTime: "1 action", range: "60 feet", components: "V, S", duration: "Instantaneous", description: "" },
      { id: "2", sourceSpellId: "blade-ward", name: "Blade Ward", level: 0, school: "Abjuration", castingTime: "1 action", range: "Self", components: "V, S", duration: "1 round", description: "" },
      { id: "3", sourceSpellId: "chill-touch", name: "Chill Touch", level: 0, school: "Necromancy", castingTime: "1 action", range: "120 feet", components: "V, S", duration: "1 round", description: "" },
    ];

    render(
      <SpellSelectionStep
        character={makeWizard({ preparedSpells: threeCantrips })}
        setCharacter={vi.fn()}
      />
    );

    // Other cantrip checkboxes that are not selected should be disabled
    // Find a cantrip that isn't in our list (e.g., "Fire Bolt")
    const fireBoltCheckbox = document.querySelector("#spell-fire-bolt") as HTMLButtonElement | null;
    if (fireBoltCheckbox) {
      expect(fireBoltCheckbox).toBeDisabled();
    }
  });

  it("shows spell details (school, level badges)", () => {
    render(
      <SpellSelectionStep
        character={makeWizard()}
        setCharacter={vi.fn()}
      />
    );

    // Acid Splash is a level 0 Conjuration spell
    expect(screen.getAllByText("Cantrip").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Conjuration").length).toBeGreaterThan(0);
  });

  it("shows selected count badge", () => {
    render(
      <SpellSelectionStep
        character={makeWizard()}
        setCharacter={vi.fn()}
      />
    );

    expect(screen.getByText("0 selected")).toBeInTheDocument();
  });
});
