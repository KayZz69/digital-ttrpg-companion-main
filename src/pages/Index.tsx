/**
 * @fileoverview Home/Index page for character creation.
 * Entry point for the character creation wizard.
 */

import { useState } from "react";
import { useParams } from "react-router-dom";
import { GameSystem } from "@/types/character";
import { SystemSelector } from "@/components/SystemSelector";
import { CharacterWizard } from "@/components/CharacterWizard/CharacterWizard";

/** Props for the Index component */
interface IndexProps {
  /** If true, component is in edit mode for an existing character */
  editMode?: boolean;
}

/**
 * Index page component - the main entry point for character creation.
 * First shows system selector, then the appropriate character wizard.
 *
 * @param editMode - Optional flag indicating we're editing an existing character
 *
 * @route / or /character/:id/edit
 */
const Index = ({ editMode = false }: IndexProps) => {
  const { id } = useParams();
  const [selectedSystem, setSelectedSystem] = useState<GameSystem | null>(
    editMode && id ? "dnd5e" : null
  );

  /** Handles game system selection */
  const handleSystemSelect = (system: GameSystem) => {
    setSelectedSystem(system);
  };

  /** Returns to system selection screen */
  const handleBack = () => {
    setSelectedSystem(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {!selectedSystem ? (
        <SystemSelector onSelectSystem={handleSystemSelect} />
      ) : selectedSystem === "dnd5e" ? (
        <CharacterWizard onBack={handleBack} />
      ) : (
        <div className="container max-w-4xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground mb-4">
            {selectedSystem === "dragonbane" ? "Dragonbane" : "Cyberpunk Red"} support is under development.
          </p>
          <button
            onClick={handleBack}
            className="text-primary hover:underline"
          >
            Back to System Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
