import { toast } from "@/hooks/use-toast";
import { Character } from "@/types/character";
import { JournalEntry } from "@/types/journal";
import { NPC } from "@/types/npc";
import { getAllSpells } from "@/data";
import { getClassByName, getRaceByName } from "@/lib/dndCompendium";

export const STORAGE_KEYS = {
  characters: "soloquest_characters",
  npcs: "soloquest_npcs",
  journal: "soloquest_journal",
} as const;

const RECOVERY_NOTIFIED_KEYS = new Set<string>();

interface VersionedPayload<T> {
  version: number;
  data: T;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasString = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === "string";

const hasNumber = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === "number";

const isVersionedPayload = <T>(value: unknown): value is VersionedPayload<T> =>
  isRecord(value) && typeof value.version === "number" && "data" in value;

const migrateStoredData = <T>(value: T, _version?: number): T => {
  return value;
};

const spellIdByName = new Map(
  getAllSpells().map((spell) => [spell.name.trim().toLowerCase(), spell.id])
);

const migrateCharacterRecord = (character: Character): Character => {
  if (character.system !== "dnd5e" || !isRecord(character.data)) {
    return character;
  }

  const data = character.data as Record<string, unknown>;
  const className = typeof data.class === "string" ? data.class : "";
  const raceName = typeof data.race === "string" ? data.race : "";

  const inventory = Array.isArray(data.inventory) ? data.inventory : [];
  const preparedSpells = Array.isArray(data.preparedSpells)
    ? data.preparedSpells.map((spell) => {
        if (!isRecord(spell)) {
          return spell;
        }

        if (typeof spell.sourceSpellId === "string") {
          return spell;
        }

        if (typeof spell.name !== "string") {
          return spell;
        }

        const sourceSpellId = spellIdByName.get(spell.name.trim().toLowerCase());
        return sourceSpellId ? { ...spell, sourceSpellId } : spell;
      })
    : [];

  const migratedData = {
    ...data,
    classId:
      typeof data.classId === "string" ? data.classId : getClassByName(className)?.id,
    raceId: typeof data.raceId === "string" ? data.raceId : getRaceByName(raceName)?.id,
    inventory,
    preparedSpells,
  };

  return {
    ...character,
    data: migratedData as Character["data"],
  };
};

const recoverInvalidPayload = (key: string, raw: string, reason: string) => {
  const backupKey = `${key}_corrupt_${new Date().toISOString()}`;

  try {
    localStorage.setItem(backupKey, raw);
  } catch {
    // Ignore backup write failures and still attempt reset.
  }

  try {
    localStorage.setItem(key, JSON.stringify([]));
  } catch {
    // Ignore write failure; caller still receives safe defaults.
  }

  if (!RECOVERY_NOTIFIED_KEYS.has(key)) {
    RECOVERY_NOTIFIED_KEYS.add(key);
    toast({
      title: "Recovered Invalid Saved Data",
      description: `Some saved ${key.replace("soloquest_", "")} data was invalid and has been reset. A backup was created (${backupKey}). ${reason}`,
      variant: "destructive",
    });
  }
};

const safeReadArray = <T>(
  key: string,
  validateItem: (item: unknown) => item is T
): T[] => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    const payload = isVersionedPayload<unknown>(parsed)
      ? migrateStoredData(parsed.data, parsed.version)
      : migrateStoredData(parsed);

    if (!Array.isArray(payload) || !payload.every(validateItem)) {
      recoverInvalidPayload(key, raw, "Shape validation failed.");
      return [];
    }

    return payload;
  } catch {
    recoverInvalidPayload(key, raw, "JSON parsing failed.");
    return [];
  }
};

const safeWriteArray = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

const isCharacter = (value: unknown): value is Character => {
  if (!isRecord(value)) return false;
  if (!hasString(value, "id")) return false;
  if (!hasString(value, "system")) return false;
  if (!hasString(value, "createdAt")) return false;
  if (!hasString(value, "updatedAt")) return false;
  if (!isRecord(value.data)) return false;
  if (!hasString(value.data, "name")) return false;
  if (!hasString(value.data, "class")) return false;
  if (!hasString(value.data, "race")) return false;
  return true;
};

const isJournalEntry = (value: unknown): value is JournalEntry => {
  if (!isRecord(value)) return false;
  if (!hasString(value, "id")) return false;
  if (!hasString(value, "characterId")) return false;
  if (!hasString(value, "timestamp")) return false;
  if (!hasString(value, "title")) return false;
  if (!hasString(value, "content")) return false;
  if (!Array.isArray(value.tags)) return false;
  return true;
};

const isNPC = (value: unknown): value is NPC => {
  if (!isRecord(value)) return false;
  if (!hasString(value, "id")) return false;
  if (!hasString(value, "name")) return false;
  if (!hasString(value, "type")) return false;
  if (!hasNumber(value, "hitPoints")) return false;
  if (!hasNumber(value, "armorClass")) return false;
  if (!hasString(value, "createdAt")) return false;
  return true;
};

export const readCharacters = (): Character[] =>
  safeReadArray(STORAGE_KEYS.characters, isCharacter).map(migrateCharacterRecord);

export const writeCharacters = (characters: Character[]) =>
  safeWriteArray(STORAGE_KEYS.characters, characters);

export const readNPCs = (): NPC[] => safeReadArray(STORAGE_KEYS.npcs, isNPC);

export const writeNPCs = (npcs: NPC[]) => safeWriteArray(STORAGE_KEYS.npcs, npcs);

export const readJournalEntries = (): JournalEntry[] =>
  safeReadArray(STORAGE_KEYS.journal, isJournalEntry);

export const writeJournalEntries = (entries: JournalEntry[]) =>
  safeWriteArray(STORAGE_KEYS.journal, entries);

