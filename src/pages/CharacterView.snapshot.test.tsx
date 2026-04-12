/**
 * @fileoverview Snapshot tests for CharacterView at levels 1, 2, and 3.
 * Captures structural layout to detect unexpected regressions.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CharacterView } from "./CharacterView";
import { Character, DnD5eCharacter } from "@/types/character";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock complex sub-components to keep snapshots stable and focused on layout
vi.mock("@/components/SpellsManager", () => ({
  SpellsManager: (props: Record<string, unknown>) => (
    <div data-testid="spells-manager" data-level={props.level} />
  ),
}));

vi.mock("@/components/SkillsManager", () => ({
  SkillsManager: (props: Record<string, unknown>) => (
    <div data-testid="skills-manager" data-level={props.level} />
  ),
}));

vi.mock("@/components/SavingThrowsManager", () => ({
  SavingThrowsManager: () => <div data-testid="saving-throws-manager" />,
}));

vi.mock("@/components/InventoryManager", () => ({
  InventoryManager: () => <div data-testid="inventory-manager" />,
}));

vi.mock("@/utils/armorClassUtils", () => ({
  computeArmorClass: () => ({
    total: 16,
    baseSource: "Chain Mail",
    shieldBonus: 0,
    stealthDisadvantage: true,
  }),
}));

vi.mock("@/components/LevelUpWizard/LevelUpWizard", () => ({
  LevelUpWizard: () => null,
}));

let mockCharacters: Character[] = [];

vi.mock("@/lib/storage", () => ({
  readCharacters: () => mockCharacters,
  writeCharacters: (chars: Character[]) => {
    mockCharacters = chars;
  },
}));

function makeCharacter(level: number): Character {
  const baseHP = 10 + (level - 1) * 6; // Fighter d10: 10 + 6 per level
  return {
    id: `snapshot-char-${level}`,
    system: "dnd5e",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    data: {
      id: `snapshot-char-${level}`,
      name: "Arden",
      race: "Human",
      class: "Fighter",
      level,
      abilityScores: {
        strength: 16,
        dexterity: 12,
        constitution: 14,
        intelligence: 10,
        wisdom: 13,
        charisma: 8,
      },
      experiencePoints: level === 1 ? 0 : level === 2 ? 300 : 900,
      hitPoints: { current: baseHP, max: baseHP },
      hitDice: { current: level, max: level },
      inventory: [
        {
          id: "armor-1",
          name: "Chain Mail",
          quantity: 1,
          weight: 55,
          equipped: true,
          equipmentSlot: "armor" as const,
          sourceItemType: "armor" as const,
        },
        {
          id: "weapon-1",
          name: "Longsword",
          quantity: 1,
          weight: 3,
          equipped: true,
          equipmentSlot: "mainHand" as const,
          sourceItemType: "weapon" as const,
          damageDice: "1d8",
          damageType: "slashing",
        },
      ],
      alignment: "Lawful Good",
      background: "Soldier",
      savingThrows: { strength: true, constitution: true },
      skills: { Athletics: "proficient" as const, Intimidation: "proficient" as const },
      conditions: [],
      exhaustionLevel: 0,
      deathSaves: { successes: 0, failures: 0 },
    } as DnD5eCharacter,
  };
}

function renderCharacterView(characterId: string) {
  return render(
    <MemoryRouter initialEntries={[`/character/${characterId}`]}>
      <Routes>
        <Route path="/character/:id" element={<CharacterView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CharacterView snapshot tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("matches snapshot at level 1", () => {
    const char = makeCharacter(1);
    mockCharacters = [char];
    const { container } = renderCharacterView("snapshot-char-1");
    expect(container).toMatchSnapshot();
  });

  it("matches snapshot at level 2", () => {
    const char = makeCharacter(2);
    mockCharacters = [char];
    const { container } = renderCharacterView("snapshot-char-2");
    expect(container).toMatchSnapshot();
  });

  it("matches snapshot at level 3", () => {
    const char = makeCharacter(3);
    mockCharacters = [char];
    const { container } = renderCharacterView("snapshot-char-3");
    expect(container).toMatchSnapshot();
  });
});
