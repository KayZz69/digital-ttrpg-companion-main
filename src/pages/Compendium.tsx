import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { getAllClasses, getAllSpells } from "@/data";
import {
  getAllCompendiumEquipment,
  getClassSpells,
  toInventoryItem,
  toPreparedSpell,
  type CompendiumEquipmentItem,
} from "@/lib/dndCompendium";
import { readCharacters, writeCharacters } from "@/lib/storage";
import { getSpellSelectionState, validateSpellSelection } from "@/lib/dndRules";
import type { Character, DnD5eCharacter } from "@/types/character";

const PAGE_SIZE = 40;

type CompendiumTab = "spells" | "equipment";
type SpellTagFilter = "all" | "ritual" | "concentration" | "either";
type EquipmentTypeFilter = "all" | "weapon" | "armor" | "adventuringGear";

const normalize = (value: string): string => value.trim().toLowerCase();

const toCostInGp = (quantity: number, unit: "cp" | "sp" | "gp" | "pp"): number => {
  if (unit === "cp") return quantity / 100;
  if (unit === "sp") return quantity / 10;
  if (unit === "pp") return quantity * 10;
  return quantity;
};

const toPagedSlice = <T,>(items: T[], page: number): T[] => {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
};

const clampPage = (page: number, totalPages: number): number => Math.min(Math.max(page, 1), totalPages);

