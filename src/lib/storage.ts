import { toast } from "@/hooks/use-toast";
import { Character } from "@/types/character";
import { JournalEntry } from "@/types/journal";
import { NPC } from "@/types/npc";

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
  safeReadArray(STORAGE_KEYS.characters, isCharacter);

export const writeCharacters = (characters: Character[]) =>
  safeWriteArray(STORAGE_KEYS.characters, characters);

export const readNPCs = (): NPC[] => safeReadArray(STORAGE_KEYS.npcs, isNPC);

export const writeNPCs = (npcs: NPC[]) => safeWriteArray(STORAGE_KEYS.npcs, npcs);

export const readJournalEntries = (): JournalEntry[] =>
  safeReadArray(STORAGE_KEYS.journal, isJournalEntry);

export const writeJournalEntries = (entries: JournalEntry[]) =>
  safeWriteArray(STORAGE_KEYS.journal, entries);

