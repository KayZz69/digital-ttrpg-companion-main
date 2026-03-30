/**
 * @fileoverview Tests for CCR-005 legacy character migration layer.
 *
 * The migration runs inside `migrateCharacterRecord` (called by `readCharacters()`).
 * Since `migrateCharacterRecord` is not exported, all tests go through `readCharacters()`
 * by mocking localStorage with crafted legacy character payloads.
 *
 * Coverage targets:
 * - spellcastingType: derived from class name if absent
 * - rulesVersion: set to "2024-dnd5e" if absent
 * - spellSlots: regenerated from registry if absent on a caster
 * - concentration / ritual: added to PreparedSpell records from compendium or defaulted
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));

// ---------------------------------------------------------------------------
// localStorage polyfill for environments where jsdom does not provide one
// ---------------------------------------------------------------------------

const createStorage = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

const mockStorage = createStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: mockStorage,
  writable: true,
  configurable: true,
});

// Import after localStorage is available so the module binds to our mock
const { readCharacters } = await import("../storage");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_CHARACTER = {
  id: "test-id",
  system: "dnd5e",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

const BASE_DATA = {
  name: "Test Character",
  race: "Human",
  class: "Wizard",
  level: 1,
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 16,
    wisdom: 10,
    charisma: 10,
  },
  experiencePoints: 0,
  hitPoints: { current: 8, max: 8 },
  inventory: [],
};

/**
 * Build a minimal Character record with data overrides.
 * Omits CCR-005 fields by default to simulate legacy data.
 */
const mockCharacter = (dataOverrides: Record<string, unknown> = {}, topOverrides: Record<string, unknown> = {}) => ({
  ...BASE_CHARACTER,
  ...topOverrides,
  data: {
    ...BASE_DATA,
    ...dataOverrides,
  },
});

