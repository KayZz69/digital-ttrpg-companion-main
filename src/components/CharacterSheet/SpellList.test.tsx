import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpellList } from "./SpellList";
import { DnD5eAbilityScores } from "@/types/character";

// SpellsManager is a complex component with many deps; mock it to isolate SpellList
vi.mock("@/components/SpellsManager", () => ({
  SpellsManager: (props: Record<string, unknown>) => (
    <div data-testid="spells-manager" data-class={props.characterClass} />
  ),
}));

const abilityScores: DnD5eAbilityScores = {
  strength: 10,
  dexterity: 14,
  constitution: 12,
  intelligence: 16,
  wisdom: 13,
  charisma: 8,
};

const defaultProps = {
  preparedSpells: [],
  characterClass: "Wizard",
  abilityScores,
  level: 3,
  activeConcentrationSpell: null,
  onUpdateSpellSlots: vi.fn(),
  onUpdatePreparedSpells: vi.fn(),
  onConcentrationChange: vi.fn(),
};

describe("SpellList", () => {
  it("renders nothing when spellcastingAbility is undefined", () => {
    const { container } = render(
      <SpellList {...defaultProps} spellcastingAbility={undefined} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders SpellsManager when spellcastingAbility is provided", () => {
    render(<SpellList {...defaultProps} spellcastingAbility="intelligence" />);
    expect(screen.getByTestId("spells-manager")).toBeInTheDocument();
  });

  it("passes characterClass to SpellsManager", () => {
    render(<SpellList {...defaultProps} spellcastingAbility="intelligence" />);
    expect(screen.getByTestId("spells-manager")).toHaveAttribute("data-class", "Wizard");
  });

  it("provides default empty spell slots when none are given", () => {
    // Should not crash with undefined spellSlots
    render(<SpellList {...defaultProps} spellcastingAbility="intelligence" spellSlots={undefined} />);
    expect(screen.getByTestId("spells-manager")).toBeInTheDocument();
  });

  it("passes spellSlots through when provided", () => {
    const spellSlots = {
      level1: { current: 2, max: 4 },
      level2: { current: 1, max: 3 },
      level3: { current: 0, max: 0 },
      level4: { current: 0, max: 0 },
      level5: { current: 0, max: 0 },
      level6: { current: 0, max: 0 },
      level7: { current: 0, max: 0 },
      level8: { current: 0, max: 0 },
      level9: { current: 0, max: 0 },
    };
    render(
      <SpellList {...defaultProps} spellcastingAbility="intelligence" spellSlots={spellSlots} />
    );
    expect(screen.getByTestId("spells-manager")).toBeInTheDocument();
  });
});
