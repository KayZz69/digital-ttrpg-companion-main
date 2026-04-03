import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SavingThrowsStep } from "./SavingThrowsStep";
import { DnD5eCharacter } from "@/types/character";

const BASE_SCORES = {
  strength: 16,
  dexterity: 12,
  constitution: 14,
  intelligence: 10,
  wisdom: 8,
  charisma: 13,
};

function makeCharacter(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return {
    class: "Fighter",
    level: 1,
    abilityScores: { ...BASE_SCORES },
    skills: {},
    ...overrides,
  };
}

describe("SavingThrowsStep", () => {
  it("renders all 6 saving throw abilities", () => {
    render(
      <SavingThrowsStep
        character={makeCharacter()}
        setCharacter={vi.fn()}
      />
    );

    expect(screen.getByText("Strength")).toBeInTheDocument();
    expect(screen.getByText("Dexterity")).toBeInTheDocument();
    expect(screen.getByText("Constitution")).toBeInTheDocument();
    expect(screen.getByText("Intelligence")).toBeInTheDocument();
    expect(screen.getByText("Wisdom")).toBeInTheDocument();
    expect(screen.getByText("Charisma")).toBeInTheDocument();
  });

  it("shows correct proficiencies for Fighter (Strength, Constitution)", () => {
    render(
      <SavingThrowsStep
        character={makeCharacter({ class: "Fighter" })}
        setCharacter={vi.fn()}
      />
    );

    const proficientBadges = screen.getAllByText("Proficient");
    expect(proficientBadges).toHaveLength(2);

    // Strength and Constitution checkboxes should be checked
    const strCheckbox = screen.getByLabelText("Strength saving throw proficiency");
    const conCheckbox = screen.getByLabelText("Constitution saving throw proficiency");
    expect(strCheckbox).toBeChecked();
    expect(conCheckbox).toBeChecked();

    // Non-proficient saves should not be checked
    const dexCheckbox = screen.getByLabelText("Dexterity saving throw proficiency");
    const intCheckbox = screen.getByLabelText("Intelligence saving throw proficiency");
    expect(dexCheckbox).not.toBeChecked();
    expect(intCheckbox).not.toBeChecked();
  });

  it("shows correct proficiencies for Wizard (Intelligence, Wisdom)", () => {
    render(
      <SavingThrowsStep
        character={makeCharacter({ class: "Wizard" })}
        setCharacter={vi.fn()}
      />
    );

    const proficientBadges = screen.getAllByText("Proficient");
    expect(proficientBadges).toHaveLength(2);

    const intCheckbox = screen.getByLabelText("Intelligence saving throw proficiency");
    const wisCheckbox = screen.getByLabelText("Wisdom saving throw proficiency");
    expect(intCheckbox).toBeChecked();
    expect(wisCheckbox).toBeChecked();

    const strCheckbox = screen.getByLabelText("Strength saving throw proficiency");
    const chaCheckbox = screen.getByLabelText("Charisma saving throw proficiency");
    expect(strCheckbox).not.toBeChecked();
    expect(chaCheckbox).not.toBeChecked();
  });

  it("checkboxes are disabled (read-only display)", () => {
    render(
      <SavingThrowsStep
        character={makeCharacter()}
        setCharacter={vi.fn()}
      />
    );

    const strCheckbox = screen.getByLabelText("Strength saving throw proficiency");
    const dexCheckbox = screen.getByLabelText("Dexterity saving throw proficiency");
    const conCheckbox = screen.getByLabelText("Constitution saving throw proficiency");
    const intCheckbox = screen.getByLabelText("Intelligence saving throw proficiency");
    const wisCheckbox = screen.getByLabelText("Wisdom saving throw proficiency");
    const chaCheckbox = screen.getByLabelText("Charisma saving throw proficiency");

    expect(strCheckbox).toBeDisabled();
    expect(dexCheckbox).toBeDisabled();
    expect(conCheckbox).toBeDisabled();
    expect(intCheckbox).toBeDisabled();
    expect(wisCheckbox).toBeDisabled();
    expect(chaCheckbox).toBeDisabled();
  });

  it("shows proficiency badge for proficient saves", () => {
    render(
      <SavingThrowsStep
        character={makeCharacter({ class: "Fighter" })}
        setCharacter={vi.fn()}
      />
    );

    const proficientBadges = screen.getAllByText("Proficient");
    // Fighter has 2 proficient saves: Strength and Constitution
    expect(proficientBadges).toHaveLength(2);
  });

  it("displays save modifiers correctly based on ability scores", () => {
    // Fighter: proficient in STR and CON, level 1 (prof bonus +2)
    // STR 16 -> mod +3, proficient -> +5
    // DEX 12 -> mod +1, not proficient -> +1
    // CON 14 -> mod +2, proficient -> +4
    // INT 10 -> mod +0, not proficient -> +0
    // WIS 8 -> mod -1, not proficient -> -1
    // CHA 13 -> mod +1, not proficient -> +1
    render(
      <SavingThrowsStep
        character={makeCharacter({ class: "Fighter" })}
        setCharacter={vi.fn()}
      />
    );

    expect(screen.getByText("+5")).toBeInTheDocument(); // STR save
    expect(screen.getByText("+4")).toBeInTheDocument(); // CON save
    expect(screen.getByText("-1")).toBeInTheDocument(); // WIS save
  });

  it("shows class-specific info text", () => {
    render(
      <SavingThrowsStep
        character={makeCharacter({ class: "Fighter" })}
        setCharacter={vi.fn()}
      />
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/Fighter/);
    expect(alert).toHaveTextContent(/Strength and Constitution/);
    expect(alert).toHaveTextContent(/saving throws/);
  });
});
