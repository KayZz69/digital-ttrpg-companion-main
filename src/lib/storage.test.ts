import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readCharacters,
  readJournalEntries,
  readNPCs,
  STORAGE_KEYS,
  writeCharacters,
  writeJournalEntries,
  writeNPCs,
} from "./storage";
import type { Character } from "@/types/character";
import type { JournalEntry } from "@/types/journal";
import type { NPC } from "@/types/npc";

const toastMock = vi.fn();
let storageData: Record<string, string> = {};

vi.mock("@/hooks/use-toast", () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}));

vi.stubGlobal("localStorage", {
  getItem: (key: string) =>
    Object.prototype.hasOwnProperty.call(storageData, key) ? storageData[key] : null,
  setItem: (key: string, value: string) => {
    storageData[key] = String(value);
  },
  removeItem: (key: string) => {
    delete storageData[key];
  },
  clear: () => {
    storageData = {};
  },
  key: (index: number) => Object.keys(storageData)[index] ?? null,
  get length() {
    return Object.keys(storageData).length;
  },
});

describe("storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    toastMock.mockClear();
  });

  it("reads and writes characters safely", () => {
    const characters = [
      {
        id: "char-1",
        system: "dnd5e",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        data: {
          name: "Aria",
          class: "Wizard",
          race: "Elf",
        },
      },
    ] as unknown as Character[];

    writeCharacters(characters);
    expect(readCharacters()).toEqual(characters);
  });

  it("recovers when characters payload is invalid JSON", () => {
    localStorage.setItem(STORAGE_KEYS.characters, "{bad json");
    const result = readCharacters();

    expect(result).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEYS.characters)).toBe("[]");
    expect(toastMock).toHaveBeenCalledTimes(1);

    const backupKey = Object.keys(storageData).find((key) =>
      key.startsWith(`${STORAGE_KEYS.characters}_corrupt_`)
    );
    expect(backupKey).toBeTruthy();
  });

  it("recovers when payload shape is invalid", () => {
    localStorage.setItem(STORAGE_KEYS.npcs, JSON.stringify([{ id: 1 }]));

    const result = readNPCs();
    expect(result).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEYS.npcs)).toBe("[]");
    expect(toastMock).toHaveBeenCalledTimes(1);
  });

  it("writes and reads journal entries", () => {
    const entries: JournalEntry[] = [
      {
        id: "entry-1",
        characterId: "char-1",
        timestamp: "2026-01-02T00:00:00.000Z",
        title: "Session 1",
        content: "Met an NPC.",
        tags: [{ type: "npc", value: "Barkeep" }],
      },
    ];

    writeJournalEntries(entries);
    expect(readJournalEntries()).toEqual(entries);
  });

  it("writes and reads NPC entries", () => {
    const npcs: NPC[] = [
      {
        id: "npc-1",
        name: "Goblin Scout",
        type: "enemy",
        hitPoints: 7,
        armorClass: 15,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    writeNPCs(npcs);
    expect(readNPCs()).toEqual(npcs);
  });
});
