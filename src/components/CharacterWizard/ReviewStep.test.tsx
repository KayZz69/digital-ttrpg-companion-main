import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewStep } from "./ReviewStep";
import { DnD5eCharacter } from "@/types/character";

function makeCharacter(overrides: Partial<DnD5eCharacter> = {}): Partial<DnD5eCharacter> {
  return {
    name: "Test Hero",
    race: "Human",
    class: "Fighter",
    level: 1,
    background: "Soldier",
    abilityScores: {
      strength: 16, dexterity: 14, constitution: 14,
      intelligence: 10, wisdom: 12, charisma: 8,
    },
    skills: {
      Athletics: "proficient",
      Intimidation: "proficient",
      Perception: "proficient",
    },
    backgroundSkills: ["Athletics", "Intimidation"],
    backgroundTools: ["Dice set", "Vehicles (land)"],
    backgroundLanguages: [],
    backgroundEquipment: ["An insignia of rank", "A trophy", "A set of bone dice", "Common clothes", "A belt pouch containing 10 gp"],
    backgroundFeat: "Savage Attacker",
    savingThrows: { strength: true, dexterity: false, constitution: true, intelligence: false, wisdom: false, charisma: false },
    inventory: [
      { id: "1", name: "Chain Mail", quantity: 1, weight: 55, equipped: false },
      { id: "2", name: "Longsword", quantity: 1, weight: 3, equipped: false },
      { id: "3", name: "Shield", quantity: 1, weight: 6, equipped: false },
    ],
    equipmentSelectionMode: "packages",
    preparedSpells: [],
    ...overrides,
  };
}

function makeSpellcaster(): Partial<DnD5eCharacter> {
  return makeCharacter({
    class: "Wizard",
    background: "Sage",
    backgroundSkills: ["Arcana", "History"],
    backgroundFeat: "Magic Initiate",
    skills: {
      Arcana: "proficient",
      History: "proficient",
      Investigation: "proficient",
      Insight: "proficient",
    },
    abilityScores: {
      strength: 8, dexterity: 14, constitution: 14,
      intelligence: 16, wisdom: 12, charisma: 10,
    },
    savingThrows: { strength: false, dexterity: false, constitution: false, intelligence: true, wisdom: true, charisma: false },
    preparedSpells: [
      { id: "1", name: "Fire Bolt", level: 0, school: "Evocation" },
      { id: "2", name: "Mage Hand", level: 0, school: "Conjuration" },
      { id: "3", name: "Light", level: 0, school: "Evocation" },
      { id: "4", name: "Magic Missile", level: 1, school: "Evocation" },
      { id: "5", name: "Shield", level: 1, school: "Abjuration" },
    ],
  });
}

describe("ReviewStep", () => {
  it("renders character basic info", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    expect(screen.getAllByText("Test Hero").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Human")).toBeInTheDocument();
    expect(screen.getByText("Fighter")).toBeInTheDocument();
  });

  it("renders ability scores with modifiers", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    // STR 16 = +3 modifier
    expect(screen.getByTestId("ability-strength")).toHaveTextContent("16");
    expect(screen.getByTestId("ability-strength")).toHaveTextContent("+3");
  });

  it("renders background grants section", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    expect(screen.getByText("Background: Soldier")).toBeInTheDocument();
    expect(screen.getByText("Savage Attacker")).toBeInTheDocument();
    expect(screen.getByText("Dice set, Vehicles (land)")).toBeInTheDocument();
  });

  it("renders skill sources (background vs class)", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    expect(screen.getByText("Background Skills")).toBeInTheDocument();
    expect(screen.getByText("Class Skill Choices")).toBeInTheDocument();
  });

  it("renders saving throw proficiencies", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    expect(screen.getByText("Saving Throws")).toBeInTheDocument();
  });

  it("renders equipment inventory", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    // "Starting Equipment" appears in both background grants and equipment card
    expect(screen.getAllByText("Starting Equipment").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Chain Mail")).toBeInTheDocument();
    expect(screen.getByText("Longsword")).toBeInTheDocument();
    expect(screen.getAllByText("Class package").length).toBeGreaterThanOrEqual(1);
  });

  it("renders spells grouped by level for spellcasters", () => {
    render(<ReviewStep character={makeSpellcaster()} setCharacter={vi.fn()} />);
    expect(screen.getByText("Spells")).toBeInTheDocument();
    expect(screen.getByText("Cantrips")).toBeInTheDocument();
    // "Level 1" may appear in both the character level badge and spell grouping
    expect(screen.getAllByText("Level 1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Fire Bolt")).toBeInTheDocument();
    expect(screen.getByText("Magic Missile")).toBeInTheDocument();
  });

  it("does not render spells section for non-casters", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    expect(screen.queryByText("Cantrips")).not.toBeInTheDocument();
  });

  it("renders expertise badges when present", () => {
    const char = makeCharacter({
      class: "Rogue",
      skills: {
        Athletics: "proficient",
        Intimidation: "proficient",
        Stealth: "expert",
        Perception: "expert",
      },
    });
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);
    expect(screen.getByText("Expertise")).toBeInTheDocument();
    expect(screen.getByText("Stealth")).toBeInTheDocument();
    expect(screen.getByText("Perception")).toBeInTheDocument();
  });

  it("shows racial ability bonuses in ability score display", () => {
    const char = makeCharacter({
      race: "Dwarf",
      raceAbilityBonuses: { constitution: 2 },
      abilityScores: {
        strength: 16, dexterity: 14, constitution: 14,
        intelligence: 10, wisdom: 12, charisma: 8,
      },
    });
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);
    // CON should show 16 (14 + 2 racial)
    expect(screen.getByTestId("racial-bonus-constitution")).toHaveTextContent("14 + 2 racial");
  });

  it("shows gold-buy equipment mode label", () => {
    const char = makeCharacter({ equipmentSelectionMode: "gold-buy" });
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);
    expect(screen.getByText("Gold-buy selection")).toBeInTheDocument();
  });
});
