/**
 * @fileoverview Inventory section wrapper with carrying capacity and armor class display.
 */

import { InventoryManager } from "@/components/InventoryManager";
import { InventoryItem, DnD5eAbilityScores } from "@/types/character";
import { computeArmorClass } from "@/utils/armorClassUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Swords, Weight } from "lucide-react";

interface InventoryPanelProps {
  inventory: InventoryItem[];
  strength: number;
  abilityScores: DnD5eAbilityScores;
  onUpdateInventory: (inventory: InventoryItem[]) => void;
}

/**
 * D&D 5e carrying capacity: Strength score * 15 lbs.
 */
function getCarryingCapacity(strength: number): number {
  return strength * 15;
}

/**
 * Get equipped weapon summary for display.
 */
function getEquippedWeapons(inventory: InventoryItem[]): InventoryItem[] {
  return inventory.filter(
    (item) =>
      item.equipped &&
      (item.equipmentSlot === "mainHand" || item.equipmentSlot === "offHand") &&
      (item.sourceItemType === "weapon" || item.damageDice)
  );
}

export const InventoryPanel = ({
  inventory,
  strength,
  abilityScores,
  onUpdateInventory,
}: InventoryPanelProps) => {
  const ac = computeArmorClass(inventory, abilityScores);
  const equippedWeapons = getEquippedWeapons(inventory);
  const totalWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const carryingCapacity = getCarryingCapacity(strength);
  const isOverEncumbered = totalWeight > carryingCapacity;

  return (
    <div className="space-y-4">
      {/* Equipment Summary Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Armor Class */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <Shield className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-3xl font-bold">{ac.total}</span>
              <span className="text-xs text-muted-foreground">Armor Class</span>
              <span className="text-xs text-muted-foreground mt-1">{ac.baseSource}</span>
              {ac.shieldBonus > 0 && (
                <Badge variant="outline" className="text-xs mt-1">+{ac.shieldBonus} shield</Badge>
              )}
              {ac.stealthDisadvantage && (
                <Badge variant="destructive" className="text-xs mt-1">Stealth Disadv.</Badge>
              )}
            </div>

            {/* Equipped Weapons */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
              <Swords className="w-5 h-5 text-muted-foreground mb-1" />
              {equippedWeapons.length === 0 ? (
                <>
                  <span className="text-sm text-muted-foreground">No weapons</span>
                  <span className="text-xs text-muted-foreground">equipped</span>
                </>
              ) : (
                <div className="text-center space-y-1">
                  {equippedWeapons.map((w) => (
                    <div key={w.id}>
                      <span className="text-sm font-medium">{w.name}</span>
                      {w.damageDice && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({w.damageDice}{w.damageType ? ` ${w.damageType}` : ""})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <span className="text-xs text-muted-foreground mt-1">Weapons</span>
            </div>

            {/* Weight */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted col-span-2 md:col-span-1">
              <Weight className="w-5 h-5 text-muted-foreground mb-1" />
              <span className={`text-lg font-bold ${isOverEncumbered ? "text-destructive" : ""}`}>
                {totalWeight.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">/ {carryingCapacity} lbs</span>
              {isOverEncumbered && (
                <Badge variant="destructive" className="text-xs mt-1">Over Encumbered</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Inventory Manager */}
      <InventoryManager
        inventory={inventory}
        carryingCapacity={carryingCapacity}
        onUpdateInventory={onUpdateInventory}
      />
    </div>
  );
};
