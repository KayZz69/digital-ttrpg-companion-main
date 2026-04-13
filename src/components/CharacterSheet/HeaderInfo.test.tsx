import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeaderInfo } from "./HeaderInfo";

const defaultProps = {
  characterId: "char-1",
  name: "Thorin",
  race: "Dwarf",
  characterClass: "Fighter",
  level: 3,
  proficiencyBonus: 2,
  readyToLevelUp: false,
  onNavigate: vi.fn(),
  onLevelUp: vi.fn(),
};

describe("HeaderInfo", () => {
  it("renders without crashing", () => {
    render(<HeaderInfo {...defaultProps} />);
    expect(screen.getByText("Thorin")).toBeInTheDocument();
  });

  it("displays race, class, and level", () => {
    render(<HeaderInfo {...defaultProps} />);
    expect(screen.getByText(/Dwarf Fighter/)).toBeInTheDocument();
    expect(screen.getByText(/Level 3/)).toBeInTheDocument();
  });

  it("displays proficiency bonus", () => {
    render(<HeaderInfo {...defaultProps} />);
    expect(screen.getByText(/Proficiency Bonus: \+2/)).toBeInTheDocument();
  });

  it("shows Level Up button when readyToLevelUp is true", () => {
    render(<HeaderInfo {...defaultProps} readyToLevelUp={true} />);
    const levelUpButton = screen.getByText(/Level Up!/);
    expect(levelUpButton).toBeInTheDocument();
  });

  it("hides Level Up button when readyToLevelUp is false", () => {
    render(<HeaderInfo {...defaultProps} readyToLevelUp={false} />);
    expect(screen.queryByText(/Level Up!/)).not.toBeInTheDocument();
  });

  it("calls onLevelUp when Level Up button is clicked", () => {
    const onLevelUp = vi.fn();
    render(<HeaderInfo {...defaultProps} readyToLevelUp={true} onLevelUp={onLevelUp} />);
    fireEvent.click(screen.getByText(/Level Up!/));
    expect(onLevelUp).toHaveBeenCalledTimes(1);
  });

  it("calls onNavigate with correct paths for nav buttons", () => {
    const onNavigate = vi.fn();
    render(<HeaderInfo {...defaultProps} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText(/Back to Characters/));
    expect(onNavigate).toHaveBeenCalledWith("/characters");

    fireEvent.click(screen.getByText(/Combat/));
    expect(onNavigate).toHaveBeenCalledWith("/character/char-1/combat");

    fireEvent.click(screen.getByText(/Edit Character/));
    expect(onNavigate).toHaveBeenCalledWith("/character/char-1/edit");
  });

  it("shows D&D 5e badge", () => {
    render(<HeaderInfo {...defaultProps} />);
    expect(screen.getByText("D&D 5e")).toBeInTheDocument();
  });
});
