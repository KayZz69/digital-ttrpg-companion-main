import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewStep } from "./ReviewStep";
import { DnD5eCharacter } from "@/types/character";

function makeCharacter(overrides: Partial<DnD5eCharacter> = {}): Partial<DnD5eCharacter> {
  return {
    name: "Thorn Ironbark",
    race: "Human",
    class: "Fighter",
    level: 1,
    abilityScores: {
      strength: 16,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 10,
      charisma: 8,
    },
    background: "Soldier",
    backgroundSkills: ["Athletics", "Intimidation"],
    backgroundTools: ["Land vehicles"],
    backgroundLanguages: [],
    backgroundEquipment: ["Insignia of rank", "Trophy", "Set of bone dice", "Common clothes", "10 GP"],
    backgroundFeat: "Savage Attacker",
    skills: {
      Athletics: "proficient",
      Intimidation: "proficient",
      Perception: "proficient",
      Survival: "proficient",
    },
    savingThrows: {
      strength: true,
      constitution: true,
    },
    inventory: [
      { id: "1", name: "Chain Mail", quantity: 1, weight: 55, equipped: true },
      { id: "2", name: "Longsword", quantity: 1, weight: 3, equipped: true },
      { id: "3", name: "Shield", quantity: 1, weight: 6, equipped: true },
      { id: "4", name: "Handaxe", quantity: 2, weight: 2, equipped: false },
    ],
    equipmentSelectionMode: "packages",
    raceAbilityBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    ...overrides,
  };
}

describe("ReviewStep", () => {
  it("renders character name, race, class, and level", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    expect(screen.getAllByText("Thorn Ironbark").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Human")).toBeInTheDocument();
    expect(screen.getAllByText("Fighter").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Level 1")).toBeInTheDocument();
  });

  it("shows ability scores with racial bonuses", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    // STR base 16 + 1 racial = 17
    const strBlock = screen.getByTestId("ability-strength");
    expect(strBlock).toHaveTextContent("17");
    expect(strBlock).toHaveTextContent("16 + 1 racial");
  });

  it("shows background skills grouped separately from class skills", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    expect(screen.getByText("Background Skills")).toBeInTheDocument();
    expect(screen.getByText("Class Skills")).toBeInTheDocument();

    // Background skills
    const bgSection = screen.getByText("Background Skills").closest("div")!;
    expect(bgSection.parentElement).toHaveTextContent("Athletics");
    expect(bgSection.parentElement).toHaveTextContent("Intimidation");

    // Class skills (not from background)
    const clsSection = screen.getByText("Class Skills").closest("div")!;
    expect(clsSection.parentElement).toHaveTextContent("Perception");
    expect(clsSection.parentElement).toHaveTextContent("Survival");
  });

  it("shows expertise skills with distinct badge", () => {
    const char = makeCharacter({
      class: "Rogue",
      skills: {
        Stealth: "expert",
        Deception: "proficient",
        Perception: "proficient",
      },
      backgroundSkills: ["Deception"],
    });
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);

    expect(screen.getAllByText("Expertise").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Stealth (Expertise)")).toBeInTheDocument();
  });

  it("shows saving throw proficiencies", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    expect(screen.getAllByText("Saving Throws").length).toBeGreaterThanOrEqual(1);
    // STR and CON appear in both ability scores and saving throws sections
    expect(screen.getAllByText("STR").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("CON").length).toBeGreaterThanOrEqual(2);
  });

  it("shows equipment list with quantities", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    expect(screen.getByText("Equipment & Inventory")).toBeInTheDocument();
    expect(screen.getByText("Chain Mail")).toBeInTheDocument();
    expect(screen.getByText("Longsword")).toBeInTheDocument();
    expect(screen.getByText("x2")).toBeInTheDocument(); // Handaxe quantity
  });

  it("shows equipment source as class package", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    // "Class package" appears in both the Equipment card description and the Summary card
    expect(screen.getAllByText(/Class package/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows equipment source as gold-buy", () => {
    render(
      <ReviewStep
        character={makeCharacter({ equipmentSelectionMode: "gold-buy" })}
        setCharacter={vi.fn()}
      />
    );

    // The Equipment card description shows "Gold-buy selection"
    expect(screen.getAllByText(/Gold-buy selection/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows background details", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    expect(screen.getByText("Background Details")).toBeInTheDocument();
    expect(screen.getByText("Tool Proficiencies")).toBeInTheDocument();
    expect(screen.getByText("Land vehicles")).toBeInTheDocument();
    expect(screen.getByText("Origin Feat")).toBeInTheDocument();
    expect(screen.getByText("Savage Attacker")).toBeInTheDocument();
    expect(screen.getByText(/Insignia of rank/)).toBeInTheDocument();
  });

  it("shows background languages when present", () => {
    const char = makeCharacter({
      backgroundLanguages: ["Elvish", "Dwarvish"],
    });
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);

    expect(screen.getByText("Elvish")).toBeInTheDocument();
    expect(screen.getByText("Dwarvish")).toBeInTheDocument();
  });

  it("shows HP preview with correct calculation", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    // Fighter hit die = 10, CON 14 (+1 racial = 15), mod = +2 => HP = 12
    const hpValue = screen.getByTestId("hp-value");
    expect(hpValue).toHaveTextContent("12");
    expect(screen.getAllByText("HP at Level 1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Hit Die: d10/)).toBeInTheDocument();
  });

  it("shows validation checklist with passing steps", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);

    expect(screen.getByText("Validation Checklist")).toBeInTheDocument();

    // All steps should pass for a complete character
    const nameCheck = screen.getByTestId("validation-name");
    expect(nameCheck.querySelector(".text-green-600, .dark\\:text-green-400")).toBeTruthy();

    const raceCheck = screen.getByTestId("validation-race");
    expect(raceCheck).toHaveTextContent("Race");

    const classCheck = screen.getByTestId("validation-class");
    expect(classCheck).toHaveTextContent("Class");
  });

  it("shows validation failures for incomplete character", () => {
    const char: Partial<DnD5eCharacter> = {
      name: "",
      race: undefined,
      class: "Fighter",
      level: 1,
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      skills: {},
      inventory: [],
    };
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);

    // Name is empty - should fail
    const nameCheck = screen.getByTestId("validation-name");
    expect(nameCheck.querySelector("svg")).toBeTruthy();

    // Race is missing - should fail
    const raceCheck = screen.getByTestId("validation-race");
    expect(raceCheck).toHaveTextContent("Race");

    // Equipment is empty - should fail
    const equipCheck = screen.getByTestId("validation-equipment");
    expect(equipCheck).toHaveTextContent("Equipment");
  });

  it("does not render skills section when no skills are set", () => {
    const char = makeCharacter({ skills: {}, backgroundSkills: [] });
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);

    expect(screen.queryByText("Skills & Proficiencies")).not.toBeInTheDocument();
  });

  it("derives saving throw proficiencies from class even when savingThrows is empty", () => {
    const char = makeCharacter({ savingThrows: {} });
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);

    // Fighter class grants Strength and Constitution saving throw proficiencies
    // even when savingThrows data is empty, the component derives them from class
    expect(screen.getByTestId("save-strength")).toBeInTheDocument();
    expect(screen.getByTestId("save-constitution")).toBeInTheDocument();
  });

  it("does not render equipment section when inventory is empty", () => {
    const char = makeCharacter({ inventory: [] });
    render(<ReviewStep character={char} setCharacter={vi.fn()} />);

    expect(screen.queryByText("Equipment & Inventory")).not.toBeInTheDocument();
  });
});
