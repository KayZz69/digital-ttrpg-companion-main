import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StartingEquipmentStep, validateEquipmentStep } from "./StartingEquipmentStep";
import { DnD5eCharacter, InventoryItem } from "@/types/character";
import { getClassStartingEquipmentChoices, getAllCompendiumEquipment } from "@/lib/dndCompendium";
import { getStartingGoldBudget } from "@/data";

function makeCharacter(overrides: Partial<DnD5eCharacter> = {}): Partial<DnD5eCharacter> {
  return {
    class: "Fighter",
    level: 1,
    inventory: [],
    equipmentSelectionMode: undefined,
    startingEquipmentChoiceId: undefined,
    ...overrides,
  };
}

describe("StartingEquipmentStep", () => {
  describe("package mode", () => {
    it("renders available packages for the character class", () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({ class: "Fighter" });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      const choices = getClassStartingEquipmentChoices("Fighter");
      expect(choices.length).toBeGreaterThan(0);

      // Each package label should appear
      for (const choice of choices) {
        expect(screen.getByText(choice.label)).toBeInTheDocument();
      }
    });

    it("shows 'Class Package' button as active by default when packages exist", () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({ class: "Fighter", equipmentSelectionMode: "packages" });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      const packageButton = screen.getByRole("button", { name: /class package/i });
      expect(packageButton).toBeInTheDocument();
      expect(packageButton.getAttribute("aria-pressed")).toBe("true");
    });

    it("selecting a package updates inventory via setCharacter", () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({ class: "Fighter", equipmentSelectionMode: "packages" });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      const choices = getClassStartingEquipmentChoices("Fighter");
      expect(choices.length).toBeGreaterThan(0);

      // Click the first package radio
      const radioButton = screen.getByRole("radio", { name: new RegExp(choices[0].label) });
      fireEvent.click(radioButton);

      // setCharacter should be called with matching inventory
      const lastCall = setCharacter.mock.calls[setCharacter.mock.calls.length - 1][0];
      expect(lastCall.equipmentSelectionMode).toBe("packages");
      expect(lastCall.startingEquipmentChoiceId).toBe(choices[0].id);
      expect(lastCall.inventory.length).toBeGreaterThan(0);

      // Inventory item names should be a subset of the package items
      const packageItemNames = choices[0].items.map((item) => item.itemName.toLowerCase());
      for (const invItem of lastCall.inventory) {
        expect(packageItemNames).toContain(invItem.name.toLowerCase());
      }
    });

    it("shows empty inventory message when no package is selected", () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "packages",
        inventory: [],
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      expect(
        screen.getByText("Select a class package above to populate your inventory.")
      ).toBeInTheDocument();
    });

    it("displays selected package items in the inventory summary", () => {
      const setCharacter = vi.fn();
      const choices = getClassStartingEquipmentChoices("Fighter");
      const firstChoice = choices[0];

      // Simulate pre-selected package with inventory
      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "packages",
        startingEquipmentChoiceId: firstChoice.id,
        inventory: firstChoice.items.map((item) => ({
          id: `test-${item.itemName}`,
          name: item.itemName,
          quantity: item.quantity || 1,
          weight: 1,
          equipped: false,
        })),
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      for (const item of firstChoice.items) {
        expect(screen.getByText(item.itemName)).toBeInTheDocument();
      }
    });
  });

  describe("gold-buy mode", () => {
    it("shows budget information when gold-buy mode is active", { timeout: 15000 }, () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "gold-buy",
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      // Switch to gold-buy
      const goldBuyButton = screen.getByRole("button", { name: /gold-buy mode/i });
      fireEvent.click(goldBuyButton);

      const budget = getStartingGoldBudget("fighter");
      expect(screen.getByText(`${budget} gp`)).toBeInTheDocument();
      expect(screen.getByText(/remaining/i)).toBeInTheDocument();
    });

    it("shows search input and filter buttons in gold-buy mode", { timeout: 15000 }, () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "gold-buy",
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      expect(
        screen.getByPlaceholderText(/search equipment/i)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /weapon/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /armor/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /gear/i })).toBeInTheDocument();
    });

    it("displays compendium items that can be added", { timeout: 15000 }, () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "gold-buy",
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      const equipment = getAllCompendiumEquipment();
      expect(equipment.length).toBeGreaterThan(0);

      // At least some items should be rendered
      const addButtons = screen.getAllByRole("button", { name: /add/i });
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it("shows overbudget warning when total cost exceeds budget", { timeout: 15000 }, () => {
      const setCharacter = vi.fn();
      // Create an inventory that's clearly over budget for monk (15 gp)
      const equipment = getAllCompendiumEquipment();
      const expensiveItems: InventoryItem[] = [];
      let cost = 0;
      const monkBudget = getStartingGoldBudget("monk");

      for (const item of equipment) {
        if (cost > monkBudget) break;
        const itemCost =
          item.source.cost.unit === "gp"
            ? item.source.cost.quantity
            : item.source.cost.unit === "sp"
              ? item.source.cost.quantity / 10
              : item.source.cost.quantity / 100;
        if (itemCost > 0) {
          expensiveItems.push({
            id: `test-${item.id}`,
            sourceItemId: item.id,
            sourceItemType: item.type,
            name: item.name,
            quantity: 5,
            weight: item.weight,
            equipped: false,
          });
          cost += itemCost * 5;
        }
      }

      const character = makeCharacter({
        class: "Monk",
        equipmentSelectionMode: "gold-buy",
        inventory: expensiveItems,
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/exceeds the class starting gold budget/i)).toBeInTheDocument();
    });

    it("shows quantity controls and remove button for gold-buy inventory items", { timeout: 15000 }, () => {
      const setCharacter = vi.fn();
      const equipment = getAllCompendiumEquipment();
      const firstItem = equipment[0];

      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "gold-buy",
        inventory: [
          {
            id: "test-item-1",
            sourceItemId: firstItem.id,
            sourceItemType: firstItem.type,
            name: firstItem.name,
            quantity: 1,
            weight: firstItem.weight,
            equipped: false,
          },
        ],
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      expect(
        screen.getByRole("button", { name: new RegExp(`increase quantity of ${firstItem.name}`, "i") })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: new RegExp(`decrease quantity of ${firstItem.name}`, "i") })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: new RegExp(`remove ${firstItem.name}`, "i") })
      ).toBeInTheDocument();
    });
  });

  describe("mode switching", () => {
    it("switches from package to gold-buy mode", () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "packages",
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      const goldBuyButton = screen.getByRole("button", { name: /gold-buy mode/i });
      fireEvent.click(goldBuyButton);

      const lastCall = setCharacter.mock.calls[setCharacter.mock.calls.length - 1][0];
      expect(lastCall.equipmentSelectionMode).toBe("gold-buy");
      expect(lastCall.inventory).toEqual([]);
      expect(lastCall.startingEquipmentChoiceId).toBeUndefined();
    });

    it("switches from gold-buy to package mode", { timeout: 15000 }, () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "gold-buy",
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      const packageButton = screen.getByRole("button", { name: /class package/i });
      fireEvent.click(packageButton);

      const lastCall = setCharacter.mock.calls[setCharacter.mock.calls.length - 1][0];
      expect(lastCall.equipmentSelectionMode).toBe("packages");
      expect(lastCall.inventory).toEqual([]);
    });

    it("disables package mode button when no class packages exist", { timeout: 15000 }, () => {
      const setCharacter = vi.fn();
      // Use a class name that won't have packages
      const character = makeCharacter({
        class: "UnknownClass",
        equipmentSelectionMode: "gold-buy",
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      const packageButton = screen.getByRole("button", { name: /class package/i });
      expect(packageButton).toBeDisabled();
    });

    it("clears inventory when switching modes", () => {
      const setCharacter = vi.fn();
      const character = makeCharacter({
        class: "Fighter",
        equipmentSelectionMode: "packages",
        startingEquipmentChoiceId: "fighter-standard",
        inventory: [
          {
            id: "test-1",
            name: "Longsword",
            quantity: 1,
            weight: 3,
            equipped: false,
          },
        ],
      });

      render(<StartingEquipmentStep character={character} setCharacter={setCharacter} />);

      const goldBuyButton = screen.getByRole("button", { name: /gold-buy mode/i });
      fireEvent.click(goldBuyButton);

      const lastCall = setCharacter.mock.calls[setCharacter.mock.calls.length - 1][0];
      expect(lastCall.inventory).toEqual([]);
      expect(lastCall.startingEquipmentChoiceId).toBeUndefined();
    });
  });

  describe("validateEquipmentStep", () => {
    it("returns invalid when no equipment is selected", () => {
      const result = validateEquipmentStep(makeCharacter({ inventory: [] }));
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/no equipment/i);
    });

    it("returns invalid in package mode without a package selection", () => {
      const result = validateEquipmentStep(
        makeCharacter({
          equipmentSelectionMode: "packages",
          startingEquipmentChoiceId: undefined,
          inventory: [
            { id: "1", name: "Sword", quantity: 1, weight: 3, equipped: false },
          ],
        })
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/no equipment package/i);
    });

    it("returns valid in package mode with a selected package and inventory", () => {
      const result = validateEquipmentStep(
        makeCharacter({
          equipmentSelectionMode: "packages",
          startingEquipmentChoiceId: "fighter-standard",
          inventory: [
            { id: "1", name: "Longsword", quantity: 1, weight: 3, equipped: false },
          ],
        })
      );
      expect(result.valid).toBe(true);
    });

    it("returns invalid in gold-buy mode when over budget", () => {
      const equipment = getAllCompendiumEquipment();
      // Find items and create an over-budget inventory for Monk (15 gp budget)
      const expensiveItems: InventoryItem[] = [];
      let totalCost = 0;

      for (const item of equipment) {
        const costGp =
          item.source.cost.unit === "gp"
            ? item.source.cost.quantity
            : item.source.cost.unit === "sp"
              ? item.source.cost.quantity / 10
              : item.source.cost.unit === "pp"
                ? item.source.cost.quantity * 10
                : item.source.cost.quantity / 100;
        if (costGp >= 5) {
          expensiveItems.push({
            id: `test-${item.id}`,
            sourceItemId: item.id,
            sourceItemType: item.type,
            name: item.name,
            quantity: 10,
            weight: item.weight,
            equipped: false,
          });
          totalCost += costGp * 10;
          if (totalCost > 15) break;
        }
      }

      const result = validateEquipmentStep(
        makeCharacter({
          class: "Monk",
          equipmentSelectionMode: "gold-buy",
          inventory: expensiveItems,
        })
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/exceeds budget/i);
    });

    it("returns valid in gold-buy mode when within budget", () => {
      const equipment = getAllCompendiumEquipment();
      // Find a cheap item
      const cheapItem = equipment.find(
        (item) => item.source.cost.unit === "cp" && item.source.cost.quantity <= 100
      );

      if (!cheapItem) {
        // If no cheap items, just use an item with no sourceItemId (cost = 0)
        const result = validateEquipmentStep(
          makeCharacter({
            class: "Fighter",
            equipmentSelectionMode: "gold-buy",
            inventory: [
              { id: "1", name: "Custom Item", quantity: 1, weight: 1, equipped: false },
            ],
          })
        );
        expect(result.valid).toBe(true);
        return;
      }

      const result = validateEquipmentStep(
        makeCharacter({
          class: "Fighter",
          equipmentSelectionMode: "gold-buy",
          inventory: [
            {
              id: "test-1",
              sourceItemId: cheapItem.id,
              sourceItemType: cheapItem.type,
              name: cheapItem.name,
              quantity: 1,
              weight: cheapItem.weight,
              equipped: false,
            },
          ],
        })
      );
      expect(result.valid).toBe(true);
    });
  });
});
