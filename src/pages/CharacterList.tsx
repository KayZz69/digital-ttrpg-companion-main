/**
 * @fileoverview Character List page displaying all saved characters.
 * Provides search, filtering by game system, and CRUD operations.
 */

import { useState, useEffect } from "react";
import { Character } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Eye, Edit, Search, Dices } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { readCharacters, writeCharacters } from "@/lib/storage";

/**
 * Character List page component.
 * Displays all saved characters in a responsive grid with:
 * - Search by character name
 * - Filter by game system
 * - View, edit, and delete actions
 *
 * @route /characters
 */
export const CharacterList = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [systemFilter, setSystemFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    filterCharacters();
  }, [characters, searchQuery, systemFilter]);

  /** Loads all characters from localStorage */
  const loadCharacters = () => {
    setCharacters(readCharacters());
  };

  /** Filters characters based on current search query and system filter */
  const filterCharacters = () => {
    let filtered = [...characters];

    // Filter by system
    if (systemFilter !== "all") {
      filtered = filtered.filter((char) => char.system === systemFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((char) =>
        char.data.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCharacters(filtered);
  };

  /**
   * Opens delete confirmation dialog for a character.
   * @param id - The character's UUID to delete
   */
  const handleDelete = (id: string) => {
    setCharacterToDelete(id);
    setDeleteDialogOpen(true);
  };

  /** Confirms character deletion and persists to localStorage */
  const confirmDelete = () => {
    if (characterToDelete) {
      const updated = characters.filter((char) => char.id !== characterToDelete);
      writeCharacters(updated);
      setCharacters(updated);
      toast({
        title: "Character Deleted",
        description: "The character has been removed.",
      });
    }
    setDeleteDialogOpen(false);
    setCharacterToDelete(null);
  };

  /**
   * Returns a human-readable label for a game system code.
   * @param system - The system code (e.g., "dnd5e")
   */
  const getSystemLabel = (system: string) => {
    switch (system) {
      case "dnd5e":
        return "D&D 5e";
      case "dragonbane":
        return "Dragonbane";
      case "cyberpunk":
        return "Cyberpunk Red";
      default:
        return system;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Characters</h1>
            <p className="text-muted-foreground">
              Manage your adventurers across different game systems
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dice")}>
              <Dices className="w-4 h-4 mr-2" />
              Dice Roller
            </Button>
            <Button onClick={() => navigate("/")} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Character
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by character name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Game System</label>
                <Select value={systemFilter} onValueChange={setSystemFilter}>
                  <SelectTrigger className="bg-popover">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All Systems</SelectItem>
                    <SelectItem value="dnd5e">D&D 5th Edition</SelectItem>
                    <SelectItem value="dragonbane">Dragonbane</SelectItem>
                    <SelectItem value="cyberpunk">Cyberpunk Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Grid */}
        {filteredCharacters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {characters.length === 0
                  ? "No characters yet. Create your first adventurer!"
                  : "No characters match your filters."}
              </p>
              {characters.length === 0 && (
                <Button onClick={() => navigate("/")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Character
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <Card key={character.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {getSystemLabel(character.system)}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{character.data.name}</CardTitle>
                  <CardDescription>
                    {character.system === "dnd5e" && (
                      <>
                        {character.data.race} {character.data.class} | Level{" "}
                        {character.data.level}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/character/${character.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/character/${character.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(character.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the character
              from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

