import { useState } from "react";
import { DnD5eCharacter } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { getClassSpells, isSpellcastingClass, toPreparedSpell } from "@/lib/dndCompendium";
import { getDefaultSpellSlots, getHighestSlotLevel } from "@/lib/dndRules";

interface SpellSelectionStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

const levelLabel = (level: number): string => (level === 0 ? "Cantrip" : `Level ${level}`);

export const SpellSelectionStep = ({ character, setCharacter }: SpellSelectionStepProps) => {
  const [query, setQuery] = useState("");
  const className = character.class || "";
  const level = character.level || 1;
  const selectedSpells = character.preparedSpells || [];

  if (!className || !isSpellcastingClass(className)) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Spell Selection</CardTitle>
          <CardDescription>
            Spell selection is only available for spellcasting classes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const slotTemplate = getDefaultSpellSlots(className, level);
  const highestSlotLevel = Math.max(getHighestSlotLevel(slotTemplate), 1);
  const classSpells = getClassSpells(className);

  const filteredSpells = classSpells.filter((spell) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (spell.level > highestSlotLevel && spell.level !== 0) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      spell.name.toLowerCase().includes(normalizedQuery) ||
      spell.school.toLowerCase().includes(normalizedQuery)
    );
  });

  const selectedIds = new Set(
    selectedSpells
      .map((spell) => spell.sourceSpellId)
      .filter((id): id is string => typeof id === "string")
  );

  const toggleSpell = (spellId: string) => {
    const selected = classSpells.find((spell) => spell.id === spellId);
    if (!selected) {
      return;
    }

    const existing = selectedSpells.find((spell) => spell.sourceSpellId === spellId);
    if (existing) {
      setCharacter({
        ...character,
        preparedSpells: selectedSpells.filter((spell) => spell.id !== existing.id),
      });
      return;
    }

    setCharacter({
      ...character,
      preparedSpells: [...selectedSpells, toPreparedSpell(selected)],
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Choose Starting Spells
              </CardTitle>
              <CardDescription>
                Showing {className} spells up to {levelLabel(highestSlotLevel)} for level {level}
              </CardDescription>
            </div>
            <Badge variant="secondary">{selectedSpells.length} selected</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search spells by name or school..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-2">
              {filteredSpells.map((spell) => {
                const checked = selectedIds.has(spell.id);
                return (
                  <label
                    key={spell.id}
                    htmlFor={`spell-${spell.id}`}
                    className="flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40"
                  >
                    <Checkbox
                      id={`spell-${spell.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleSpell(spell.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{spell.name}</p>
                        <Badge variant="outline">{levelLabel(spell.level)}</Badge>
                        <Badge variant="secondary">{spell.school}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {spell.castingTime} | {spell.range} | {spell.duration}
                      </p>
                    </div>
                  </label>
                );
              })}
              {filteredSpells.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No spells match your filters.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
