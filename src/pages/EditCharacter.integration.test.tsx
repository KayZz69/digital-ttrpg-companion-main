/**
 * @fileoverview Integration tests for the EditCharacter page.
 * Covers the full edit flow: load → modify → validate → save → navigate.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { EditCharacter } from "./EditCharacter";
import { Character, DnD5eCharacter } from "@/types/character";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

function makeCharacter(overrides: Partial<DnD5eCharacter> = {}): Character {
  return {
    id: "int-test-1",
    system: "dnd5e",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    data: {
      id: "int-test-1",
      name: "Elara",
      race: "Elf",
      class: "Wizard",
      level: 5,
      abilityScores: {
        strength: 8,
        dexterity: 14,
        constitution: 12,
        intelligence: 18,
        wisdom: 13,
        charisma: 10,
      },
      experiencePoints: 6500,
      hitPoints: { current: 22, max: 32 },
      inventory: [],
      alignment: "Neutral Good",
      ...overrides,
    },
  };
}

let mockCharacters: Character[] = [];

vi.mock("@/lib/storage", () => ({
  readCharacters: () => mockCharacters,
  writeCharacters: (chars: Character[]) => {
    mockCharacters = chars;
  },
}));

function renderEdit(characterId = "int-test-1") {
  return render(
    <MemoryRouter initialEntries={[`/character/${characterId}/edit`]}>
      <Routes>
        <Route path="/character/:id/edit" element={<EditCharacter />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("EditCharacter integration flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCharacters = [makeCharacter()];
  });

  it("loads character data and pre-fills all editable fields", () => {
    renderEdit();

    expect((screen.getByLabelText(/character name/i) as HTMLInputElement).value).toBe("Elara");
    expect((screen.getByLabelText(/^max$/i) as HTMLInputElement).value).toBe("32");
    expect((screen.getByLabelText(/^current$/i) as HTMLInputElement).value).toBe("22");
    expect((screen.getByLabelText(/alignment/i) as HTMLInputElement).value).toBe("Neutral Good");
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("edits name, max HP, alignment, and notes in a single save", () => {
    renderEdit();

    fireEvent.change(screen.getByLabelText(/character name/i), { target: { value: "Elara Starweaver" } });
    fireEvent.change(screen.getByLabelText(/^max$/i), { target: { value: "35" } });
    fireEvent.change(screen.getByLabelText(/alignment/i), { target: { value: "Chaotic Good" } });
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: "Has a familiar named Owl" } });

    fireEvent.click(screen.getByText(/save changes/i));

    expect(mockNavigate).toHaveBeenCalledWith("/character/int-test-1");

    const saved = mockCharacters[0].data as DnD5eCharacter;
    expect(saved.name).toBe("Elara Starweaver");
    expect(saved.hitPoints.max).toBe(35);
    expect(saved.alignment).toBe("Chaotic Good");
    expect((saved as DnD5eCharacter & { notes?: string }).notes).toBe("Has a familiar named Owl");
  });

  it("shows locked fields that cannot be edited", () => {
    renderEdit();

    // Locked fields are displayed as text, not inputs
    expect(screen.getByText("Elf")).toBeInTheDocument();
    expect(screen.getByText("Wizard")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Locked Fields")).toBeInTheDocument();

    // Verify there are no input fields for race/class/level
    const inputs = screen.getAllByRole("textbox");
    const inputIds = inputs.map((el) => el.getAttribute("id")).filter(Boolean);
    expect(inputIds).not.toContain("edit-race");
    expect(inputIds).not.toContain("edit-class");
    expect(inputIds).not.toContain("edit-level");
  });

  it("prevents save when name is empty and shows validation error", () => {
    renderEdit();

    fireEvent.change(screen.getByLabelText(/character name/i), { target: { value: "   " } });
    fireEvent.click(screen.getByText(/save changes/i));

    expect(screen.getByText(/character name is required/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("prevents save when max HP exceeds 999", () => {
    renderEdit();

    fireEvent.change(screen.getByLabelText(/^max$/i), { target: { value: "1500" } });
    fireEvent.click(screen.getByText(/save changes/i));

    expect(screen.getByText(/max hp cannot exceed 999/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("preserves unchanged fields when saving edits", () => {
    renderEdit();

    // Only change the name
    fireEvent.change(screen.getByLabelText(/character name/i), { target: { value: "Elara the Wise" } });
    fireEvent.click(screen.getByText(/save changes/i));

    const saved = mockCharacters[0].data as DnD5eCharacter;
    expect(saved.name).toBe("Elara the Wise");
    // These should remain unchanged
    expect(saved.race).toBe("Elf");
    expect(saved.class).toBe("Wizard");
    expect(saved.level).toBe(5);
    expect(saved.abilityScores.intelligence).toBe(18);
  });

  it("trims whitespace from name and alignment on save", () => {
    renderEdit();

    fireEvent.change(screen.getByLabelText(/character name/i), { target: { value: "  Elara  " } });
    fireEvent.change(screen.getByLabelText(/alignment/i), { target: { value: "  True Neutral  " } });
    fireEvent.click(screen.getByText(/save changes/i));

    const saved = mockCharacters[0].data as DnD5eCharacter;
    expect(saved.name).toBe("Elara");
    expect(saved.alignment).toBe("True Neutral");
  });

  it("navigates back to character sheet on back button click", () => {
    renderEdit();

    fireEvent.click(screen.getByText(/back to character sheet/i));
    expect(mockNavigate).toHaveBeenCalledWith("/character/int-test-1");
  });

  it("shows character description in header (race class · level · prof)", () => {
    renderEdit();

    // CardDescription shows "Elf Wizard · Level 5 · Prof +3"
    expect(screen.getByText(/Elf Wizard/)).toBeInTheDocument();
    expect(screen.getByText(/Level 5/)).toBeInTheDocument();
  });
});
