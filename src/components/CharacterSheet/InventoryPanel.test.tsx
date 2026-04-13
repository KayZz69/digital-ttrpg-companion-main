import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InventoryPanel } from "./InventoryPanel";
import { DnD5eAbilityScores, InventoryItem } from "@/types/character";

// Mock InventoryManager to isolate InventoryPanel logic
vi.mock("@/components/InventoryManager", () => ({
  InventoryManager: () => <div data-testid="inventory-manager" />,
}));

// Mock armorClassUtils
vi.mock("@/utils/armorClassUtils", () => ({
  computeArmorClass: () => ({
    total: 15,
    baseSource: "Chain Mail",
    shieldBonus: 2,
    stealthDisadvantage: true,
  }),
}));

const abilityScores: DnD5eAbilityScores = {
  strength: 14,
  dexterity: 12,
  constitution: 13,
  intelligence: 10,
  wisdom: 11,
  charisma: 9,
};

const defaultProps = {
  inventory: [] as InventoryItem[],
  strength: 14,
  abilityScores,
  onUpdateInventory: vi.fn(),
};

describe("InventoryPanel", () => {
  it("renders without crashing with empty inventory", () => {
    render(<InventoryPanel {...defaultProps} />);
    expect(screen.getByText("Armor Class")).toBeInTheDocument();
  });

  it("displays computed armor class", () => {
    render(<InventoryPanel {...defaultProps} />);
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Chain Mail")).toBeInTheDocument();
  });

  it("displays shield bonus when present", () => {
    render(<InventoryPanel {...defaultProps} />);
    expect(screen.getByText("+2 shield")).toBeInTheDocument();
  });

  it("displays stealth disadvantage badge", () => {
    render(<InventoryPanel {...defaultProps} />);
    expect(screen.getByText("Stealth Disadv.")).toBeInTheDocument();
  });

  it("shows 'No weapons equipped' when no weapons", () => {
    render(<InventoryPanel {...defaultProps} />);
    expect(screen.getByText("No weapons")).toBeInTheDocument();
  });

  it("shows equipped weapons when present", () => {
    const inventory: InventoryItem[] = [
      {
        id: "w1",
        name: "Longsword",
        quantity: 1,
        weight: 3,
        equipped: true,
        equipmentSlot: "mainHand",
        sourceItemType: "weapon",
        damageDice: "1d8",
        damageType: "slashing",
      },
    ];
    render(<InventoryPanel {...defaultProps} inventory={inventory} />);
    expect(screen.getByText("Longsword")).toBeInTheDocument();
    expect(screen.getByText("(1d8 slashing)")).toBeInTheDocument();
  });

  it("calculates carrying capacity as strength * 15", () => {
    render(<InventoryPanel {...defaultProps} strength={14} />);
    // 14 * 15 = 210
    expect(screen.getByText("/ 210 lbs")).toBeInTheDocument();
  });

  it("displays total weight of inventory items", () => {
    const inventory: InventoryItem[] = [
      { id: "1", name: "Shield", quantity: 1, weight: 6, equipped: true },
      { id: "2", name: "Rations", quantity: 5, weight: 2, equipped: false },
    ];
    render(<InventoryPanel {...defaultProps} inventory={inventory} />);
    // 6*1 + 2*5 = 16.0
    expect(screen.getByText("16.0")).toBeInTheDocument();
  });

  it("shows Over Encumbered badge when over capacity", () => {
    const inventory: InventoryItem[] = [
      { id: "1", name: "Heavy Load", quantity: 1, weight: 250, equipped: false },
    ];
    render(<InventoryPanel {...defaultProps} strength={14} inventory={inventory} />);
    // 250 > 210
    expect(screen.getByText("Over Encumbered")).toBeInTheDocument();
  });

  it("renders InventoryManager sub-component", () => {
    render(<InventoryPanel {...defaultProps} />);
    expect(screen.getByTestId("inventory-manager")).toBeInTheDocument();
  });
});
