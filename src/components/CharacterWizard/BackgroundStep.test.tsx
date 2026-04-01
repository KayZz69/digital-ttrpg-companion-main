import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackgroundStep, getSkillOverlaps } from "./BackgroundStep";
import { DnD5eCharacter } from "@/types/character";
import { getAllBackgrounds } from "@/data/backgrounds";

function makePartialCharacter(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return {
    class: "Fighter",
    skills: {},
    ...overrides,
  };
}

describe("getSkillOverlaps", () => {
  it("returns skills present in both background and class lists", () => {
    const overlaps = getSkillOverlaps(
      ["Athletics", "Intimidation"],
      ["Athletics", "Acrobatics", "Perception"]
    );
    expect(overlaps).toEqual(["Athletics"]);
  });

  it("returns empty array when there is no overlap", () => {
    const overlaps = getSkillOverlaps(
      ["Arcana", "History"],
      ["Athletics", "Acrobatics"]
    );
    expect(overlaps).toEqual([]);
  });

  it("returns all skills when they fully overlap", () => {
    const overlaps = getSkillOverlaps(
      ["Athletics", "Intimidation"],
      ["Athletics", "Intimidation", "Perception"]
    );
    expect(overlaps).toEqual(["Athletics", "Intimidation"]);
  });
});

describe("BackgroundStep", () => {
  it("renders all 13 backgrounds", () => {
    const setCharacter = vi.fn();
    render(
      <BackgroundStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    const backgrounds = getAllBackgrounds();
    backgrounds.forEach((bg) => {
      expect(screen.getByText(bg.name)).toBeInTheDocument();
    });
  });

  it("displays skills, tools, languages, equipment, and feat for a background", () => {
    const setCharacter = vi.fn();
    render(
      <BackgroundStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    // Criminal has: skills [Deception, Stealth], tools [Thieves' tools],
    // equipment, feat "Alert"
    // Deception and Stealth appear in multiple backgrounds, so use getAllByText
    expect(screen.getAllByText("Deception").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Stealth").length).toBeGreaterThanOrEqual(1);
    // Thieves' tools appears in Criminal and Urchin
    expect(screen.getAllByText("Thieves' tools").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Alert")).toBeInTheDocument();
  });

  it("displays languages when background grants them", () => {
    const setCharacter = vi.fn();
    render(
      <BackgroundStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    // Acolyte has 2 language choices
    const languageBadges = screen.getAllByText("Language of your choice");
    expect(languageBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("displays equipment as a comma-separated list", () => {
    const setCharacter = vi.fn();
    render(
      <BackgroundStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    // Criminal equipment includes "Crowbar"
    expect(screen.getByText(/Crowbar/)).toBeInTheDocument();
  });

  it("applies all grants when a background is selected", () => {
    const setCharacter = vi.fn();
    render(
      <BackgroundStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    const criminalCard = screen.getByText("Criminal").closest("[class*='cursor-pointer']");
    expect(criminalCard).toBeTruthy();
    fireEvent.click(criminalCard!);

    expect(setCharacter).toHaveBeenCalledTimes(1);
    const updatedChar = setCharacter.mock.calls[0][0];

    expect(updatedChar.background).toBe("Criminal");
    expect(updatedChar.backgroundSkills).toEqual(["Deception", "Stealth"]);
    expect(updatedChar.backgroundTools).toEqual(["Thieves' tools"]);
    expect(updatedChar.backgroundFeat).toBe("Alert");
    expect(updatedChar.backgroundEquipment).toEqual([
      "Crowbar",
      "Dark common clothes with hood",
      "2 daggers",
      "15 GP",
    ]);
    expect(updatedChar.skills.Deception).toBe("proficient");
    expect(updatedChar.skills.Stealth).toBe("proficient");
  });

  it("clears previous background skills when switching backgrounds", () => {
    const setCharacter = vi.fn();
    render(
      <BackgroundStep
        character={makePartialCharacter({
          background: "Criminal",
          backgroundSkills: ["Deception", "Stealth"],
          skills: { Deception: "proficient", Stealth: "proficient" },
        })}
        setCharacter={setCharacter}
      />
    );

    const sageCard = screen.getByText("Sage").closest("[class*='cursor-pointer']");
    fireEvent.click(sageCard!);

    const updatedChar = setCharacter.mock.calls[0][0];
    expect(updatedChar.background).toBe("Sage");
    expect(updatedChar.backgroundSkills).toEqual(["Arcana", "History"]);
    // Old background skills should be cleared
    expect(updatedChar.skills.Deception).toBeUndefined();
    expect(updatedChar.skills.Stealth).toBeUndefined();
    // New background skills should be applied
    expect(updatedChar.skills.Arcana).toBe("proficient");
    expect(updatedChar.skills.History).toBe("proficient");
  });

  it("shows overlap warning when background skills overlap with class skills", () => {
    const setCharacter = vi.fn();
    // Soldier grants Athletics + Intimidation, Fighter class has both in its skill list
    render(
      <BackgroundStep
        character={makePartialCharacter({
          class: "Fighter",
          background: "Soldier",
          backgroundSkills: ["Athletics", "Intimidation"],
        })}
        setCharacter={setCharacter}
      />
    );

    expect(screen.getByText(/overlap/i)).toBeInTheDocument();
    expect(screen.getByText(/Athletics, Intimidation/)).toBeInTheDocument();
  });

  it("does not show overlap warning when there is no overlap", () => {
    const setCharacter = vi.fn();
    // Sage grants Arcana + History, Barbarian doesn't have those in its skill list
    render(
      <BackgroundStep
        character={makePartialCharacter({
          class: "Barbarian",
          background: "Sage",
          backgroundSkills: ["Arcana", "History"],
        })}
        setCharacter={setCharacter}
      />
    );

    expect(screen.queryByText(/overlap/i)).not.toBeInTheDocument();
  });

  it("does not set backgroundTools when background has no tools", () => {
    const setCharacter = vi.fn();
    render(
      <BackgroundStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    // Acolyte has no tool proficiencies
    const acolyteCard = screen.getByText("Acolyte").closest("[class*='cursor-pointer']");
    fireEvent.click(acolyteCard!);

    const updatedChar = setCharacter.mock.calls[0][0];
    expect(updatedChar.backgroundTools).toBeUndefined();
  });

  it("displays origin feat label for backgrounds with feats", () => {
    const setCharacter = vi.fn();
    render(
      <BackgroundStep
        character={makePartialCharacter()}
        setCharacter={setCharacter}
      />
    );

    // All 13 backgrounds have origin feats in 2024 PHB data
    const featLabels = screen.getAllByText("Origin Feat:");
    expect(featLabels.length).toBe(13);
  });
});
