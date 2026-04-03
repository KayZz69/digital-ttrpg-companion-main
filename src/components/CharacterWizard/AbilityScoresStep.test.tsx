import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import { AbilityScoresStep } from "./AbilityScoresStep";
import { DnD5eCharacter } from "@/types/character";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

const DEFAULT_SCORES = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

function makePartialCharacter(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return {
    class: "Fighter",
    skills: {},
    abilityScores: { ...DEFAULT_SCORES },
    ...overrides,
  };
}

function activateTab(name: string) {
  const tab = screen.getByRole("tab", { name: new RegExp(name) });
  act(() => {
    tab.focus();
    fireEvent.keyDown(tab, { key: "Enter" });
  });
}

describe("AbilityScoresStep", () => {
  it("renders all 6 ability score labels", () => {
    render(
      <AbilityScoresStep
        character={makePartialCharacter()}
        setCharacter={vi.fn()}
      />
    );

    expect(screen.getByText("STR")).toBeInTheDocument();
    expect(screen.getByText("DEX")).toBeInTheDocument();
    expect(screen.getByText("CON")).toBeInTheDocument();
    expect(screen.getByText("INT")).toBeInTheDocument();
    expect(screen.getByText("WIS")).toBeInTheDocument();
    expect(screen.getByText("CHA")).toBeInTheDocument();
  });

  it("shows method tabs (Roll, Standard, Point Buy, Manual)", () => {
    render(
      <AbilityScoresStep
        character={makePartialCharacter()}
        setCharacter={vi.fn()}
      />
    );

    expect(screen.getByRole("tab", { name: /Roll/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Standard/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Point Buy/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Manual/ })).toBeInTheDocument();
  });

  it("Standard Array tab shows select dropdowns for score assignment", () => {
    render(
      <AbilityScoresStep
        character={makePartialCharacter()}
        setCharacter={vi.fn()}
      />
    );

    activateTab("Standard");

    // After switching to Standard, each ability should have a <select> element
    const abilities = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    abilities.forEach((ability) => {
      const el = document.getElementById(ability);
      expect(el).toBeTruthy();
      expect(el!.tagName).toBe("SELECT");
    });
  });

  it("Point Buy tab shows +/- buttons and points remaining counter", () => {
    render(
      <AbilityScoresStep
        character={makePartialCharacter({
          abilityScores: {
            strength: 8,
            dexterity: 8,
            constitution: 8,
            intelligence: 8,
            wisdom: 8,
            charisma: 8,
          },
        })}
        setCharacter={vi.fn()}
      />
    );

    activateTab("Point Buy");

    // Should show 27 points remaining
    expect(screen.getByText("27")).toBeInTheDocument();
    expect(screen.getByText("Points Left")).toBeInTheDocument();

    // Should have 6 "+" buttons and 6 "-" buttons
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    const minusButtons = screen.getAllByRole("button", { name: "-" });
    expect(plusButtons).toHaveLength(6);
    expect(minusButtons).toHaveLength(6);
  });

  it("Point Buy: - button disabled at score 8", () => {
    render(
      <AbilityScoresStep
        character={makePartialCharacter({
          abilityScores: {
            strength: 8,
            dexterity: 8,
            constitution: 8,
            intelligence: 8,
            wisdom: 8,
            charisma: 8,
          },
        })}
        setCharacter={vi.fn()}
      />
    );

    activateTab("Point Buy");

    const minusButtons = screen.getAllByRole("button", { name: "-" });
    // All minus buttons should be disabled at score 8
    minusButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("Point Buy: + button disabled at score 15", () => {
    render(
      <AbilityScoresStep
        character={makePartialCharacter({
          abilityScores: {
            strength: 15,
            dexterity: 8,
            constitution: 8,
            intelligence: 8,
            wisdom: 8,
            charisma: 8,
          },
        })}
        setCharacter={vi.fn()}
      />
    );

    activateTab("Point Buy");

    // The first + button (for strength at 15) should be disabled
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    expect(plusButtons[0]).toBeDisabled();
  });

  it("Manual tab shows number inputs", () => {
    render(
      <AbilityScoresStep
        character={makePartialCharacter()}
        setCharacter={vi.fn()}
      />
    );

    activateTab("Manual");

    // Should have 6 spinbutton inputs for the abilities
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs).toHaveLength(6);
  });

  it("modifier display is correct (e.g., score 14 -> +2, score 8 -> -1)", () => {
    render(
      <AbilityScoresStep
        character={makePartialCharacter({
          abilityScores: {
            strength: 14,
            dexterity: 8,
            constitution: 10,
            intelligence: 15,
            wisdom: 12,
            charisma: 13,
          },
        })}
        setCharacter={vi.fn()}
      />
    );

    // Score 14 -> +2, Score 15 -> +2
    expect(screen.getAllByText("+2")).toHaveLength(2);
    // Score 8 -> -1
    expect(screen.getByText("-1")).toBeInTheDocument();
    // Score 10 -> +0
    expect(screen.getByText("+0")).toBeInTheDocument();
    // Score 12 -> +1, Score 13 -> +1
    expect(screen.getAllByText("+1")).toHaveLength(2);
  });

  it("calls setCharacter when scores change via Manual input", () => {
    const setCharacter = vi.fn();
    render(
      <AbilityScoresStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    activateTab("Manual");

    const inputs = screen.getAllByRole("spinbutton");
    // Change the first input (strength)
    fireEvent.change(inputs[0], { target: { value: "16" } });

    expect(setCharacter).toHaveBeenCalled();
    const updated = setCharacter.mock.calls[0][0];
    expect(updated.abilityScores.strength).toBe(16);
  });

  it("calls setCharacter when Point Buy + button is clicked", () => {
    const setCharacter = vi.fn();
    render(
      <AbilityScoresStep
        character={makePartialCharacter({
          abilityScores: {
            strength: 8,
            dexterity: 8,
            constitution: 8,
            intelligence: 8,
            wisdom: 8,
            charisma: 8,
          },
        })}
        setCharacter={setCharacter}
      />
    );

    activateTab("Point Buy");

    const plusButtons = screen.getAllByRole("button", { name: "+" });
    fireEvent.click(plusButtons[0]);

    expect(setCharacter).toHaveBeenCalled();
    const updated = setCharacter.mock.calls[0][0];
    expect(updated.abilityScores.strength).toBe(9);
  });
});
