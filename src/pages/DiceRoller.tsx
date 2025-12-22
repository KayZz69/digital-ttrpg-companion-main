/**
 * @fileoverview Dice Roller page providing standalone dice rolling functionality.
 * Wraps the DiceRollerInterface component with navigation.
 */

import { DiceRollerInterface } from "@/components/DiceRollerInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Dice Roller page component.
 * Provides a standalone dice roller accessible from anywhere in the app.
 *
 * @route /dice
 */
export const DiceRoller = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dice Roller</h1>
            <p className="text-muted-foreground">
              Roll dice for your solo adventures
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <DiceRollerInterface />
      </div>
    </div>
  );
};
