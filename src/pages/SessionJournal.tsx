/**
 * @fileoverview Session Journal page for tracking adventure notes.
 * Provides CRUD operations for timestamped journal entries with tagging.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JournalEntry, JournalTag, JournalTagType } from "@/types/journal";
import { Character } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { ArrowLeft, BookOpen, Plus, Search, X, MapPin, User, Target, Swords, Coins, FileText, LucideIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { readCharacters, readJournalEntries, writeJournalEntries } from "@/lib/storage";

/**
 * Session Journal page component.
 * Provides a complete journal system for tracking campaign progress:
 * - Create, edit, and delete journal entries
 * - Tag entries with categories (location, NPC, quest, combat, loot, general)
 * - Search and filter by tag type
 * - Session number tracking
 *
 * @route /character/:id/journal
 */
export const SessionJournal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "not_found">("loading");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    sessionNumber: "",
  });
  const [currentTags, setCurrentTags] = useState<JournalTag[]>([]);
  const [newTagType, setNewTagType] = useState<JournalTagType>("general");
  const [newTagValue, setNewTagValue] = useState("");

  useEffect(() => {
    if (id) {
      loadCharacter(id);
      loadEntries(id);
    } else {
      setStatus("not_found");
    }
  }, [id]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, filterTag]);

  const loadCharacter = (characterId: string) => {
    const characters: Character[] = readCharacters();
    const found = characters.find((c) => c.id === characterId);
    if (found) {
      setCharacter(found);
      setStatus("ready");
    } else {
      setCharacter(null);
      setStatus("not_found");
      toast({
        title: "Character Not Found",
        description: "This journal cannot load because the character is missing.",
        variant: "destructive",
      });
    }
  };

  const loadEntries = (characterId: string) => {
    const allEntries: JournalEntry[] = readJournalEntries();
    const characterEntries = allEntries
      .filter((e) => e.characterId === characterId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setEntries(characterEntries);
  };

  const saveEntry = () => {
    if (!id || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and content for your entry.",
        variant: "destructive",
      });
      return;
    }

    const allEntries: JournalEntry[] = readJournalEntries();

    if (editingEntry) {
      // Update existing entry
      const index = allEntries.findIndex((e) => e.id === editingEntry.id);
      if (index !== -1) {
        allEntries[index] = {
          ...editingEntry,
          title: formData.title,
          content: formData.content,
          sessionNumber: formData.sessionNumber ? parseInt(formData.sessionNumber) : undefined,
          tags: currentTags,
        };
      }
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        characterId: id,
        timestamp: new Date().toISOString(),
        title: formData.title,
        content: formData.content,
        sessionNumber: formData.sessionNumber ? parseInt(formData.sessionNumber) : undefined,
        tags: currentTags,
      };
      allEntries.push(newEntry);
    }

    writeJournalEntries(allEntries);
    loadEntries(id);
    resetForm();

    toast({
      title: editingEntry ? "Entry Updated" : "Entry Saved",
      description: editingEntry ? "Your journal entry has been updated." : "Your journal entry has been saved.",
    });
  };

  const deleteEntry = (entryId: string) => {
    const allEntries: JournalEntry[] = readJournalEntries();
    const filtered = allEntries.filter((e) => e.id !== entryId);
    writeJournalEntries(filtered);
    loadEntries(id!);

    toast({
      title: "Entry Deleted",
      description: "Your journal entry has been deleted.",
    });
  };

  const editEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      sessionNumber: entry.sessionNumber?.toString() || "",
    });
    setCurrentTags(entry.tags);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", sessionNumber: "" });
    setCurrentTags([]);
    setNewTagValue("");
    setShowForm(false);
    setEditingEntry(null);
  };

  const addTag = () => {
    if (newTagValue.trim()) {
      setCurrentTags([...currentTags, { type: newTagType, value: newTagValue.trim() }]);
      setNewTagValue("");
    }
  };

  const removeTag = (index: number) => {
    setCurrentTags(currentTags.filter((_, i) => i !== index));
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.content.toLowerCase().includes(query) ||
          e.tags.some((t) => t.value.toLowerCase().includes(query))
      );
    }

    if (filterTag !== "all") {
      filtered = filtered.filter((e) => e.tags.some((t) => t.type === filterTag));
    }

    setFilteredEntries(filtered);
  };

  const tagTypeIcons: Record<JournalTagType, LucideIcon> = {
    location: MapPin,
    npc: User,
    quest: Target,
    combat: Swords,
    loot: Coins,
    general: FileText,
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (status === "not_found" || !character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Journal Unavailable</CardTitle>
            <CardDescription>
              The selected character could not be loaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/characters")} className="w-full">
              Back to Characters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(`/character/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Character
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "New Entry"}
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Session Journal</CardTitle>
                <CardDescription>
                  {character.data.name}'s Adventure Log
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <hr className="fantasy-divider" />

        {showForm && (
          <Card className="mb-6 border-primary/50">
            <CardHeader>
              <CardTitle>{editingEntry ? "Edit Entry" : "New Journal Entry"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Entry title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium">Session # (optional)</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.sessionNumber}
                    onChange={(e) => setFormData({ ...formData, sessionNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="What happened in this session..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2">
                  <Select value={newTagType} onValueChange={(v) => setNewTagType(v as JournalTagType)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="npc">NPC</SelectItem>
                      <SelectItem value="quest">Quest</SelectItem>
                      <SelectItem value="combat">Combat</SelectItem>
                      <SelectItem value="loot">Loot</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tag value..."
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    className="flex-1"
                  />
                  <Button onClick={addTag} type="button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {currentTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentTags.map((tag, idx) => {
                      const TagIcon = tagTypeIcons[tag.type];
                      return (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          <TagIcon className="w-3 h-3" />
                          {tag.value}
                          <button onClick={() => removeTag(idx)} className="ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveEntry} className="flex-1">
                  {editingEntry ? "Update Entry" : "Save Entry"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="npc">NPC</SelectItem>
              <SelectItem value="quest">Quest</SelectItem>
              <SelectItem value="combat">Combat</SelectItem>
              <SelectItem value="loot">Loot</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <hr className="fantasy-divider" />

        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {entries.length === 0 ? (
                  <div>
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No journal entries yet. Start documenting your adventure!</p>
                  </div>
                ) : (
                  <p>No entries match your search.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={editEntry}
                onDelete={deleteEntry}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
