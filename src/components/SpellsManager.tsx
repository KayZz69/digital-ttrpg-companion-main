import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SpellSlots, PreparedSpell, DnD5eAbilityScores } from "@/types/character";
import { Sparkles, Plus, Minus, Trash2 } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

interface SpellsManagerProps {
  spellSlots: SpellSlots;
  preparedSpells: PreparedSpell[];
  spellcastingAbility: keyof DnD5eAbilityScores;
  abilityScores: DnD5eAbilityScores;
  level: number;
  onUpdateSpellSlots: (slots: SpellSlots) => void;
  onUpdatePreparedSpells: (spells: PreparedSpell[]) => void;
}

export const SpellsManager = ({
  spellSlots,
  preparedSpells,
  spellcastingAbility,
  abilityScores,
  level,
  onUpdateSpellSlots,
  onUpdatePreparedSpells,
}: SpellsManagerProps) => {
  const [isAddSpellOpen, setIsAddSpellOpen] = useState(false);
  const [newSpell, setNewSpell] = useState<Omit<PreparedSpell, "id">>({
    name: "",
    level: 0,
    school: "",
    castingTime: "",
    range: "",
    components: "",
    duration: "",
    description: "",
  });

  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getProficiencyBonus = (characterLevel: number): number => {
    return Math.ceil(characterLevel / 4) + 1;
  };

  const spellcastingMod = getModifier(abilityScores[spellcastingAbility]);
  const spellSaveDC = 8 + getProficiencyBonus(level) + spellcastingMod;
  const spellAttackBonus = getProficiencyBonus(level) + spellcastingMod;

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

    const spell: PreparedSpell = {
      ...newSpell,
      id: crypto.randomUUID(),
    };

    onUpdatePreparedSpells([...preparedSpells, spell]);
    setIsAddSpellOpen(false);
    setNewSpell({
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
      description: `${spell.name} has been added to prepared spells.`,
    });
  };

  const removeSpell = (spellId: string) => {
    const spell = preparedSpells.find((s) => s.id === spellId);
    onUpdatePreparedSpells(preparedSpells.filter((s) => s.id !== spellId));
    if (spell) {
      toast({
        title: "Spell Removed",
        description: `${spell.name} has been removed from prepared spells.`,
      });
    }
  };

  const spellLevelDisplay = (level: number) => {
    if (level === 0) return "Cantrip";
    return `Level ${level}`;
  };

  const sortedPreparedSpells = [...preparedSpells].sort((a, b) => a.level - b.level);

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
        <div className="flex gap-4 text-sm mt-4">
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
            <span className="ml-2 font-medium">
              {spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spell Slots */}
        <div>
          <h4 className="font-semibold mb-3">Spell Slots</h4>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(spellSlots) as Array<keyof SpellSlots>).map((slotKey) => {
              const slot = spellSlots[slotKey];
              const levelNum = parseInt(slotKey.replace("level", ""));
              
              if (slot.max === 0) return null;

              return (
                <div
                  key={slotKey}
                  className="p-3 rounded-lg bg-muted space-y-2"
                >
                  <div className="text-sm font-medium text-center">
                    Level {levelNum}
                  </div>
                  <div className="text-2xl font-bold text-center">
                    {slot.current} / {slot.max}
                  </div>
                  <div className="flex gap-1 justify-center">
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

        {/* Prepared Spells */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Prepared Spells</h4>
            <Dialog open={isAddSpellOpen} onOpenChange={setIsAddSpellOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Spell
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Prepared Spell</DialogTitle>
                  <DialogDescription>
                    Add a spell to your prepared spells list.
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
                          setNewSpell({ ...newSpell, level: parseInt(value) })
                        }
                      >
                        <SelectTrigger id="spell-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Cantrip</SelectItem>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                              Level {level}
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
                    Add Spell
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {preparedSpells.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No prepared spells yet. Add your first spell above.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedPreparedSpells.map((spell) => (
                  <div
                    key={spell.id}
                    className="p-4 rounded-lg bg-muted space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-semibold">{spell.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {spellLevelDisplay(spell.level)}
                          {spell.school && ` | ${spell.school}`}
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
                      <div className="text-sm space-y-1 pt-2 border-t">
                        {spell.castingTime && (
                          <p>
                            <span className="text-muted-foreground">Casting Time:</span>{" "}
                            {spell.castingTime}
                          </p>
                        )}
                        {spell.range && (
                          <p>
                            <span className="text-muted-foreground">Range:</span>{" "}
                            {spell.range}
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
                            <span className="text-muted-foreground">Duration:</span>{" "}
                            {spell.duration}
                          </p>
                        )}
                      </div>
                    )}
                    {spell.description && (
                      <p className="text-sm pt-2 border-t">{spell.description}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

