/**
 * @fileoverview Character sheet header with name, race/class/level,
 * proficiency bonus badge, and navigation buttons.
 */

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Edit, Dices, BookOpen, Swords, Star } from "lucide-react";

interface HeaderInfoProps {
  characterId: string;
  name: string;
  race: string;
  characterClass: string;
  level: number;
  proficiencyBonus: number;
  readyToLevelUp: boolean;
  onNavigate: (path: string) => void;
  onLevelUp: () => void;
}

export const HeaderInfo = ({
  characterId,
  name,
  race,
  characterClass,
  level,
  proficiencyBonus,
  readyToLevelUp,
  onNavigate,
  onLevelUp,
}: HeaderInfoProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => onNavigate("/characters")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Characters
        </Button>
        <div className="flex flex-wrap gap-2">
          {readyToLevelUp && (
            <Button
              onClick={onLevelUp}
              className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-semibold"
            >
              <Star className="w-4 h-4 mr-2" />
              Level Up!
            </Button>
          )}
          <Button variant="outline" onClick={() => onNavigate(`/character/${characterId}/combat`)}>
            <Swords className="w-4 h-4 mr-2" />
            Combat
          </Button>
          <Button variant="outline" onClick={() => onNavigate(`/compendium?characterId=${characterId}`)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Compendium
          </Button>
          <Button variant="outline" onClick={() => onNavigate(`/character/${characterId}/journal`)}>
            <BookOpen className="w-4 h-4 mr-2" />
            Journal
          </Button>
          <Button variant="outline" onClick={() => onNavigate("/dice")}>
            <Dices className="w-4 h-4 mr-2" />
            Dice Roller
          </Button>
          <Button onClick={() => onNavigate(`/character/${characterId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Character
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2 font-display">{name}</CardTitle>
              <CardDescription className="text-lg">
                {race} {characterClass} | Level {level}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                D&D 5e
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                Proficiency Bonus: +{proficiencyBonus}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};
