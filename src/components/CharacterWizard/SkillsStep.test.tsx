import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillsStep } from "./SkillsStep";
import { DnD5eCharacter } from "@/types/character";

const BASE_SCORES = {
  strength: 10,
  dexterity: 14,
  constitution: 12,
  intelligence: 10,
  wisdom: 13,
  charisma: 8,
};

function makeCharacter(overrides: Partial<DnD5eCharacter> = {}): Partial<DnD5eCharacter> {
  return {
    name: "Test",
    race: "Human",
    class: "Fighter",
    level: 1,
    abilityScores: { ...BASE_SCORES },
    skills: {},
    backgroundSkills: [],
    ...overrides,
  };
}

describe("SkillsStep", () => {
  describe("expertise gating", () => {
    it("hides expertise checkboxes for classes that do not grant expertise at level 1", () => {
      const character = makeCharacter({ class: "Fighter" });
      render(<SkillsStep character={character} setCharacter={vi.fn()} />);

      // Fighter has no expertise at level 1
      const expertiseCheckboxes = screen.queryAllByLabelText(/expertise$/i);
      expect(expertiseCheckboxes).toHaveLength(0);
    });

    it("shows expertise checkboxes for Rogue at level 1", () => {
      const character = makeCharacter({ class: "Rogue" });
      render(<SkillsStep character={character} setCharacter={vi.fn()} />);

      // Rogue gets 2 expertise at level 1 — expertise checkboxes should be present
      const expertiseCheckboxes = screen.queryAllByLabelText(/expertise$/i);
      expect(expertiseCheckboxes.length).toBeGreaterThan(0);
    });

    it("shows expertise badge only when expertise is available", () => {
      const { rerender } = render(
        <SkillsStep character={makeCharacter({ class: "Wizard" })} setCharacter={vi.fn()} />
      );

      // Wizard has no expertise — expertise badge should not appear
      expect(screen.queryByText(/\d+ \/ \d+ Expertise/)).toBeNull();

      // Re-render as Rogue — badge should appear
      rerender(
        <SkillsStep character={makeCharacter({ class: "Rogue" })} setCharacter={vi.fn()} />
      );
      expect(screen.getByText(/0 \/ 2 Expertise/)).toBeDefined();
    });

    it("displays a rules note about expertise unavailability for non-expertise classes", () => {
      render(<SkillsStep character={makeCharacter({ class: "Fighter" })} setCharacter={vi.fn()} />);

      expect(
        screen.getByText(/Expertise is not available for your class at this level/)
      ).toBeDefined();
    });

    it("hides expertise checkboxes for Bard at level 1 (expertise unlocks at level 3)", () => {
      const character = makeCharacter({ class: "Bard", level: 1 });
      render(<SkillsStep character={character} setCharacter={vi.fn()} />);

      const expertiseCheckboxes = screen.queryAllByLabelText(/expertise$/i);
      expect(expertiseCheckboxes).toHaveLength(0);
    });
  });

  describe("skill count enforcement", () => {
    it("shows class pick counter", () => {
      const character = makeCharacter({ class: "Rogue" });
      render(<SkillsStep character={character} setCharacter={vi.fn()} />);

      // Rogue gets 4 skill picks
      expect(screen.getByText(/0 \/ 4 Class Picks/)).toBeDefined();
    });

    it("blocks selecting more skills than the class allows", () => {
      const setCharacter = vi.fn();
      // Rogue: choose 4 from list. Pre-fill 4 skills so limit is reached.
      const character = makeCharacter({
        class: "Rogue",
        skills: {
          "Stealth": "proficient",
          "Acrobatics": "proficient",
          "Deception": "proficient",
          "Insight": "proficient",
        },
      });
      render(<SkillsStep character={character} setCharacter={setCharacter} />);

      // The 4/4 badge should indicate the limit is reached
      expect(screen.getByText(/4 \/ 4 Class Picks/)).toBeDefined();

      // Attempt to click a 5th skill (Perception is available for Rogue)
      const perceptionCheckbox = screen.getByLabelText("Perception proficiency");
      fireEvent.click(perceptionCheckbox);

      // setCharacter should NOT have been called — the click is blocked
      expect(setCharacter).not.toHaveBeenCalled();
    });

    it("background skills do not count toward class pick limit", () => {
      const character = makeCharacter({
        class: "Rogue",
        backgroundSkills: ["Stealth"],
        skills: {
          "Stealth": "proficient",
          "Acrobatics": "proficient",
        },
      });
      render(<SkillsStep character={character} setCharacter={vi.fn()} />);

      // Stealth is a background skill so only Acrobatics counts as a class pick
      expect(screen.getByText(/1 \/ 4 Class Picks/)).toBeDefined();
    });

    it("labels background skills clearly", () => {
      const character = makeCharacter({
        class: "Rogue",
        backgroundSkills: ["Stealth"],
        skills: {
          "Stealth": "proficient",
        },
      });
      render(<SkillsStep character={character} setCharacter={vi.fn()} />);

      expect(screen.getByText("(Background)")).toBeDefined();
    });

    it("prevents toggling background skill proficiency off", () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({
        class: "Rogue",
        backgroundSkills: ["Stealth"],
        skills: {
          "Stealth": "proficient",
        },
      });
      render(<SkillsStep character={character} setCharacter={setCharacter} />);

      const stealthCheckbox = screen.getByLabelText("Stealth proficiency");
      fireEvent.click(stealthCheckbox);

      // Background skills are locked — setCharacter should not be called
      expect(setCharacter).not.toHaveBeenCalled();
    });
  });

  describe("over-selection warning", () => {
    it("shows a warning alert when class skill picks exceed the limit", () => {
      // This can happen if a class change leaves stale skills in state
      const character = makeCharacter({
        class: "Fighter", // Fighter: choose 2
        skills: {
          "Athletics": "proficient",
          "Perception": "proficient",
          "Intimidation": "proficient",
        },
      });
      render(<SkillsStep character={character} setCharacter={vi.fn()} />);

      expect(screen.getByText(/Too many skills selected/)).toBeDefined();
    });
  });
});