export const Compendium = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<CompendiumTab>("spells");
  const [isTabLoading, setIsTabLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [spellClassFilter, setSpellClassFilter] = useState<string>("all");
  const [spellLevelFilter, setSpellLevelFilter] = useState<string>("all");
  const [spellSchoolFilter, setSpellSchoolFilter] = useState<string>("all");
  const [spellTagFilter, setSpellTagFilter] = useState<SpellTagFilter>("all");
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState<EquipmentTypeFilter>("all");
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState<string>("all");
  const [equipmentMaxCostGp, setEquipmentMaxCostGp] = useState("");
  const [equipmentMaxWeight, setEquipmentMaxWeight] = useState("");
  const [spellPage, setSpellPage] = useState(1);
  const [equipmentPage, setEquipmentPage] = useState(1);

  const [linkedCharacter, setLinkedCharacter] = useState<Character | null>(null);
  const characterId = searchParams.get("characterId");

  const allSpells = useMemo(
    () =>
      [...getAllSpells()].sort((a, b) =>
        a.level === b.level ? a.name.localeCompare(b.name) : a.level - b.level
      ),
    []
  );
  const allEquipment = useMemo(() => getAllCompendiumEquipment(), []);
  const classNames = useMemo(() => getAllClasses().map((entry) => entry.name).sort(), []);
  const spellSchools = useMemo(
    () => Array.from(new Set(allSpells.map((spell) => spell.school))).sort(),
    [allSpells]
  );

  useEffect(() => {
    if (!characterId) {
      setLinkedCharacter(null);
      return;
    }
    const characters = readCharacters();
    const found = characters.find((entry) => entry.id === characterId) || null;
    setLinkedCharacter(found);
  }, [characterId]);

  useEffect(() => {
    setIsTabLoading(true);
    const timer = window.setTimeout(() => setIsTabLoading(false), 120);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    setSpellPage(1);
  }, [query, spellClassFilter, spellLevelFilter, spellSchoolFilter, spellTagFilter]);

  useEffect(() => {
    setEquipmentPage(1);
  }, [query, equipmentTypeFilter, equipmentCategoryFilter, equipmentMaxCostGp, equipmentMaxWeight]);

  const linkedDndCharacter =
    linkedCharacter && linkedCharacter.system === "dnd5e"
      ? (linkedCharacter.data as DnD5eCharacter)
      : null;
  const linkedCharacterName = linkedDndCharacter?.name || "";
  const linkedClassSpellIds = useMemo(() => {
    if (!linkedDndCharacter) {
      return new Set<string>();
    }
    return new Set(getClassSpells(linkedDndCharacter.class).map((spell) => spell.id));
  }, [linkedDndCharacter]);

  const filteredSpells = useMemo(() => {
    const normalizedQuery = normalize(query);
    return allSpells.filter((spell) => {
      if (
        spellClassFilter !== "all" &&
        !spell.classes.some((entry) => normalize(entry) === normalize(spellClassFilter))
      ) {
        return false;
      }
      if (spellLevelFilter !== "all" && spell.level !== Number(spellLevelFilter)) {
        return false;
      }
      if (spellSchoolFilter !== "all" && spell.school !== spellSchoolFilter) {
        return false;
      }
      if (spellTagFilter === "ritual" && !spell.ritual) {
        return false;
      }
      if (spellTagFilter === "concentration" && !spell.concentration) {
        return false;
      }
      if (spellTagFilter === "either" && !spell.ritual && !spell.concentration) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return (
        normalize(spell.name).includes(normalizedQuery) ||
        normalize(spell.school).includes(normalizedQuery) ||
        normalize(spell.description).includes(normalizedQuery)
      );
    });
  }, [allSpells, query, spellClassFilter, spellLevelFilter, spellSchoolFilter, spellTagFilter]);

  const equipmentCategories = useMemo(() => {
    const categories = allEquipment
      .filter((entry) => equipmentTypeFilter === "all" || entry.type === equipmentTypeFilter)
      .map((entry) => entry.category);
    return Array.from(new Set(categories)).sort();
  }, [allEquipment, equipmentTypeFilter]);

  const filteredEquipment = useMemo(() => {
    const normalizedQuery = normalize(query);
    const maxCost = parseFloat(equipmentMaxCostGp);
    const maxWeight = parseFloat(equipmentMaxWeight);
    const hasMaxCost = !Number.isNaN(maxCost);
    const hasMaxWeight = !Number.isNaN(maxWeight);

    return allEquipment.filter((entry) => {
      if (equipmentTypeFilter !== "all" && entry.type !== equipmentTypeFilter) {
        return false;
      }
      if (equipmentCategoryFilter !== "all" && entry.category !== equipmentCategoryFilter) {
        return false;
      }
      if (hasMaxCost) {
        const costGp = toCostInGp(entry.source.cost.quantity, entry.source.cost.unit);
        if (costGp > maxCost) {
          return false;
        }
      }
      if (hasMaxWeight && entry.weight > maxWeight) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return (
        normalize(entry.name).includes(normalizedQuery) ||
        normalize(entry.category).includes(normalizedQuery) ||
        normalize(entry.description || "").includes(normalizedQuery)
      );
    });
  }, [
    allEquipment,
    query,
    equipmentTypeFilter,
    equipmentCategoryFilter,
    equipmentMaxCostGp,
    equipmentMaxWeight,
  ]);

  const spellTotalPages = Math.max(1, Math.ceil(filteredSpells.length / PAGE_SIZE));
  const equipmentTotalPages = Math.max(1, Math.ceil(filteredEquipment.length / PAGE_SIZE));
  const currentSpellPage = clampPage(spellPage, spellTotalPages);
  const currentEquipmentPage = clampPage(equipmentPage, equipmentTotalPages);
  const pagedSpells = toPagedSlice(filteredSpells, currentSpellPage);
  const pagedEquipment = toPagedSlice(filteredEquipment, currentEquipmentPage);

  const updateLinkedCharacter = (
    updater: (characterData: DnD5eCharacter) => DnD5eCharacter
  ): boolean => {
    if (!characterId) {
      return false;
    }
    const characters = readCharacters();
    const index = characters.findIndex((entry) => entry.id === characterId);
    if (index === -1 || characters[index].system !== "dnd5e") {
      return false;
    }

    const updatedData = updater(characters[index].data as DnD5eCharacter);
    characters[index] = {
      ...characters[index],
      updatedAt: new Date().toISOString(),
      data: updatedData,
    };
    writeCharacters(characters);
    setLinkedCharacter(characters[index]);
    return true;
  };

  const getSpellActionState = (spellId: string, spellLevel: number) => {
    if (!linkedDndCharacter || !linkedDndCharacter.spellcastingAbility) {
      return { disabled: true, label: "No Caster" };
    }
    if (!linkedClassSpellIds.has(spellId)) {
      return { disabled: true, label: "Off List" };
    }
    if ((linkedDndCharacter.preparedSpells || []).some((spell) => spell.sourceSpellId === spellId)) {
      return { disabled: true, label: "Added" };
    }
    const abilityScore =
      linkedDndCharacter.abilityScores[linkedDndCharacter.spellcastingAbility] || 10;
    const validation = validateSpellSelection(
      linkedDndCharacter.class,
      linkedDndCharacter.level,
      abilityScore,
      linkedDndCharacter.preparedSpells || [],
      spellLevel
    );
    if (!validation.canAdd) {
      return { disabled: true, label: "Cap Reached" };
    }
    return { disabled: false, label: "Add" };
  };

  const handleAddSpellToCharacter = (spellId: string) => {
    if (!linkedDndCharacter || !linkedDndCharacter.spellcastingAbility) {
      toast({
        title: "Cannot Add Spell",
        description: "A spellcasting D&D character is required for this action.",
        variant: "destructive",
      });
      return;
    }

    const spell = allSpells.find((entry) => entry.id === spellId);
    if (!spell) {
      return;
    }
    if (!linkedClassSpellIds.has(spell.id)) {
      toast({
        title: "Class Spell List Restriction",
        description: `${spell.name} is not on ${linkedDndCharacter.class}'s spell list.`,
        variant: "destructive",
      });
      return;
    }

    const abilityScore =
      linkedDndCharacter.abilityScores[linkedDndCharacter.spellcastingAbility] || 10;
    const validation = validateSpellSelection(
      linkedDndCharacter.class,
      linkedDndCharacter.level,
      abilityScore,
      linkedDndCharacter.preparedSpells || [],
      spell.level
    );
    if (!validation.canAdd) {
      toast({
        title: "Spell Limit Reached",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }

    const success = updateLinkedCharacter((current) => ({
      ...current,
      preparedSpells: [...(current.preparedSpells || []), toPreparedSpell(spell)],
    }));
    if (success) {
      toast({
        title: "Spell Added",
        description: `${spell.name} was added to ${linkedCharacterName}.`,
      });
    }
  };

  const handleAddEquipmentToCharacter = (item: CompendiumEquipmentItem) => {
    if (!linkedDndCharacter) {
      toast({
        title: "Cannot Add Item",
        description: "A D&D character is required for this action.",
        variant: "destructive",
      });
      return;
    }

    const success = updateLinkedCharacter((current) => {
      const inventory = [...(current.inventory || [])];
      const existingIndex = inventory.findIndex(
        (entry) => entry.sourceItemId === item.id && entry.equipped === false
      );

      if (existingIndex !== -1) {
        inventory[existingIndex] = {
          ...inventory[existingIndex],
          quantity: inventory[existingIndex].quantity + 1,
        };
      } else {
        inventory.push(toInventoryItem(item));
      }

      return {
        ...current,
        inventory,
      };
    });

    if (success) {
      toast({
        title: "Item Added",
        description: `${item.name} was added to ${linkedCharacterName}'s inventory.`,
      });
    }
  };

  const linkedSpellState =
    linkedDndCharacter && linkedDndCharacter.spellcastingAbility
      ? getSpellSelectionState(
        linkedDndCharacter.class,
        linkedDndCharacter.level,
        linkedDndCharacter.abilityScores[linkedDndCharacter.spellcastingAbility] || 10,
        linkedDndCharacter.preparedSpells || []
      )
      : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold font-display">Compendium</h1>
            <p className="text-muted-foreground">
              Browse spells and equipment with fast filters for table-ready prep.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/characters")}>
              Characters
            </Button>
            {characterId && linkedCharacter && (
              <Button onClick={() => navigate(`/character/${characterId}`)}>Back to Character</Button>
            )}
          </div>
        </div>

        {characterId && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              {!linkedDndCharacter ? (
                <p className="text-sm text-destructive">
                  Character link is invalid or not a D&D 5e character.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="secondary">{linkedDndCharacter.name}</Badge>
                  <span className="text-muted-foreground">
                    {linkedDndCharacter.race} {linkedDndCharacter.class} (Level {linkedDndCharacter.level})
                  </span>
                  {linkedSpellState?.maxLeveledSpells !== null && (
                    <span className="text-muted-foreground">
                      {linkedSpellState.label}: {linkedSpellState.currentLeveledSpells}/
                      {linkedSpellState.maxLeveledSpells} leveled
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CompendiumTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spells">Spells</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
          </TabsList>

          <TabsContent value="spells" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spell Filters</CardTitle>
                <CardDescription>Class, level, school, and ritual/concentration controls.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                <Input
                  placeholder="Search name, school, description..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="lg:col-span-2"
                />
                <Select value={spellClassFilter} onValueChange={setSpellClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classNames.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={spellLevelFilter} onValueChange={setSpellLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
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
                <Select value={spellSchoolFilter} onValueChange={setSpellSchoolFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="School" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {spellSchools.map((school) => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={spellTagFilter} onValueChange={(value) => setSpellTagFilter(value as SpellTagFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Tag</SelectItem>
                    <SelectItem value="ritual">Ritual</SelectItem>
                    <SelectItem value="concentration">Concentration</SelectItem>
                    <SelectItem value="either">Ritual or Concentration</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spells</CardTitle>
                <CardDescription>
                  {filteredSpells.length} result{filteredSpells.length === 1 ? "" : "s"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isTabLoading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : pagedSpells.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No spells match the current filters.
                  </p>
                ) : (
                  pagedSpells.map((spell) => {
                    const actionState = getSpellActionState(spell.id, spell.level);
                    return (
                      <div
                        key={spell.id}
                        className="flex items-start justify-between gap-3 rounded-md border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{spell.name}</p>
                            <Badge variant="outline">{spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}</Badge>
                            <Badge variant="secondary">{spell.school}</Badge>
                            {spell.ritual && <Badge variant="outline">Ritual</Badge>}
                            {spell.concentration && <Badge variant="outline">Concentration</Badge>}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {spell.castingTime} | {spell.range} | {spell.duration}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Classes: {spell.classes.join(", ")}
                          </p>
                        </div>
                        {linkedDndCharacter && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionState.disabled}
                            onClick={() => handleAddSpellToCharacter(spell.id)}
                          >
                            {actionState.label}
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}

                {!isTabLoading && filteredSpells.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSpellPage((page) => Math.max(1, page - 1))}
                      disabled={currentSpellPage <= 1}
                    >
                      Previous
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Page {currentSpellPage} of {spellTotalPages}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSpellPage((page) => Math.min(spellTotalPages, page + 1))}
                      disabled={currentSpellPage >= spellTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Filters</CardTitle>
                <CardDescription>Type, category, cost, and weight controls.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                <Input
                  placeholder="Search name, category, description..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="lg:col-span-2"
                />
                <Select value={equipmentTypeFilter} onValueChange={(value) => setEquipmentTypeFilter(value as EquipmentTypeFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="weapon">Weapon</SelectItem>
                    <SelectItem value="armor">Armor</SelectItem>
                    <SelectItem value="adventuringGear">Gear</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={equipmentCategoryFilter} onValueChange={setEquipmentCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {equipmentCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Max Cost (gp)"
                  value={equipmentMaxCostGp}
                  onChange={(event) => setEquipmentMaxCostGp(event.target.value)}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Max Weight (lb)"
                  value={equipmentMaxWeight}
                  onChange={(event) => setEquipmentMaxWeight(event.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment</CardTitle>
                <CardDescription>
                  {filteredEquipment.length} result{filteredEquipment.length === 1 ? "" : "s"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isTabLoading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : pagedEquipment.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No equipment matches the current filters.
                  </p>
                ) : (
                  pagedEquipment.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-md border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          <Badge variant="outline">
                            {item.type === "adventuringGear" ? "gear" : item.type}
                          </Badge>
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.costLabel} | {item.weight} lb
                        </p>
                      </div>
                      {linkedDndCharacter && (
                        <Button size="sm" variant="outline" onClick={() => handleAddEquipmentToCharacter(item)}>
                          Add
                        </Button>
                      )}
                    </div>
                  ))
                )}

                {!isTabLoading && filteredEquipment.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEquipmentPage((page) => Math.max(1, page - 1))}
                      disabled={currentEquipmentPage <= 1}
                    >
                      Previous
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Page {currentEquipmentPage} of {equipmentTotalPages}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEquipmentPage((page) => Math.min(equipmentTotalPages, page + 1))}
                      disabled={currentEquipmentPage >= equipmentTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
