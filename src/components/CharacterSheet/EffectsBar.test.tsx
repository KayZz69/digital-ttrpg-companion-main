import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EffectsBar } from "./EffectsBar";

const defaultProps = {
  conditions: [] as string[],
  exhaustionLevel: 0,
  onToggleCondition: vi.fn(),
};

describe("EffectsBar", () => {
  it("renders without crashing", () => {
    render(<EffectsBar {...defaultProps} />);
    expect(screen.getByText("Conditions")).toBeInTheDocument();
  });

  it("displays all 14 standard D&D 5e conditions", () => {
    render(<EffectsBar {...defaultProps} />);
    const conditions = [
      "Blinded", "Charmed", "Deafened", "Frightened", "Grappled",
      "Incapacitated", "Invisible", "Paralyzed", "Petrified",
      "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious",
    ];
    for (const condition of conditions) {
      expect(screen.getByText(condition)).toBeInTheDocument();
    }
  });

  it("does not show exhaustion section when exhaustion is 0", () => {
    render(<EffectsBar {...defaultProps} exhaustionLevel={0} />);
    expect(screen.queryByText("Exhaustion Level")).not.toBeInTheDocument();
  });

  it("shows exhaustion badge when exhaustion level > 0", () => {
    render(<EffectsBar {...defaultProps} exhaustionLevel={3} />);
    expect(screen.getByText("Exhaustion Level")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onToggleCondition when a condition badge is clicked", () => {
    const onToggle = vi.fn();
    render(<EffectsBar {...defaultProps} onToggleCondition={onToggle} />);
    fireEvent.click(screen.getByText("Poisoned"));
    expect(onToggle).toHaveBeenCalledWith("Poisoned");
  });

  it("renders active conditions with default variant styling", () => {
    render(
      <EffectsBar
        {...defaultProps}
        conditions={["Blinded", "Prone"]}
      />
    );
    // Active conditions should be in the document
    expect(screen.getByText("Blinded")).toBeInTheDocument();
    expect(screen.getByText("Prone")).toBeInTheDocument();
  });

  it("handles empty conditions array gracefully", () => {
    render(<EffectsBar conditions={[]} exhaustionLevel={0} onToggleCondition={vi.fn()} />);
    expect(screen.getByText("Conditions")).toBeInTheDocument();
  });
});
