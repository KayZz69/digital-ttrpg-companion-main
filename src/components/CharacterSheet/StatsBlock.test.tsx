import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsBlock } from "./StatsBlock";
import { DnD5eAbilityScores } from "@/types/character";

// SavingThrowsManager is a complex sub-component; mock it to isolate StatsBlock
vi.mock("@/components/SavingThrowsManager", () => ({
  SavingThrowsManager: () => <div data-testid="saving-throws-manager" />,
}));

const abilityScores: DnD5eAbilityScores = {
  strength: 16,
  dexterity: 14,
  constitution: 13,
  intelligence: 10,
  wisdom: 15,
  charisma: 8,
};

const defaultProps = {
  abilityScores,
  level: 3,
  savingThrows: {},
  onUpdateSavingThrows: vi.fn(),
};

describe("StatsBlock", () => {
  it("renders without crashing", () => {
    render(<StatsBlock {...defaultProps} />);
    expect(screen.getByText("Ability Scores")).toBeInTheDocument();
  });

  it("displays all six ability scores with correct values", () => {
    render(<StatsBlock {...defaultProps} />);
    expect(screen.getByText("16")).toBeInTheDocument(); // STR
    expect(screen.getByText("14")).toBeInTheDocument(); // DEX
    expect(screen.getByText("13")).toBeInTheDocument(); // CON
    expect(screen.getByText("10")).toBeInTheDocument(); // INT
    expect(screen.getByText("15")).toBeInTheDocument(); // WIS
    expect(screen.getByText("8")).toBeInTheDocument();  // CHA
  });

  it("displays ability labels", () => {
    render(<StatsBlock {...defaultProps} />);
    expect(screen.getByText("STR")).toBeInTheDocument();
    expect(screen.getByText("DEX")).toBeInTheDocument();
    expect(screen.getByText("CON")).toBeInTheDocument();
    expect(screen.getByText("INT")).toBeInTheDocument();
    expect(screen.getByText("WIS")).toBeInTheDocument();
    expect(screen.getByText("CHA")).toBeInTheDocument();
  });

  it("displays modifiers (e.g., +3 for STR 16)", () => {
    render(<StatsBlock {...defaultProps} />);
    // STR 16 => +3, CHA 8 => -1
    expect(screen.getByText("+3")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    // DEX 14 => +2 and WIS 15 => +2 both yield +2
    expect(screen.getAllByText("+2")).toHaveLength(2);
  });

  it("displays passive Perception", () => {
    render(<StatsBlock {...defaultProps} />);
    // WIS 15 => mod +2, no perception proficiency, so passive = 10 + 2 = 12
    expect(screen.getByText("Passive Perception")).toBeInTheDocument();
    // The passive value 12 is rendered in a font-mono span next to the label
    const passiveLabel = screen.getByText("Passive Perception");
    const passiveRow = passiveLabel.closest("div");
    expect(passiveRow).toHaveTextContent("12");
  });

  it("shows passive Perception with proficiency when proficient in Perception", () => {
    render(
      <StatsBlock
        {...defaultProps}
        skills={{ Perception: "proficient" }}
      />
    );
    // WIS 15 => mod +2, proficient level 3 => prof bonus +2, passive = 10 + 2 + 2 = 14
    const passiveLabel = screen.getByText("Passive Perception");
    const passiveRow = passiveLabel.closest("div");
    expect(passiveRow).toHaveTextContent("14");
  });

  it("does not show Spell Save DC when no spellcasting ability", () => {
    render(<StatsBlock {...defaultProps} />);
    expect(screen.queryByText("Spell Save DC")).not.toBeInTheDocument();
    expect(screen.queryByText("Spell Attack Bonus")).not.toBeInTheDocument();
  });

  it("shows Spell Save DC and Spell Attack Bonus when spellcasting ability is set", () => {
    render(
      <StatsBlock
        {...defaultProps}
        spellcastingAbility="wisdom"
      />
    );
    // WIS 15 => mod +2, prof bonus at level 3 => +2
    // Spell Save DC = 8 + 2 + 2 = 12
    // Spell Attack Bonus = 2 + 2 = +4
    expect(screen.getByText("Spell Save DC")).toBeInTheDocument();
    expect(screen.getByText("Spell Attack Bonus")).toBeInTheDocument();
  });

  it("renders SavingThrowsManager sub-component", () => {
    render(<StatsBlock {...defaultProps} />);
    expect(screen.getByTestId("saving-throws-manager")).toBeInTheDocument();
  });
});
