/**
 * @fileoverview Inventory section wrapper with carrying capacity calculation.
 */

import { InventoryManager } from "@/components/InventoryManager";
import { InventoryItem } from "@/types/character";

interface InventoryPanelProps {
  inventory: InventoryItem[];
  strength: number;
  onUpdateInventory: (inventory: InventoryItem[]) => void;
}

/**
 * D&D 5e carrying capacity: Strength score * 15 lbs.
 */
function getCarryingCapacity(strength: number): number {
  return strength * 15;
}

export const InventoryPanel = ({
  inventory,
  strength,
  onUpdateInventory,
}: InventoryPanelProps) => {
  return (
    <InventoryManager
      inventory={inventory}
      carryingCapacity={getCarryingCapacity(strength)}
      onUpdateInventory={onUpdateInventory}
    />
  );
};
