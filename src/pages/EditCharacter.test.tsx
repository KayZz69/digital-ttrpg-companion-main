import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { EditCharacter } from "./EditCharacter";
import { Character, DnD5eCharacter } from "@/types/character";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function makeCharacter(overrides: Partial<DnD5eCharacter> = {}): Character {
  return {
    id: "test-id-1",
    system: "dnd5e",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    data: {
      id: "test-id-1",
      name: "Thorin",
      race: "Dwarf",
      class: "Fighter",
      level: 3,
      abilityScores: {
        strength: 16,
        dexterity: 12,
        constitution: 14,
        intelligence: 10,
        wisdom: 13,
        charisma: 8,
      },
      experiencePoints: 900,
      hitPoints: { current: 28, max: 30 },
      inventory: [],
      alignment: "Lawful Good",
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

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

function renderEdit(characterId = "test-id-1") {
  return render(
    <MemoryRouter initialEntries={[`/character/${characterId}/edit`]}>
      <Routes>
        <Route path="/character/:id/edit" element={<EditCharacter />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("EditCharacter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCharacters = [makeCharacter()];
    mockNavigate.mockClear();
  });

  it("renders the edit form with character data pre-filled", () => {
    renderEdit();

    const nameInput = screen.getByLabelText(/character name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Thorin");

    const maxHPInput = screen.getByLabelText(/^max$/i) as HTMLInputElement;
    expect(maxHPInput.value).toBe("30");

    const currentHPInput = screen.getByLabelText(/^current$/i) as HTMLInputElement;
    expect(currentHPInput.value).toBe("28");
  });

  it("shows locked fields for race, class, and level", () => {
    renderEdit();

    expect(screen.getByText("Locked Fields")).toBeInTheDocument();
    expect(screen.getByText("Dwarf")).toBeInTheDocument();
    expect(screen.getByText("Fighter")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows locked field explanation message", () => {
    renderEdit();

    expect(
      screen.getByText(/race, class, and level cannot be changed here/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/to change your race or class, create a new character/i)
    ).toBeInTheDocument();
  });

  it("validates empty name", () => {
    renderEdit();

    const nameInput = screen.getByLabelText(/character name/i);
    fireEvent.change(nameInput, { target: { value: "" } });

    fireEvent.click(screen.getByText(/save changes/i));

    expect(screen.getByText(/character name is required/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("validates max HP below 1", () => {
    renderEdit();

    const maxHPInput = screen.getByLabelText(/^max$/i);
    fireEvent.change(maxHPInput, { target: { value: "0" } });

    fireEvent.click(screen.getByText(/save changes/i));

    expect(screen.getByText(/max hp must be at least 1/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("validates max HP above 999", () => {
    renderEdit();

    const maxHPInput = screen.getByLabelText(/^max$/i);
    fireEvent.change(maxHPInput, { target: { value: "1000" } });

    fireEvent.click(screen.getByText(/save changes/i));

    expect(screen.getByText(/max hp cannot exceed 999/i)).toBeInTheDocument();
  });

  it("saves valid changes and navigates back", () => {
    renderEdit();

    const nameInput = screen.getByLabelText(/character name/i);
    fireEvent.change(nameInput, { target: { value: "Thorin Ironbeard" } });

    fireEvent.click(screen.getByText(/save changes/i));

    expect(mockNavigate).toHaveBeenCalledWith("/character/test-id-1");

    const saved = mockCharacters[0].data as DnD5eCharacter;
    expect(saved.name).toBe("Thorin Ironbeard");
  });

  it("clamps current HP when max HP is reduced below current", () => {
    renderEdit();

    const maxHPInput = screen.getByLabelText(/^max$/i);
    fireEvent.change(maxHPInput, { target: { value: "20" } });

    fireEvent.click(screen.getByText(/save changes/i));

    const saved = mockCharacters[0].data as DnD5eCharacter;
    expect(saved.hitPoints.max).toBe(20);
    expect(saved.hitPoints.current).toBe(20); // was 28, clamped to new max
  });

  it("saves current HP edits", () => {
    renderEdit();

    const currentHPInput = screen.getByLabelText(/^current$/i);
    fireEvent.change(currentHPInput, { target: { value: "15" } });

    fireEvent.click(screen.getByText(/save changes/i));

    const saved = mockCharacters[0].data as DnD5eCharacter;
    expect(saved.hitPoints.current).toBe(15);
    expect(saved.hitPoints.max).toBe(30);
  });

  it("validates current HP cannot be negative", () => {
    renderEdit();

    const currentHPInput = screen.getByLabelText(/^current$/i);
    fireEvent.change(currentHPInput, { target: { value: "-1" } });

    fireEvent.click(screen.getByText(/save changes/i));

    expect(screen.getByText(/current hp cannot be negative/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("clamps current HP to max HP on save when current exceeds max", () => {
    renderEdit();

    const currentHPInput = screen.getByLabelText(/^current$/i);
    fireEvent.change(currentHPInput, { target: { value: "50" } });

    fireEvent.click(screen.getByText(/save changes/i));

    const saved = mockCharacters[0].data as DnD5eCharacter;
    expect(saved.hitPoints.current).toBe(30); // clamped to max
    expect(saved.hitPoints.max).toBe(30);
  });

  it("shows not-found state for missing character", () => {
    renderEdit("nonexistent-id");

    expect(screen.getByText(/character not found/i)).toBeInTheDocument();
  });

  it("saves alignment changes", () => {
    renderEdit();

    const alignmentInput = screen.getByLabelText(/alignment/i);
    fireEvent.change(alignmentInput, { target: { value: "Chaotic Good" } });

    fireEvent.click(screen.getByText(/save changes/i));

    const saved = mockCharacters[0].data as DnD5eCharacter;
    expect(saved.alignment).toBe("Chaotic Good");
  });

  it("renders notes textarea", () => {
    renderEdit();

    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });
});
