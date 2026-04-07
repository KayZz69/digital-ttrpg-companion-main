/**
 * @fileoverview Condition badges and exhaustion level display.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Condition } from "@/types/character";

const ALL_CONDITIONS: Condition[] = [
  "Blinded", "Charmed", "Deafened", "Frightened", "Grappled", "Incapacitated",
  "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained",
  "Stunned", "Unconscious",
];

interface EffectsBarProps {
  conditions: Condition[];
  exhaustionLevel: number;
  onToggleCondition: (condition: Condition) => void;
}

export const EffectsBar = ({
  conditions,
  exhaustionLevel,
  onToggleCondition,
}: EffectsBarProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Conditions</CardTitle>
        <CardDescription>Track active status effects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {ALL_CONDITIONS.map((condition) => {
            const isActive = conditions.includes(condition);
            return (
              <Badge
                key={condition}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onToggleCondition(condition)}
              >
                {condition}
                {isActive && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
        {exhaustionLevel > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Exhaustion Level</span>
              <Badge variant="destructive">{exhaustionLevel}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
