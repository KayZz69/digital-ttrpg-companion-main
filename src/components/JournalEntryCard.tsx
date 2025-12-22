/**
 * @fileoverview Journal Entry Card component for displaying individual journal entries.
 * Shows entry content with tags, timestamps, and edit/delete actions.
 */

import { JournalEntry, JournalTag } from "@/types/journal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Target, Swords, Coins, FileText, Trash2, Edit, LucideIcon } from "lucide-react";
import { format } from "date-fns";

/**
 * Props for the JournalEntryCard component.
 */
interface JournalEntryCardProps {
  /** The journal entry to display */
  entry: JournalEntry;
  /** Optional callback when edit button is clicked */
  onEdit?: (entry: JournalEntry) => void;
  /** Optional callback when delete button is clicked */
  onDelete?: (id: string) => void;
}

/** Icon mapping for each tag type */
const tagIcons: Record<string, LucideIcon> = {
  location: MapPin,
  npc: User,
  quest: Target,
  combat: Swords,
  loot: Coins,
  general: FileText,
};

/** Color classes for each tag type */
const tagColors: Record<string, string> = {
  location: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  npc: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  quest: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  combat: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  loot: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  general: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

/**
 * Journal Entry Card component.
 * Displays a single journal entry with:
 * - Title and timestamp
 * - Session number (if provided)
 * - Content with preserved whitespace
 * - Color-coded tags with icons
 * - Edit and delete action buttons
 *
 * @param props - Component props including entry data and callbacks
 */
export const JournalEntryCard = ({ entry, onEdit, onDelete }: JournalEntryCardProps) => {
  const Icon = tagIcons.general;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1">{entry.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs">
              <Calendar className="w-3 h-3" />
              {format(new Date(entry.timestamp), "PPp")}
              {entry.sessionNumber && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Session {entry.sessionNumber}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(entry)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.content}</p>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {entry.tags.map((tag, idx) => {
              const TagIcon = tagIcons[tag.type] || FileText;
              return (
                <Badge
                  key={idx}
                  variant="outline"
                  className={tagColors[tag.type] || tagColors.general}
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.value}
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
