/**
 * @fileoverview Inventory Manager component for D&D 5e character items.
 * Handles equipped items, carried items, and encumbrance tracking.
 */

import { useState } from "react";
import { InventoryItem, EquipmentSlot } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2, Edit, Weight, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Props for the InventoryManager component.
 */
interface InventoryManagerProps {
  /** Current inventory items array */
  inventory: InventoryItem[];
  /** Maximum carrying capacity in pounds (Strength * 15) */
  carryingCapacity: number;
  /** Callback when inventory is updated */
  onUpdateInventory: (inventory: InventoryItem[]) => void;
}

/** Available equipment slots with display labels */
const EQUIPMENT_SLOTS: { value: EquipmentSlot; label: string }[] = [
  { value: "none", label: "Not Equipped" },
  { value: "mainHand", label: "Main Hand" },
  { value: "offHand", label: "Off Hand" },
  { value: "armor", label: "Armor" },
  { value: "helmet", label: "Helmet" },
  { value: "cloak", label: "Cloak" },
  { value: "boots", label: "Boots" },
  { value: "ring1", label: "Ring 1" },
  { value: "ring2", label: "Ring 2" },
  { value: "amulet", label: "Amulet" },
];

/**
 * Inventory Manager component.
 * Provides a complete inventory management UI with:
 * - Equipped items section with equipment slots
 * - Carried items section with scrollable list
 * - Add/edit/delete item dialogs
 * - Weight tracking with encumbrance warnings
 * - Toggle equip/unequip functionality
 *
 * @param props - Component props including inventory and callbacks
 */
export const InventoryManager = ({ inventory, carryingCapacity, onUpdateInventory }: InventoryManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    weight: 0,
    description: "",
    equipped: false,
    equipmentSlot: "none" as EquipmentSlot,
  });

  const totalWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const isOverEncumbered = totalWeight > carryingCapacity;

  const resetForm = () => {
    setFormData({
      name: "",
      quantity: 1,
      weight: 0,
      description: "",
      equipped: false,
      equipmentSlot: "none",
    });
  };

  const handleAddItem = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an item name.",
        variant: "destructive",
      });
      return;
    }

    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      quantity: formData.quantity,
      weight: formData.weight,
      description: formData.description.trim() || undefined,
      equipped: formData.equipped,
      equipmentSlot: formData.equipped ? formData.equipmentSlot : undefined,
    };

    onUpdateInventory([...inventory, newItem]);
    setIsAddDialogOpen(false);
    resetForm();

    toast({
      title: "Item Added",
      description: `${newItem.name} added to inventory.`,
    });
  };

  const handleEditItem = () => {
    if (!editingItem || !formData.name.trim()) return;

    const updatedInventory = inventory.map((item) =>
      item.id === editingItem.id
        ? {
          ...item,
          name: formData.name.trim(),
          quantity: formData.quantity,
          weight: formData.weight,
          description: formData.description.trim() || undefined,
          equipped: formData.equipped,
          equipmentSlot: formData.equipped ? formData.equipmentSlot : undefined,
        }
        : item
    );

    onUpdateInventory(updatedInventory);
    setIsEditDialogOpen(false);
    setEditingItem(null);
    resetForm();

    toast({
      title: "Item Updated",
      description: `${formData.name} has been updated.`,
    });
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      description: item.description || "",
      equipped: item.equipped,
      equipmentSlot: item.equipmentSlot || "none",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    const updatedInventory = inventory.filter((item) => item.id !== itemToDelete);
    onUpdateInventory(updatedInventory);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);

    toast({
      title: "Item Removed",
      description: "Item has been removed from inventory.",
    });
  };

  const openDeleteDialog = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const toggleEquipped = (itemId: string) => {
    const updatedInventory = inventory.map((item) =>
      item.id === itemId
        ? { ...item, equipped: !item.equipped, equipmentSlot: (item.equipped ? undefined : "none" as EquipmentSlot) }
        : item
    );
    onUpdateInventory(updatedInventory);
  };

  const equippedItems = inventory.filter((item) => item.equipped);
  const carriedItems = inventory.filter((item) => !item.equipped);

  return (
    <div className="space-y-6">
      {/* Weight Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Weight className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Total Weight</span>
            </div>
            <span className={`text-lg font-bold ${isOverEncumbered ? "text-destructive" : "text-foreground"}`}>
              {totalWeight.toFixed(1)} / {carryingCapacity} lbs
            </span>
          </div>
          {isOverEncumbered && (
            <p className="text-sm text-destructive">Over encumbered! Movement may be impaired.</p>
          )}
        </CardContent>
      </Card>

      {/* Equipped Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Equipped Items
              </CardTitle>
              <CardDescription>{equippedItems.length} items equipped</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {equippedItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No items equipped</p>
          ) : (
            <div className="space-y-2">
              {equippedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.name}</span>
                      {item.equipmentSlot && item.equipmentSlot !== "none" && (
                        <Badge variant="outline" className="text-xs">
                          {EQUIPMENT_SLOTS.find((s) => s.value === item.equipmentSlot)?.label}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span>Weight: {(item.weight * item.quantity).toFixed(1)} lbs</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleEquipped(item.id)}
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carried Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Carried Items
              </CardTitle>
              <CardDescription>{carriedItems.length} items in backpack</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {carriedItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No items in inventory</p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {carriedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span>Weight: {(item.weight * item.quantity).toFixed(1)} lbs</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleEquipped(item.id)}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingItem(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "Update the item details." : "Add a new item to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                placeholder="Longsword, Healing Potion..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Item description, properties, notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipmentSlot">Equipment Slot</Label>
              <Select
                value={formData.equipmentSlot}
                onValueChange={(value: EquipmentSlot) => {
                  setFormData({
                    ...formData,
                    equipmentSlot: value,
                    equipped: value !== "none",
                  });
                }}
              >
                <SelectTrigger id="equipmentSlot" className="bg-popover">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {EQUIPMENT_SLOTS.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingItem(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={isEditDialogOpen ? handleEditItem : handleAddItem}>
              {isEditDialogOpen ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
