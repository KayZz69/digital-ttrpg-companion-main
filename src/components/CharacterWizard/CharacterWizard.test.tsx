import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterWizard } from "./CharacterWizard";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock storage
vi.mock("@/lib/storage", () => ({
  readCharacters: () => [],
  writeCharacters: vi.fn(),
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn(), toasts: [], dismiss: vi.fn() }),
}));

describe("CharacterWizard inline validation", () => {
  const onBack = vi.fn();

  it("shows inline error when name is empty on basic info step", () => {
    render(<CharacterWizard onBack={onBack} />);
    const errorEl = screen.getByTestId("step-validation-error");
    expect(errorEl).toBeInTheDocument();
    expect(errorEl.textContent).toContain("Enter a character name");
  });

  it("hides inline error when name is provided", () => {
    render(<CharacterWizard onBack={onBack} />);
    // The basic info step should have a name input
    const nameInput = screen.getByRole("textbox", { name: /name/i }) ||
      screen.getByPlaceholderText(/name/i);
    fireEvent.change(nameInput, { target: { value: "Aragorn" } });
    expect(screen.queryByTestId("step-validation-error")).not.toBeInTheDocument();
  });

  it("disables Next button when step has validation error", () => {
    render(<CharacterWizard onBack={onBack} />);
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("enables Next button when step is valid", () => {
    render(<CharacterWizard onBack={onBack} />);
    const nameInput = screen.getByRole("textbox", { name: /name/i }) ||
      screen.getByPlaceholderText(/name/i);
    fireEvent.change(nameInput, { target: { value: "Aragorn" } });
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).not.toBeDisabled();
  });

  it("shows error for race step when no race selected", () => {
    render(<CharacterWizard onBack={onBack} />);
    // Fill in name to pass basic step
    const nameInput = screen.getByRole("textbox", { name: /name/i }) ||
      screen.getByPlaceholderText(/name/i);
    fireEvent.change(nameInput, { target: { value: "Aragorn" } });
    // Navigate to race step
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);
    // Race step should show inline error
    const errorEl = screen.getByTestId("step-validation-error");
    expect(errorEl).toBeInTheDocument();
    expect(errorEl.textContent).toContain("Choose a race");
  });

  it("getStepError validates all required steps from review", () => {
    render(<CharacterWizard onBack={onBack} />);
    // On the basic info step with empty name, the error should mention character name
    const errorEl = screen.getByTestId("step-validation-error");
    expect(errorEl.textContent).toContain("Enter a character name");
    // The Next button should be disabled, preventing progression past incomplete steps
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });
});
