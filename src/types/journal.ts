/**
 * @fileoverview Type definitions for the session journal system.
 * Supports tagged journal entries for tracking campaign progress.
 */

/**
 * Categories for journal entry tags.
 * Used for filtering and organizing journal entries.
 */
export type JournalTagType = "location" | "npc" | "quest" | "combat" | "loot" | "general";

/**
 * A tag attached to a journal entry for categorization.
 * Multiple tags of the same or different types can be attached to one entry.
 */
export interface JournalTag {
  /** The category type of this tag */
  type: JournalTagType;
  /** The tag value (e.g., "Waterdeep" for a location tag) */
  value: string;
}

/**
 * A complete journal entry representing a session note or event log.
 * Entries are associated with a specific character and can span multiple sessions.
 */
export interface JournalEntry {
  /** Unique identifier for this entry (UUID) */
  id: string;
  /** ID of the character this entry belongs to */
  characterId: string;
  /** ISO 8601 timestamp string for localStorage compatibility */
  timestamp: string;
  /** Brief title summarizing the entry */
  title: string;
  /** Full markdown content of the journal entry */
  content: string;
  /** Array of tags for filtering and categorization */
  tags: JournalTag[];
  /** Optional session number for campaign tracking */
  sessionNumber?: number;
}
