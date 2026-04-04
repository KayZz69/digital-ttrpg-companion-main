import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BasicInfoStep } from "./BasicInfoStep";
import { DnD5eCharacter } from "@/types/character";

function makePartialCharacter(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return {
    class: "Fighter",
    skills: {},
    ...overrides,
  };
}

describe("BasicInfoStep", () => {
  it("renders character name input field", () => {
    const setCharacter = vi.fn();
    render(
      <BasicInfoStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    expect(screen.getByRole("textbox", { name: /character name/i })).toBeInTheDocument();
  });

  it("shows placeholder text", () => {
    const setCharacter = vi.fn();
    render(
      <BasicInfoStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    expect(screen.getByPlaceholderText("e.g., Thorin Ironforge")).toBeInTheDocument();
  });

  it("input is autofocused", () => {
    const setCharacter = vi.fn();
    render(
      <BasicInfoStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    const input = screen.getByRole("textbox", { name: /character name/i });
    expect(input).toHaveFocus();
  });

  it("renders guidance tips", () => {
    const setCharacter = vi.fn();
    render(
      <BasicInfoStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    expect(screen.getByText("Tips for choosing a name:")).toBeInTheDocument();
    expect(screen.getByText(/Consider your character's background/)).toBeInTheDocument();
    expect(screen.getByText(/Think about their race/)).toBeInTheDocument();
    expect(screen.getByText(/Make it memorable/)).toBeInTheDocument();
  });

  it("calls setCharacter when name is typed", () => {
    const setCharacter = vi.fn();
    render(
      <BasicInfoStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    const input = screen.getByRole("textbox", { name: /character name/i });
    fireEvent.change(input, { target: { value: "Gandalf" } });

    expect(setCharacter).toHaveBeenCalledTimes(1);
    expect(setCharacter).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Gandalf" })
    );
  });

  it("displays existing character name", () => {
    const setCharacter = vi.fn();
    render(
      <BasicInfoStep
        character={makePartialCharacter({ name: "Thorin" })}
        setCharacter={setCharacter}
      />
    );

    const input = screen.getByRole("textbox", { name: /character name/i });
    expect(input).toHaveValue("Thorin");
  });
});