/** Store a character array in mock localStorage and read it back via readCharacters(). */
const storeAndRead = (characters: ReturnType<typeof mockCharacter>[]) => {
  mockStorage.setItem("soloquest_characters", JSON.stringify(characters));
  return readCharacters();
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockStorage.clear();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Group 1: spellcastingType migration
// ---------------------------------------------------------------------------

describe("CCR-005: spellcastingType migration", () => {
  it("legacy Wizard character (no spellcastingType) gets 'prepared'", () => {
    const [char] = storeAndRead([mockCharacter({ class: "Wizard" })]);
    expect(char.data.spellcastingType).toBe("prepared");
  });

  it("legacy Bard character gets 'known'", () => {
    const [char] = storeAndRead([mockCharacter({ class: "Bard" })]);
    expect(char.data.spellcastingType).toBe("known");
  });

  it("legacy Warlock character gets 'pact'", () => {
    const [char] = storeAndRead([mockCharacter({ class: "Warlock" })]);
    expect(char.data.spellcastingType).toBe("pact");
  });

  it("legacy Fighter character gets 'none'", () => {
    const [char] = storeAndRead([mockCharacter({ class: "Fighter" })]);
    expect(char.data.spellcastingType).toBe("none");
  });

  it("character with existing spellcastingType is not overwritten", () => {
    const [char] = storeAndRead([
      mockCharacter({ class: "Wizard", spellcastingType: "known" }),
    ]);
    // Should preserve the existing value even though Wizard would normally be "prepared"
    expect(char.data.spellcastingType).toBe("known");
  });
});

// ---------------------------------------------------------------------------
// Group 2: rulesVersion migration
// ---------------------------------------------------------------------------

describe("CCR-005: rulesVersion migration", () => {
  it("legacy character (no rulesVersion) gets '2024-dnd5e'", () => {
    const [char] = storeAndRead([mockCharacter()]);
    expect(char.data.rulesVersion).toBe("2024-dnd5e");
  });

  it("character with existing rulesVersion is not overwritten", () => {
    const [char] = storeAndRead([
      mockCharacter({ rulesVersion: "2014-dnd5e" }),
    ]);
    expect(char.data.rulesVersion).toBe("2014-dnd5e");
  });
});

// ---------------------------------------------------------------------------
// Group 3: spellSlots migration
// ---------------------------------------------------------------------------

describe("CCR-005: spellSlots migration", () => {
  it("legacy Wizard level 1 with no spellSlots gets slots from registry", () => {
    const [char] = storeAndRead([
      mockCharacter({ class: "Wizard", level: 1 }),
    ]);
    expect(char.data.spellSlots).toBeDefined();
    // 2024 PHB: Wizard level 1 = 2 first-level slots
    expect(char.data.spellSlots!.level1).toEqual({ current: 2, max: 2 });
    // Higher levels should be zeroed out
    expect(char.data.spellSlots!.level2).toEqual({ current: 0, max: 0 });
  });

  it("legacy Fighter with no spellSlots stays without slots (non-caster)", () => {
    const [char] = storeAndRead([
      mockCharacter({ class: "Fighter", level: 5 }),
    ]);
    // Non-caster should not get spellSlots populated (or all zeroes)
    if (char.data.spellSlots) {
      // If spellSlots is set, all values should be zero
      for (let l = 1; l <= 9; l++) {
        const key = `level${l}` as keyof typeof char.data.spellSlots;
        expect(char.data.spellSlots[key]).toEqual({ current: 0, max: 0 });
      }
    }
  });

  it("character with existing valid spellSlots is not overwritten", () => {
    const existingSlots = {
      level1: { current: 1, max: 2 },
      level2: { current: 0, max: 0 },
      level3: { current: 0, max: 0 },
      level4: { current: 0, max: 0 },
      level5: { current: 0, max: 0 },
      level6: { current: 0, max: 0 },
      level7: { current: 0, max: 0 },
      level8: { current: 0, max: 0 },
      level9: { current: 0, max: 0 },
    };
    const [char] = storeAndRead([
      mockCharacter({ class: "Wizard", level: 1, spellSlots: existingSlots }),
    ]);
    // The current value (1 of 2 remaining) should be preserved, not reset to max
    expect(char.data.spellSlots!.level1.current).toBe(1);
    expect(char.data.spellSlots!.level1.max).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Group 4: PreparedSpell concentration / ritual
// ---------------------------------------------------------------------------

describe("CCR-005: PreparedSpell concentration/ritual", () => {
  it("legacy spell without concentration/ritual gets defaults from compendium", () => {
    // "dancing-lights" is in the compendium with concentration: true, ritual: false
    const legacySpell = {
      id: "spell-1",
      sourceSpellId: "dancing-lights",
      name: "Dancing Lights",
      level: 0,
      school: "Evocation",
      castingTime: "1 action",
      range: "120 feet",
      components: "V, S, M",
      duration: "Concentration, 1 minute",
      description: "You create lights.",
      // No concentration or ritual fields — legacy data
    };
    const [char] = storeAndRead([
      mockCharacter({ class: "Wizard", preparedSpells: [legacySpell] }),
    ]);

    const spell = char.data.preparedSpells![0];
    expect(spell.concentration).toBe(true);
    expect(spell.ritual).toBe(false);
  });

  it("legacy spell not in compendium gets false defaults", () => {
    const legacySpell = {
      id: "spell-custom",
      name: "Homebrew Zap",
      level: 1,
      school: "Evocation",
      castingTime: "1 action",
      range: "30 feet",
      components: "V, S",
      duration: "Instantaneous",
      description: "A custom homebrew spell.",
      // No sourceSpellId, not in compendium
    };
    const [char] = storeAndRead([
      mockCharacter({ class: "Wizard", preparedSpells: [legacySpell] }),
    ]);

    const spell = char.data.preparedSpells![0];
    expect(spell.concentration).toBe(false);
    expect(spell.ritual).toBe(false);
  });

  it("spell already with concentration: true is preserved", () => {
    const modernSpell = {
      id: "spell-2",
      sourceSpellId: "acid-splash",
      name: "Acid Splash",
      level: 0,
      school: "Conjuration",
      castingTime: "1 action",
      range: "60 feet",
      components: "V, S",
      duration: "Instantaneous",
      description: "You hurl acid.",
      concentration: true, // Intentionally wrong — should be preserved, not overridden
      ritual: false,
    };
    const [char] = storeAndRead([
      mockCharacter({ class: "Wizard", preparedSpells: [modernSpell] }),
    ]);

    const spell = char.data.preparedSpells![0];
    // Existing values should be preserved, not overwritten by compendium
    expect(spell.concentration).toBe(true);
    expect(spell.ritual).toBe(false);
  });

  it("ritual spell from compendium gets ritual: true", () => {
    // "alarm" is in the compendium with concentration: false, ritual: true
    const legacySpell = {
      id: "spell-alarm",
      sourceSpellId: "alarm",
      name: "Alarm",
      level: 1,
      school: "Abjuration",
      castingTime: "1 minute",
      range: "30 feet",
      components: "V, S, M",
      duration: "8 hours",
      description: "You set an alarm.",
      // No concentration or ritual fields
    };
    const [char] = storeAndRead([
      mockCharacter({ class: "Wizard", preparedSpells: [legacySpell] }),
    ]);

    const spell = char.data.preparedSpells![0];
    expect(spell.concentration).toBe(false);
    expect(spell.ritual).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Group 5: Non-destructive migration
// ---------------------------------------------------------------------------

describe("CCR-005: non-destructive migration", () => {
  it("complete modern character passes through unchanged", () => {
    const fullSlots = {
      level1: { current: 1, max: 2 },
      level2: { current: 0, max: 0 },
      level3: { current: 0, max: 0 },
      level4: { current: 0, max: 0 },
      level5: { current: 0, max: 0 },
      level6: { current: 0, max: 0 },
      level7: { current: 0, max: 0 },
      level8: { current: 0, max: 0 },
      level9: { current: 0, max: 0 },
    };
    const modernSpell = {
      id: "spell-1",
      sourceSpellId: "acid-splash",
      name: "Acid Splash",
      level: 0,
      school: "Conjuration",
      castingTime: "1 action",
      range: "60 feet",
      components: "V, S",
      duration: "Instantaneous",
      description: "Acid.",
      concentration: false,
      ritual: false,
    };
    const modernData = {
      class: "Wizard",
      level: 1,
      spellcastingType: "prepared",
      rulesVersion: "2024-dnd5e",
      spellSlots: fullSlots,
      preparedSpells: [modernSpell],
    };

    const [char] = storeAndRead([mockCharacter(modernData)]);

    // All CCR-005 fields should remain as provided
    expect(char.data.spellcastingType).toBe("prepared");
    expect(char.data.rulesVersion).toBe("2024-dnd5e");
    expect(char.data.spellSlots!.level1.current).toBe(1); // not reset to max
    expect(char.data.preparedSpells![0].concentration).toBe(false);
    expect(char.data.preparedSpells![0].ritual).toBe(false);
  });

  it("legacy character with old 'spells' field gets migrated to preparedSpells AND gets CCR-005 fields", () => {
    const legacySpell = {
      id: "spell-old",
      name: "Magic Missile",
      level: 1,
      school: "Evocation",
      castingTime: "1 action",
      range: "120 feet",
      components: "V, S",
      duration: "Instantaneous",
      description: "Darts of force.",
      // No concentration or ritual
    };
    // Use the old `spells` field name instead of `preparedSpells`
    const [char] = storeAndRead([
      mockCharacter({ class: "Wizard", level: 1, spells: [legacySpell], preparedSpells: undefined }),
    ]);

    // Should have been migrated from spells to preparedSpells
    expect(char.data.preparedSpells).toBeDefined();
    expect(char.data.preparedSpells!.length).toBe(1);
    expect(char.data.preparedSpells![0].name).toBe("Magic Missile");

    // CCR-005 fields should also be present
    expect(char.data.spellcastingType).toBe("prepared");
    expect(char.data.rulesVersion).toBe("2024-dnd5e");
    expect(char.data.spellSlots).toBeDefined();

    // concentration/ritual should be defaulted
    expect(char.data.preparedSpells![0].concentration).toBe(false);
    expect(char.data.preparedSpells![0].ritual).toBe(false);
  });

  it("preserves existing character data fields not touched by migration", () => {
    const [char] = storeAndRead([
      mockCharacter({
        class: "Wizard",
        level: 3,
        alignment: "Neutral Good",
        background: "Sage",
        skills: { Arcana: "proficient" },
      }),
    ]);

    // Non-migration fields should pass through intact
    expect(char.data.alignment).toBe("Neutral Good");
    expect(char.data.background).toBe("Sage");
    expect(char.data.skills).toEqual({ Arcana: "proficient" });
    expect(char.data.name).toBe("Test Character");
    expect(char.data.hitPoints).toEqual({ current: 8, max: 8 });
  });

  it("multiple characters are each migrated independently", () => {
    const chars = storeAndRead([
      mockCharacter({ class: "Wizard", level: 1 }, { id: "wiz-1" }),
      mockCharacter({ class: "Fighter", level: 5 }, { id: "fighter-1" }),
      mockCharacter({ class: "Bard", level: 3 }, { id: "bard-1" }),
    ]);

    expect(chars).toHaveLength(3);
    expect(chars[0].data.spellcastingType).toBe("prepared");
    expect(chars[1].data.spellcastingType).toBe("none");
    expect(chars[2].data.spellcastingType).toBe("known");
  });
});
