import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewStep } from "./ReviewStep";
import { DnD5eCharacter } from "@/types/character";

function makeCharacter(
  overrides: Partial<DnD5eCharacter> = {}
): Partial<DnD5eCharacter> {
  return {
    name: "Thorin",
    race: "Dwarf",
    class: "Fighter",
    background: "Soldier",
    level: 1,
    abilityScores: {
      strength: 16,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 10,
      charisma: 8,
    },
    raceAbilityBonuses: { constitution: 2 },
    skills: {
      Athletics: "proficient",
      Intimidation: "proficient",
      Perception: "proficient",
      Insight: "proficient",
    },
    backgroundSkills: ["Athletics", "Intimidation"],
    backgroundTools: ["Dice set", "Vehicles (land)"],
    backgroundFeat: "Savage Attacker",
    savingThrows: { strength: true, constitution: true },
    inventory: [
      { id: "sword-1", name: "Longsword", quantity: 1, weight: 3, equipped: false },
      { id: "shield-1", name: "Shield", quantity: 1, weight: 6, equipped: false },
      { id: "arrows-1", name: "Arrows", quantity: 20, weight: 1, equipped: false },
    ],
    equipmentSelectionMode: "packages",
    startingEquipmentChoiceId: "fighter-martial-shield",
    ...overrides,
  };
}

