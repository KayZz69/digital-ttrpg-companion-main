import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpellSlots, PreparedSpell, DnD5eAbilityScores } from "@/types/character";
import { Sparkles, Plus, Minus, Trash2, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getClassSpells, toPreparedSpell } from "@/lib/dndCompendium";
import {
  formatModifier,
  getAbilityModifier,
  getHighestSlotLevel,
  getProficiencyBonus,
  getSpellSelectionState,
  validateSpellSelection,
} from "@/lib/dndRules";

interface SpellsManagerProps {
  spellSlots: SpellSlots;
  preparedSpells: PreparedSpell[];
  characterClass?: string;
  spellcastingAbility: keyof DnD5eAbilityScores;
  abilityScores: DnD5eAbilityScores;
  level: number;
  onUpdateSpellSlots: (slots: SpellSlots) => void;
  onUpdatePreparedSpells: (spells: PreparedSpell[]) => void;
}

export const SpellsManager = ({
  spellSlots,
  preparedSpells,
  characterClass,
  spellcastingAbility,
  abilityScores,
  level,
  onUpdateSpellSlots,
  onUpdatePreparedSpells,
}: SpellsManagerProps) => {
  const [isAddSpellOpen, setIsAddSpellOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [compendiumLevelFilter, setCompendiumLevelFilter] = useState<string>("all");
  const [newSpell, setNewSpell] = useState<Omit<PreparedSpell, "id">>({
    sourceSpellId: undefined,
    name: "",
    level: 0,
    school: "",
    castingTime: "",
    range: "",
    components: "",
    duration: "",
    description: "",
  });

  const spellcastingMod = getAbilityModifier(abilityScores[spellcastingAbility]);
  const proficiencyBonus = getProficiencyBonus(level);
  const spellSaveDC = 8 + proficiencyBonus + spellcastingMod;
  const spellAttackBonus = proficiencyBonus + spellcastingMod;
  const spellSelectionState = getSpellSelectionState(
    characterClass || "",
    level,
    abilityScores[spellcastingAbility],
    preparedSpells
  );
  const isLeveledCapReached =
    spellSelectionState.maxLeveledSpells !== null &&
    spellSelectionState.currentLeveledSpells >= spellSelectionState.maxLeveledSpells;
  const spellListLabel = spellSelectionState.mode === "known" ? "Known Spells" : "Prepared Spells";

  const maxSlotLevel = getHighestSlotLevel(spellSlots);

  const classSpells = useMemo(() => {
    if (!characterClass) {
      return [];
    }
    return getClassSpells(characterClass);
  }, [characterClass]);

  const filteredClassSpells = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return classSpells.filter((spell) => {
      const levelAllowed = spell.level === 0 || spell.level <= maxSlotLevel;
      if (!levelAllowed) {
        return false;
      }
      if (compendiumLevelFilter !== "all" && spell.level !== Number(compendiumLevelFilter)) {
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
  }, [classSpells, compendiumLevelFilter, maxSlotLevel, query]);

  const adjustSlot = (slotLevel: keyof SpellSlots, amount: number) => {
    const updatedSlots = { ...spellSlots };
    const newCurrent = Math.max(
      0,
      Math.min(
        updatedSlots[slotLevel].current + amount,
        updatedSlots[slotLevel].max
      )
    );
    updatedSlots[slotLevel] = {
      ...updatedSlots[slotLevel],
      current: newCurrent,
    };
    onUpdateSpellSlots(updatedSlots);
  };

  const restoreAllSlots = () => {
    const restoredSlots = { ...spellSlots };
    (Object.keys(restoredSlots) as Array<keyof SpellSlots>).forEach((key) => {
      restoredSlots[key].current = restoredSlots[key].max;
    });
    onUpdateSpellSlots(restoredSlots);
    toast({
      title: "Spell Slots Restored",
      description: "All spell slots have been restored to maximum.",
    });
  };

  const addSpell = () => {
    if (!newSpell.name.trim()) {
      toast({
        title: "Invalid Spell",
        description: "Please enter a spell name.",
        variant: "destructive",
      });
      return;
    }
    const validation = validateSpellSelection(
      characterClass || "",
      level,
      abilityScores[spellcastingAbility],
      preparedSpells,
      newSpell.level
    );
    if (!validation.canAdd) {
      toast({
        title: "Spell Limit Reached",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }

    const spell: PreparedSpell = {
      ...newSpell,
      id: crypto.randomUUID(),
      sourceSpellId: undefined,
    };

    onUpdatePreparedSpells([...preparedSpells, spell]);
    setIsAddSpellOpen(false);
    setNewSpell({
      sourceSpellId: undefined,
      name: "",
      level: 0,
      school: "",
      castingTime: "",
      range: "",
      components: "",
      duration: "",
      description: "",
    });
    toast({
      title: "Spell Added",
      description: `${spell.name} has been added to ${spellSelectionState.label.toLowerCase()}.`,
    });
  };

  const addCompendiumSpell = (spellId: string) => {
    const selected = classSpells.find((spell) => spell.id === spellId);
    if (!selected) {
      return;
    }

    if (preparedSpells.some((spell) => spell.sourceSpellId === selected.id)) {
      toast({
        title: "Already Added",
        description: `${selected.name} is already in ${spellSelectionState.label.toLowerCase()}.`,
      });
      return;
    }
    const validation = validateSpellSelection(
      characterClass || "",
      level,
      abilityScores[spellcastingAbility],
      preparedSpells,
      selected.level
    );
    if (!validation.canAdd) {
      toast({
        title: "Spell Limit Reached",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }

    onUpdatePreparedSpells([...preparedSpells, toPreparedSpell(selected)]);
    toast({
      title: "Spell Added",
      description: `${selected.name} added from compendium.`,
    });
  };

  const removeSpell = (spellId: string) => {
    const spell = preparedSpells.find((s) => s.id === spellId);
    onUpdatePreparedSpells(preparedSpells.filter((s) => s.id !== spellId));
    if (spell) {
      toast({
        title: "Spell Removed",
        description: `${spell.name} has been removed from ${spellSelectionState.label.toLowerCase()}.`,
      });
    }
  };

  const spellLevelDisplay = (spellLevel: number) => {
    if (spellLevel === 0) return "Cantrip";
    return `Level ${spellLevel}`;
  };

  const sortedPreparedSpells = [...preparedSpells].sort((a, b) =>
    a.level === b.level ? a.name.localeCompare(b.name) : a.level - b.level
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Spellcasting
          </CardTitle>
          <Button variant="outline" size="sm" onClick={restoreAllSlots}>
            Restore All Slots
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Spellcasting Ability:</span>
            <span className="ml-2 font-medium capitalize">{spellcastingAbility}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Spell Save DC:</span>
            <span className="ml-2 font-medium">{spellSaveDC}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Spell Attack:</span>
            <span className="ml-2 font-medium">{formatModifier(spellAttackBonus)}</span>
          </div>
          {spellSelectionState.maxLeveledSpells !== null && (
            <div>
              <span className="text-muted-foreground">{spellSelectionState.label}:</span>
              <span className="ml-2 font-medium">
                {spellSelectionState.currentLeveledSpells}/{spellSelectionState.maxLeveledSpells} leveled
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {spellSelectionState.isOverLimit && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {spellSelectionState.label} are currently over the class limit. Remove leveled spells to resolve this.
          </p>
        )}
        <div>
          <h4 className="mb-3 font-semibold">Spell Slots</h4>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(spellSlots) as Array<keyof SpellSlots>).map((slotKey) => {
              const slot = spellSlots[slotKey];
              const levelNum = Number(slotKey.replace("level", ""));

              if (slot.max === 0) return null;

              return (
                <div key={slotKey} className="space-y-2 rounded-lg bg-muted p-3">
                  <div className="text-center text-sm font-medium">Level {levelNum}</div>
                  <div className="text-center text-2xl font-bold">
                    {slot.current} / {slot.max}
                  </div>
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => adjustSlot(slotKey, -1)}
                      disabled={slot.current === 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => adjustSlot(slotKey, 1)}
                      disabled={slot.current >= slot.max}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {characterClass && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <h4 className="font-semibold">Class Spell Compendium</h4>
              <Badge variant="secondary">{characterClass}</Badge>
            </div>
            <div className="mb-3 grid gap-3 md:grid-cols-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search class spells..."
              />
              <Select value={compendiumLevelFilter} onValueChange={setCompendiumLevelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="0">Cantrips</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((spellLevel) => (
                    <SelectItem key={spellLevel} value={String(spellLevel)}>
                      Level {spellLevel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[220px] rounded-md border p-2">
              <div className="space-y-2">
                {filteredClassSpells.map((spell) => (
                  <div
                    key={spell.id}
                    className="flex items-start justify-between gap-2 rounded-md border bg-card p-2"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{spell.name}</p>
                        <Badge variant="outline">{spellLevelDisplay(spell.level)}</Badge>
                        <Badge variant="secondary">{spell.school}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {spell.castingTime} | {spell.range} | {spell.duration}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addCompendiumSpell(spell.id)}
                      disabled={
                        preparedSpells.some((prepared) => prepared.sourceSpellId === spell.id) ||
                        (spell.level > 0 && isLeveledCapReached)
                      }
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                  </div>
                ))}
                {filteredClassSpells.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No class spells match this filter.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">{spellListLabel}</h4>
            <Dialog open={isAddSpellOpen} onOpenChange={setIsAddSpellOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 w-4 h-4" />
                  Add Custom Spell
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Custom {spellListLabel.slice(0, -1)}</DialogTitle>
                  <DialogDescription>
                    Add a homebrew or custom spell not present in the compendium.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="spell-name">Spell Name</Label>
                    <Input
                      id="spell-name"
                      value={newSpell.name}
                      onChange={(e) =>
                        setNewSpell({ ...newSpell, name: e.target.value })
                      }
                      placeholder="Fireball"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="spell-level">Level</Label>
                      <Select
                        value={newSpell.level.toString()}
                        onValueChange={(value) =>
                          setNewSpell({ ...newSpell, level: parseInt(value, 10) })
                        }
                      >
                        <SelectTrigger id="spell-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Cantrip</SelectItem>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((spellLevel) => (
                            <SelectItem key={spellLevel} value={spellLevel.toString()}>
                              Level {spellLevel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="spell-school">School</Label>
                      <Input
                        id="spell-school"
                        value={newSpell.school}
                        onChange={(e) =>
                          setNewSpell({ ...newSpell, school: e.target.value })
                        }
                        placeholder="Evocation"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="casting-time">Casting Time</Label>
                      <Input
                        id="casting-time"
                        value={newSpell.castingTime}
                        onChange={(e) =>
                          setNewSpell({ ...newSpell, castingTime: e.target.value })
                        }
                        placeholder="1 action"
                      />
                    </div>
                    <div>
                      <Label htmlFor="range">Range</Label>
                      <Input
                        id="range"
                        value={newSpell.range}
                        onChange={(e) =>
                          setNewSpell({ ...newSpell, range: e.target.value })
                        }
                        placeholder="150 feet"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="components">Components</Label>
                      <Input
                        id="components"
                        value={newSpell.components}
                        onChange={(e) =>
                          setNewSpell({ ...newSpell, components: e.target.value })
                        }
                        placeholder="V, S, M"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={newSpell.duration}
                        onChange={(e) =>
                          setNewSpell({ ...newSpell, duration: e.target.value })
                        }
                        placeholder="Instantaneous"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSpell.description}
                      onChange={(e) =>
                        setNewSpell({ ...newSpell, description: e.target.value })
                      }
                      placeholder="Spell description..."
                      rows={5}
                    />
                  </div>
                  <Button onClick={addSpell} className="w-full">
                    Add Custom Spell
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {preparedSpells.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No {spellSelectionState.mode === "known" ? "known" : "prepared"} spells yet. Add from compendium or create a custom one.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedPreparedSpells.map((spell) => (
                <div key={spell.id} className="space-y-2 rounded-lg bg-muted p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold">{spell.name}</h5>
                      <p className="text-sm text-muted-foreground">
                        {spellLevelDisplay(spell.level)}
                        {spell.school && ` | ${spell.school}`}
                        {spell.sourceSpellId && " | Compendium"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeSpell(spell.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {(spell.castingTime || spell.range || spell.components || spell.duration) && (
                    <div className="space-y-1 border-t pt-2 text-sm">
                      {spell.castingTime && (
                        <p>
                          <span className="text-muted-foreground">Casting Time:</span>{" "}
                          {spell.castingTime}
                        </p>
                      )}
                      {spell.range && (
                        <p>
                          <span className="text-muted-foreground">Range:</span> {spell.range}
                        </p>
                      )}
                      {spell.components && (
                        <p>
                          <span className="text-muted-foreground">Components:</span>{" "}
                          {spell.components}
                        </p>
                      )}
                      {spell.duration && (
                        <p>
                          <span className="text-muted-foreground">Duration:</span> {spell.duration}
                        </p>
                      )}
                    </div>
                  )}
                  {spell.description && <p className="border-t pt-2 text-sm">{spell.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
