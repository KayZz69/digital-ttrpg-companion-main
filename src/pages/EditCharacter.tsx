/**
 * @fileoverview Inline character edit page for post-creation field changes.
 * Allows editing: name, max HP, alignment, notes.
 * Locks: class, race, level (these require re-creation or level-up).
 *
 * @route /character/:id/edit
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Character, DnD5eCharacter } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Lock, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { readCharacters, writeCharacters } from "@/lib/storage";
import { getProficiencyBonus } from "@/lib/dndRules";

interface EditFormState {
  name: string;
  currentHP: number;
  maxHP: number;
  alignment: string;
  notes: string;
}

interface ValidationErrors {
  name?: string;
  currentHP?: string;
  maxHP?: string;
}

function validate(form: EditFormState): ValidationErrors {
  const errors: ValidationErrors = {};
  const trimmedName = form.name.trim();
  if (!trimmedName) {
    errors.name = "Character name is required.";
  } else if (trimmedName.length > 60) {
    errors.name = "Name must be 60 characters or fewer.";
  }
  if (!Number.isFinite(form.maxHP) || form.maxHP < 1) {
    errors.maxHP = "Max HP must be at least 1.";
  } else if (form.maxHP > 999) {
    errors.maxHP = "Max HP cannot exceed 999.";
  }
  if (!Number.isFinite(form.currentHP) || form.currentHP < 0) {
    errors.currentHP = "Current HP cannot be negative.";
  }
  return errors;
}

export const EditCharacter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [form, setForm] = useState<EditFormState>({
    name: "",
    currentHP: 1,
    maxHP: 1,
    alignment: "",
    notes: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<"loading" | "ready" | "not_found">("loading");

  useEffect(() => {
    if (!id) {
      setStatus("not_found");
      return;
    }
    const characters = readCharacters();
    const found = characters.find((c) => c.id === id);
    if (found) {
      const dnd = found.data as DnD5eCharacter;
      setCharacter(found);
      setForm({
        name: dnd.name,
        currentHP: dnd.hitPoints.current,
        maxHP: dnd.hitPoints.max,
        alignment: dnd.alignment || "",
        notes: (dnd as DnD5eCharacter & { notes?: string }).notes || "",
      });
      setStatus("ready");
    } else {
      setStatus("not_found");
      toast({
        title: "Character Not Found",
        description: "The character you're trying to edit doesn't exist.",
        variant: "destructive",
      });
    }
  }, [id]);

  const handleSave = () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (!character || !id) return;

    const dnd = character.data as DnD5eCharacter;
    const newMaxHP = form.maxHP;
    const newCurrentHP = Math.min(form.currentHP, newMaxHP);

    const updatedData: DnD5eCharacter = {
      ...dnd,
      name: form.name.trim(),
      alignment: form.alignment.trim() || undefined,
      hitPoints: {
        current: newCurrentHP,
        max: newMaxHP,
      },
    };

    // Store notes if provided (future-safe field)
    if (form.notes.trim()) {
      (updatedData as DnD5eCharacter & { notes?: string }).notes = form.notes.trim();
    }

    const characters = readCharacters();
    const index = characters.findIndex((c) => c.id === id);
    if (index !== -1) {
      characters[index] = {
        ...characters[index],
        updatedAt: new Date().toISOString(),
        data: updatedData,
      };
      writeCharacters(characters);
      toast({
        title: "Character Updated",
        description: `${form.name.trim()} has been saved.`,
      });
      navigate(`/character/${id}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading character...</p>
      </div>
    );
  }

  if (status === "not_found" || !character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Character Not Found</CardTitle>
            <CardDescription>This character could not be loaded.</CardDescription>
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

  const dndCharacter = character.data as DnD5eCharacter;
  const profBonus = getProficiencyBonus(dndCharacter.level);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/character/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Character Sheet
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Edit Character</CardTitle>
            <CardDescription>
              {dndCharacter.race} {dndCharacter.class} &middot; Level {dndCharacter.level} &middot; Prof +{profBonus}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Editable: Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Character Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                maxLength={60}
                placeholder="Character name"
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Editable: Hit Points */}
            <div className="space-y-2">
              <Label>Hit Points</Label>
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-current-hp" className="text-xs text-muted-foreground">Current</Label>
                  <Input
                    id="edit-current-hp"
                    type="number"
                    min={0}
                    max={form.maxHP}
                    value={form.currentHP}
                    onChange={(e) => {
                      setForm({ ...form, currentHP: parseInt(e.target.value) || 0 });
                      if (errors.currentHP) setErrors({ ...errors, currentHP: undefined });
                    }}
                    className="w-24"
                  />
                </div>
                <span className="text-muted-foreground mt-5">/</span>
                <div className="space-y-1">
                  <Label htmlFor="edit-max-hp" className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    id="edit-max-hp"
                    type="number"
                    min={1}
                    max={999}
                    value={form.maxHP}
                    onChange={(e) => {
                      setForm({ ...form, maxHP: parseInt(e.target.value) || 0 });
                      if (errors.maxHP) setErrors({ ...errors, maxHP: undefined });
                    }}
                    className="w-24"
                  />
                </div>
              </div>
              {errors.currentHP && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.currentHP}
                </p>
              )}
              {errors.maxHP && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.maxHP}
                </p>
              )}
            </div>

            {/* Editable: Alignment */}
            <div className="space-y-2">
              <Label htmlFor="edit-alignment">Alignment</Label>
              <Input
                id="edit-alignment"
                value={form.alignment}
                onChange={(e) => setForm({ ...form, alignment: e.target.value })}
                placeholder="e.g., Chaotic Good"
                maxLength={40}
              />
            </div>

            {/* Editable: Notes */}
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Backstory, session notes, DM reminders..."
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.notes.length} / 2000
              </p>
            </div>

            <hr className="my-2" />

            {/* Locked Fields */}
            <div className="space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                Locked Fields
              </p>
              <p className="text-xs text-muted-foreground">
                Race, class, and level cannot be changed here. To change your race or class, create a new character.
                To change your level, use the Level Up feature on the character sheet.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <LockedField label="Race" value={dndCharacter.race} />
                <LockedField label="Class" value={dndCharacter.class} />
                <LockedField label="Level" value={String(dndCharacter.level)} />
              </div>
            </div>

            {/* Save */}
            <div className="pt-4">
              <Button onClick={handleSave} size="lg" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/60 border border-muted">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm flex items-center gap-1">
        <Lock className="w-3 h-3 text-muted-foreground" />
        {value}
      </p>
    </div>
  );
}
