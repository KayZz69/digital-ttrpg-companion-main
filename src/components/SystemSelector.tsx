/**
 * @fileoverview Game System Selector component for choosing RPG system.
 * Entry point for character creation showing available game systems.
 */

import { GameSystem } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Scroll, Zap, Users, Dices } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Props for the SystemSelector component.
 */
interface SystemSelectorProps {
  /** Callback when a game system is selected */
  onSelectSystem: (system: GameSystem) => void;
}

/**
 * System Selector component.
 * Displays available RPG game systems as cards:
 * - D&D 5e (available)
 * - Dragonbane (coming soon)
 * - Cyberpunk Red (coming soon)
 *
 * Also provides quick links to Dice Roller and My Characters.
 *
 * @param props - Component props including selection callback
 */
export const SystemSelector = ({ onSelectSystem }: SystemSelectorProps) => {
  const navigate = useNavigate();

  const systems = [
    {
      id: "dnd5e" as GameSystem,
      name: "D&D 5th Edition",
      description: "Classic d20-based fantasy roleplaying with classes, spells, and epic adventures.",
      icon: Swords,
      available: true,
    },
    {
      id: "dragonbane" as GameSystem,
      name: "Dragonbane",
      description: "Roll-under d20 system with kin, professions, and boons & banes mechanics.",
      icon: Scroll,
      available: false,
    },
    {
      id: "cyberpunk" as GameSystem,
      name: "Cyberpunk Red",
      description: "D10-based dark future RPG with roles, cyberware, and netrunning.",
      icon: Zap,
      available: false,
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1"></div>
          <h1 className="text-4xl font-bold text-foreground font-display fantasy-heading">SoloQuest Toolkit</h1>
          <div className="flex-1 flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/dice")}>
              <Dices className="w-4 h-4 mr-2" />
              Dice Roller
            </Button>
            <Button variant="outline" onClick={() => navigate("/characters")}>
              <Users className="w-4 h-4 mr-2" />
              My Characters
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">Choose your adventure system</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {systems.map((system) => {
          const Icon = system.icon;
          return (
            <Card
              key={system.id}
              className={`transition-all fantasy-card-hover fantasy-flourish ${!system.available ? "opacity-60" : ""
                }`}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  {!system.available && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Coming Soon
                    </span>
                  )}
                </div>
                <CardTitle>{system.name}</CardTitle>
                <CardDescription>{system.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => onSelectSystem(system.id)}
                  disabled={!system.available}
                  className="w-full"
                >
                  {system.available ? "Start Character" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