describe("ReviewStep", () => {
  it("renders character name, race, class, and level", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    expect(screen.getAllByText("Thorin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dwarf").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Fighter").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Level 1").length).toBeGreaterThanOrEqual(1);
  });

  it("displays background name", () => {
    render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
    expect(screen.getAllByText(/Soldier/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows ability scores with racial bonuses", () => {
    const { container } = render(
      <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
    );
    const conBlock = container.querySelector('[data-testid="ability-constitution"]');
    expect(conBlock).toBeTruthy();
    expect(conBlock?.textContent).toContain("16");
    expect(conBlock?.textContent).toContain("14 + 2 racial");
  });

  describe("validation summary", () => {
    it("shows all-valid status for a complete character", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const summary = container.querySelector('[data-testid="validation-summary"]');
      expect(summary?.textContent).toContain("Ready to Create");
    });

    it("shows step badges with status", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      expect(container.querySelector('[data-testid="step-status-basic"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="step-status-race"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="step-status-equipment"]')).toBeTruthy();
    });

    it("flags incomplete steps", () => {
      const { container } = render(
        <ReviewStep
          character={makeCharacter({ name: "" })}
          setCharacter={vi.fn()}
        />
      );
      const summary = container.querySelector('[data-testid="validation-summary"]');
      expect(summary?.textContent).toContain("Steps Need Attention");
      expect(summary?.textContent).toContain("Enter a character name.");
    });
  });

  describe("hit points card", () => {
    it("displays calculated HP", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const hpCard = container.querySelector('[data-testid="hp-card"]');
      expect(hpCard).toBeTruthy();
      // Fighter: d10 + CON mod (+3 for 16 effective CON) = 13 HP
      expect(hpCard?.textContent).toContain("13");
      expect(hpCard?.textContent).toContain("HP at Level 1");
    });

    it("shows hit die and CON modifier breakdown", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const hpCard = container.querySelector('[data-testid="hp-card"]');
      expect(hpCard?.textContent).toContain("d10");
      expect(hpCard?.textContent).toContain("+3 CON modifier");
    });
  });

  describe("saving throws card", () => {
    it("displays class saving throw proficiencies", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const savesCard = container.querySelector('[data-testid="saves-card"]');
      expect(savesCard).toBeTruthy();
      expect(savesCard?.textContent).toContain("Strength");
      expect(savesCard?.textContent).toContain("Constitution");
    });
  });

  describe("skills card", () => {
    it("shows proficient skills", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const skillsCard = container.querySelector('[data-testid="skills-card"]');
      expect(skillsCard).toBeTruthy();
      expect(
        container.querySelector('[data-testid="skill-proficient-Athletics"]')
      ).toBeTruthy();
      expect(
        container.querySelector('[data-testid="skill-proficient-Intimidation"]')
      ).toBeTruthy();
    });

    it("marks background skills with (bg) indicator", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const athleticsBadge = container.querySelector(
        '[data-testid="skill-proficient-Athletics"]'
      );
      expect(athleticsBadge?.textContent).toContain("(bg)");
    });

    it("shows expertise skills separately", () => {
      const { container } = render(
        <ReviewStep
          character={makeCharacter({
            class: "Rogue",
            skills: {
              Stealth: "expert",
              Perception: "proficient",
              Thieves: "proficient",
              Athletics: "proficient",
              Intimidation: "proficient",
            },
          })}
          setCharacter={vi.fn()}
        />
      );
      expect(
        container.querySelector('[data-testid="skill-expert-Stealth"]')
      ).toBeTruthy();
    });
  });

  describe("background details card", () => {
    it("displays background skills, tools, and feat", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const bgCard = container.querySelector('[data-testid="background-card"]');
      expect(bgCard).toBeTruthy();
      expect(bgCard?.textContent).toContain("Dice set");
      expect(bgCard?.textContent).toContain("Vehicles (land)");
      expect(bgCard?.textContent).toContain("Savage Attacker");
    });

    it("hides background card when no background selected", () => {
      const { container } = render(
        <ReviewStep
          character={makeCharacter({ background: undefined })}
          setCharacter={vi.fn()}
        />
      );
      expect(
        container.querySelector('[data-testid="background-card"]')
      ).toBeNull();
    });
  });

  describe("equipment card", () => {
    it("lists inventory items", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const equipCard = container.querySelector('[data-testid="equipment-card"]');
      expect(equipCard).toBeTruthy();
      expect(equipCard?.textContent).toContain("Longsword");
      expect(equipCard?.textContent).toContain("Shield");
    });

    it("shows quantity for stacked items", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const equipCard = container.querySelector('[data-testid="equipment-card"]');
      expect(equipCard?.textContent).toContain("x20");
    });

    it("shows equipment source", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      const equipCard = container.querySelector('[data-testid="equipment-card"]');
      expect(equipCard?.textContent).toContain("Class package");
    });

    it("shows gold-buy source when applicable", () => {
      const { container } = render(
        <ReviewStep
          character={makeCharacter({ equipmentSelectionMode: "gold-buy" })}
          setCharacter={vi.fn()}
        />
      );
      const equipCard = container.querySelector('[data-testid="equipment-card"]');
      expect(equipCard?.textContent).toContain("Gold-buy selection");
    });

    it("hides equipment card when inventory is empty", () => {
      const { container } = render(
        <ReviewStep
          character={makeCharacter({ inventory: [] })}
          setCharacter={vi.fn()}
        />
      );
      expect(
        container.querySelector('[data-testid="equipment-card"]')
      ).toBeNull();
    });
  });

  describe("spells card", () => {
    it("does not render for non-caster classes", () => {
      const { container } = render(
        <ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />
      );
      expect(
        container.querySelector('[data-testid="spells-card"]')
      ).toBeNull();
    });

    it("renders spell details for caster classes", () => {
      const { container } = render(
        <ReviewStep
          character={makeCharacter({
            class: "Wizard",
            preparedSpells: [
              {
                id: "c1",
                name: "Fire Bolt",
                level: 0,
                school: "Evocation",
                castingTime: "1 action",
                range: "120 feet",
                components: "V, S",
                duration: "Instantaneous",
                description: "A beam of fire.",
              },
              {
                id: "s1",
                name: "Magic Missile",
                level: 1,
                school: "Evocation",
                castingTime: "1 action",
                range: "120 feet",
                components: "V, S",
                duration: "Instantaneous",
                description: "Darts of force.",
              },
            ],
          })}
          setCharacter={vi.fn()}
        />
      );
      const spellsCard = container.querySelector('[data-testid="spells-card"]');
      expect(spellsCard).toBeTruthy();
      expect(spellsCard?.textContent).toContain("Fire Bolt");
      expect(spellsCard?.textContent).toContain("Magic Missile");
      expect(spellsCard?.textContent).toContain("Lv1");
    });
  });

  describe("character summary card", () => {
    it("includes HP in summary text", () => {
      render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
      expect(screen.getByText(/13 HP/)).toBeTruthy();
    });

    it("shows race bonuses applied", () => {
      render(<ReviewStep character={makeCharacter()} setCharacter={vi.fn()} />);
      expect(screen.getByText(/constitution \+2/)).toBeTruthy();
    });
  });
});
