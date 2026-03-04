import { useEffect, useMemo, useState } from "react";
import { DnD5eCharacter } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Plus, Minus, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  type CompendiumEquipmentType,
  getAllCompendiumEquipment,
  getClassByName,
  getClassStartingEquipmentChoices,
  toInventoryItem,
} from "@/lib/dndCompendium";
import { getStartingGoldBudget } from "@/data";

interface StartingEquipmentStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

type FilterType = "all" | CompendiumEquipmentType;
type EquipmentMode = "packages" | "gold-buy";

const toGoldValue = (quantity: number, unit: "cp" | "sp" | "gp" | "pp"): number => {
  if (unit === "cp") {
    return quantity / 100;
  }
  if (unit === "sp") {
    return quantity / 10;
  }
  if (unit === "pp") {
    return quantity * 10;
  }
  return quantity;
};

export const StartingEquipmentStep = ({
  character,
  setCharacter,
}: StartingEquipmentStepProps) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [mode, setMode] = useState<EquipmentMode>("packages");
  const inventory = character.inventory || [];
  const classData = getClassByName(character.class || "");
  const classEquipmentChoices = getClassStartingEquipmentChoices(character.class || "");
  const compendiumItems = useMemo(() => getAllCompendiumEquipment(), []);
  const compendiumByName = useMemo(
    () => new Map(compendiumItems.map((entry) => [entry.name.trim().toLowerCase(), entry])),
    [compendiumItems]
  );
  const compendiumById = useMemo(
    () => new Map(compendiumItems.map((entry) => [entry.id, entry])),
    [compendiumItems]
  );
  const startingGoldBudget = classData ? getStartingGoldBudget(classData.id) : 100;

  useEffect(() => {
    if (classEquipmentChoices.length === 0) {
      setMode("gold-buy");
      return;
    }
    setMode("packages");
  }, [character.class, classEquipmentChoices.length]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return compendiumItems.filter((entry) => {
      if (filter !== "all" && entry.type !== filter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return (
        entry.name.toLowerCase().includes(normalizedQuery) ||
        entry.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [compendiumItems, filter, query]);

  const totalWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const totalCostGp = inventory.reduce((sum, item) => {
    if (!item.sourceItemId) {
      return sum;
    }
    const source = compendiumById.get(item.sourceItemId);
    if (!source || !source.source.cost) {
      return sum;
    }
    return sum + toGoldValue(source.source.cost.quantity, source.source.cost.unit) * item.quantity;
  }, 0);
  const overBudget = mode === "gold-buy" && totalCostGp > startingGoldBudget;

  const applyPackage = (packageId: string) => {
    const selectedPackage = classEquipmentChoices.find((choice) => choice.id === packageId);
    if (!selectedPackage) {
      return;
    }

    const packageItems = selectedPackage.items
      .map((item) => {
        const source = compendiumByName.get(item.itemName.trim().toLowerCase());
        if (!source) {
          return null;
        }
        return toInventoryItem(source, Math.max(1, item.quantity || 1));
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    setCharacter({
      ...character,
      equipmentSelectionMode: "packages",
      startingEquipmentChoiceId: selectedPackage.id,
      inventory: packageItems,
    });
  };

  const addFromCompendium = (itemId: string) => {
    const selected = compendiumItems.find((entry) => entry.id === itemId);
    if (!selected) {
      return;
    }

    const existingIndex = inventory.findIndex(
      (item) => item.sourceItemId === selected.id && item.equipped === false
    );

    if (existingIndex !== -1) {
      const updated = [...inventory];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1,
      };
      setCharacter({ ...character, startingEquipmentChoiceId: undefined, inventory: updated });
      return;
    }

    setCharacter({
      ...character,
      equipmentSelectionMode: "gold-buy",
      startingEquipmentChoiceId: undefined,
      inventory: [...inventory, toInventoryItem(selected)],
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = inventory
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCharacter({
      ...character,
      equipmentSelectionMode: "gold-buy",
      startingEquipmentChoiceId: undefined,
      inventory: updated,
    });
  };

  const removeInventoryItem = (id: string) => {
    setCharacter({
      ...character,
      equipmentSelectionMode: "gold-buy",
      startingEquipmentChoiceId: undefined,
      inventory: inventory.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Starting Equipment
              </CardTitle>
              <CardDescription>
                {classEquipmentChoices.length > 0
                  ? "Choose your class starting package or switch to gold-buy mode."
                  : "No class package data available. Use gold-buy mode from the compendium."}
              </CardDescription>
            </div>
            <Badge variant="secondary">{inventory.length} item entries</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === "packages" ? "default" : "outline"}
              onClick={() => {
                setMode("packages");
                setCharacter({ ...character, equipmentSelectionMode: "packages" });
              }}
              disabled={classEquipmentChoices.length === 0}
            >
              Class Package
            </Button>
            <Button
              size="sm"
              variant={mode === "gold-buy" ? "default" : "outline"}
              onClick={() => {
                setMode("gold-buy");
                setCharacter({ ...character, equipmentSelectionMode: "gold-buy" });
              }}
            >
              Gold-Buy Mode
            </Button>
          </div>

          {mode === "packages" && classEquipmentChoices.length > 0 && (
            <RadioGroup
              value={character.startingEquipmentChoiceId}
              onValueChange={applyPackage}
              className="space-y-2"
            >
              {classEquipmentChoices.map((choice) => (
                <Label
                  key={choice.id}
                  htmlFor={choice.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                >
                  <RadioGroupItem id={choice.id} value={choice.id} />
                  <div className="space-y-1">
                    <p className="font-medium">{choice.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {choice.items
                        .map((item) =>
                          item.quantity && item.quantity > 1
                            ? `${item.itemName} x${item.quantity}`
                            : item.itemName
                        )
                        .join(", ")}
                    </p>
                    {choice.notes && (
                      <p className="text-xs text-muted-foreground">{choice.notes}</p>
                    )}
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}

          {mode === "gold-buy" && (
            <>
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                Budget: <span className="font-semibold">{startingGoldBudget} gp</span> | Current:{" "}
                <span className={`font-semibold ${overBudget ? "text-destructive" : ""}`}>
                  {totalCostGp.toFixed(2)} gp
                </span>
              </div>
              <Input
                placeholder="Search equipment by name or category..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {(["all", "weapon", "armor", "adventuringGear"] as FilterType[]).map((entry) => (
                  <Button
                    key={entry}
                    size="sm"
                    variant={filter === entry ? "default" : "outline"}
                    onClick={() => setFilter(entry)}
                  >
                    {entry === "adventuringGear"
                      ? "Gear"
                      : entry.charAt(0).toUpperCase() + entry.slice(1)}
                  </Button>
                ))}
              </div>
              <ScrollArea className="h-[320px] pr-4">
                <div className="space-y-2">
                  {filteredItems.map((item) => (
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
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.category} | {item.costLabel} | {item.weight} lb
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => addFromCompendium(item.id)}>
                        <Plus className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Selected Inventory</CardTitle>
          <CardDescription>
            Total weight: {totalWeight.toFixed(1)} lbs
            {mode === "gold-buy" && ` | Cost: ${totalCostGp.toFixed(2)} gp`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overBudget && (
            <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Your selected equipment exceeds the class starting gold budget.
            </p>
          )}
          {inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No starting equipment selected.</p>
          ) : (
            <div className="space-y-2">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border bg-background p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty {item.quantity} | {(item.weight * item.quantity).toFixed(1)} lbs
                    </p>
                  </div>
                  {mode === "gold-buy" && (
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => removeInventoryItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
