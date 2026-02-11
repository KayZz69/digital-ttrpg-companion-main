import { useMemo, useState } from "react";
import { DnD5eCharacter } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Plus, Minus, Trash2 } from "lucide-react";
import {
  type CompendiumEquipmentType,
  getAllCompendiumEquipment,
  toInventoryItem,
} from "@/lib/dndCompendium";

interface StartingEquipmentStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

type FilterType = "all" | CompendiumEquipmentType;

export const StartingEquipmentStep = ({
  character,
  setCharacter,
}: StartingEquipmentStepProps) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const inventory = character.inventory || [];
  const compendiumItems = useMemo(() => getAllCompendiumEquipment(), []);

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
      setCharacter({ ...character, inventory: updated });
      return;
    }

    setCharacter({
      ...character,
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
    setCharacter({ ...character, inventory: updated });
  };

  const removeInventoryItem = (id: string) => {
    setCharacter({
      ...character,
      inventory: inventory.filter((item) => item.id !== id),
    });
  };

  const totalWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);

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
                Build your starting inventory directly from the PHB equipment compendium
              </CardDescription>
            </div>
            <Badge variant="secondary">{inventory.length} item entries</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                {entry === "adventuringGear" ? "Gear" : entry.charAt(0).toUpperCase() + entry.slice(1)}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[360px] pr-4">
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="outline">{item.type === "adventuringGear" ? "gear" : item.type}</Badge>
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
              {filteredItems.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No equipment found for this filter.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Selected Inventory</CardTitle>
          <CardDescription>Total weight: {totalWeight.toFixed(1)} lbs</CardDescription>
        </CardHeader>
        <CardContent>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
