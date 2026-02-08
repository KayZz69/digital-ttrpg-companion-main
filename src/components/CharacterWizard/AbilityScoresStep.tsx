import { useState } from "react";
import { DnD5eCharacter, DnD5eAbilityScores } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dices, Calculator, ListOrdered } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AbilityScoresStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

const ABILITY_INFO: Record<keyof DnD5eAbilityScores, { icon: string; description: string }> = {
  strength: { icon: "STR", description: "Physical power and athleticism" },
  dexterity: { icon: "DEX", description: "Agility and reflexes" },
  constitution: { icon: "CON", description: "Health and stamina" },
  intelligence: { icon: "INT", description: "Reasoning and memory" },
  wisdom: { icon: "WIS", description: "Awareness and insight" },
  charisma: { icon: "CHA", description: "Force of personality" },
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

type AbilityMethod = "roll" | "standard" | "pointbuy" | "manual";

export const AbilityScoresStep = ({ character, setCharacter }: AbilityScoresStepProps) => {
  const [method, setMethod] = useState<AbilityMethod>("roll");
  const [rolling, setRolling] = useState<keyof DnD5eAbilityScores | null>(null);
  const [rollingAll, setRollingAll] = useState(false);
  const [assignedStandardArray, setAssignedStandardArray] = useState<Record<string, number>>({});
  const [pointsRemaining, setPointsRemaining] = useState(27);

  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const rollAbilityScore = () => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    return rolls.slice(1).reduce((sum, roll) => sum + roll, 0);
  };

  const rollSingleAbility = (ability: keyof DnD5eAbilityScores): Promise<void> => {
    return new Promise((resolve) => {
      setRolling(ability);
      
      // Simulate dice rolling animation
      const rollAnimation = setInterval(() => {
        const tempScore = Math.floor(Math.random() * 13) + 6;
        setCharacter({
          ...character,
          abilityScores: {
            ...character.abilityScores!,
            [ability]: tempScore,
          },
        });
      }, 50);

      // Stop after animation and set final value
      setTimeout(() => {
        clearInterval(rollAnimation);
        const finalScore = rollAbilityScore();
        setCharacter({
          ...character,
          abilityScores: {
            ...character.abilityScores!,
            [ability]: finalScore,
          },
        });
        setRolling(null);
        resolve();
      }, 500);
    });
  };

  const rollAllAbilities = async () => {
    setRollingAll(true);
    const abilities = Object.keys(ABILITY_INFO) as (keyof DnD5eAbilityScores)[];
    const newScores: DnD5eAbilityScores = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };
    
    for (const ability of abilities) {
      setRolling(ability);
      
      // Animate
      const animationPromise = new Promise<void>((resolve) => {
        const rollAnimation = setInterval(() => {
          const tempScore = Math.floor(Math.random() * 13) + 6;
          setCharacter({
            ...character,
            abilityScores: {
              ...newScores,
              [ability]: tempScore,
            },
          });
        }, 50);

        setTimeout(() => {
          clearInterval(rollAnimation);
          resolve();
        }, 500);
      });
      
      await animationPromise;
      
      // Set final score
      const finalScore = rollAbilityScore();
      newScores[ability] = finalScore;
      setCharacter({
        ...character,
        abilityScores: { ...newScores },
      });
      setRolling(null);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setRollingAll(false);
    toast({
      title: "All Abilities Rolled!",
      description: "Your character's ability scores have been generated.",
    });
  };

  const applyStandardArray = (ability: keyof DnD5eAbilityScores, value: number) => {
    const newAssignments = { ...assignedStandardArray };
    
    // If this ability already had a value assigned, free it up
    if (newAssignments[ability]) {
      delete newAssignments[ability];
    }
    
    // Assign the new value
    newAssignments[ability] = value;
    
    setAssignedStandardArray(newAssignments);
    setCharacter({
      ...character,
      abilityScores: {
        ...character.abilityScores!,
        [ability]: value,
      },
    });
  };

  const resetStandardArray = () => {
    setAssignedStandardArray({});
    setCharacter({
      ...character,
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    });
  };
  
  const getAvailableStandardArrayValues = (currentAbility: keyof DnD5eAbilityScores): number[] => {
    const assigned = Object.entries(assignedStandardArray)
      .filter(([ability]) => ability !== currentAbility)
      .map(([_, value]) => value);
    return STANDARD_ARRAY.filter(val => !assigned.includes(val));
  };

  const calculatePointBuyCost = (scores: DnD5eAbilityScores): number => {
    let total = 0;
    Object.values(scores).forEach(score => {
      total += POINT_BUY_COSTS[score] || 0;
    });
    return total;
  };

  const updatePointBuyScore = (ability: keyof DnD5eAbilityScores, newValue: number) => {
    const clampedValue = Math.min(Math.max(newValue, 8), 15);
    const newScores = {
      ...character.abilityScores!,
      [ability]: clampedValue,
    };
    
    const cost = calculatePointBuyCost(newScores);
    if (cost <= 27) {
      setCharacter({
        ...character,
        abilityScores: newScores,
      });
      setPointsRemaining(27 - cost);
    }
  };

  const resetPointBuy = () => {
    setCharacter({
      ...character,
      abilityScores: {
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8,
      },
    });
    setPointsRemaining(27);
  };

  const updateAbilityScore = (ability: keyof DnD5eAbilityScores, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.min(Math.max(numValue, 1), 20);
    setCharacter({
      ...character,
      abilityScores: {
        ...character.abilityScores!,
        [ability]: clampedValue,
      },
    });
  };

  const renderAbilityCards = (interactive: boolean = false) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(ABILITY_INFO) as (keyof DnD5eAbilityScores)[]).map((ability) => {
          const score = character.abilityScores?.[ability] || 10;
          const modifier = getModifier(score);
          const info = ABILITY_INFO[ability];
          const isRolling = rolling === ability;

          return (
            <Card
              key={ability}
              className={`transition-all ${
                isRolling ? "border-primary border-2 shadow-lg scale-105" : "border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <CardTitle className="text-base capitalize">{ability}</CardTitle>
                      <CardDescription className="text-xs">{info.description}</CardDescription>
                    </div>
                  </div>
                  {method === "roll" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => rollSingleAbility(ability)}
                      disabled={isRolling || rollingAll}
                      className="h-8 w-8 p-0"
                    >
                      <Dices className={`h-4 w-4 ${isRolling ? "animate-spin" : ""}`} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor={ability} className="text-xs text-muted-foreground">
                      Score
                    </Label>
                    {method === "standard" ? (
                      <select
                        id={ability}
                        value={assignedStandardArray[ability] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            applyStandardArray(ability, parseInt(val));
                          }
                        }}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">--</option>
                        {STANDARD_ARRAY.map(val => {
                          const available = getAvailableStandardArrayValues(ability);
                          const isAssignedHere = assignedStandardArray[ability] === val;
                          return (
                            <option 
                              key={val} 
                              value={val}
                              disabled={!available.includes(val) && !isAssignedHere}
                            >
                              {val}
                            </option>
                          );
                        })}
                      </select>
                    ) : method === "pointbuy" ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePointBuyScore(ability, score - 1)}
                          disabled={score <= 8}
                          className="h-12 w-10 p-0"
                        >
                          -
                        </Button>
                        <Input
                          id={ability}
                          type="number"
                          min="8"
                          max="15"
                          value={score}
                          readOnly
                          className="text-center text-lg font-bold h-12"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePointBuyScore(ability, score + 1)}
                          disabled={score >= 15 || pointsRemaining <= 0}
                          className="h-12 w-10 p-0"
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      <Input
                        id={ability}
                        type="number"
                        min="1"
                        max="20"
                        value={score}
                        onChange={(e) => updateAbilityScore(ability, e.target.value)}
                        className="text-center text-lg font-bold h-12"
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center px-3 py-2 bg-muted rounded-lg">
                    <span className="text-xs text-muted-foreground">Mod</span>
                    <span className={`text-xl font-bold ${
                      parseInt(modifier) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}>
                      {modifier}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Ability Scores</CardTitle>
          <CardDescription>
            Choose your method for determining ability scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={method} onValueChange={(v) => setMethod(v as AbilityMethod)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roll" className="gap-2">
                <Dices className="h-4 w-4" />
                Roll
              </TabsTrigger>
              <TabsTrigger value="standard" className="gap-2">
                <ListOrdered className="h-4 w-4" />
                Standard
              </TabsTrigger>
              <TabsTrigger value="pointbuy" className="gap-2">
                <Calculator className="h-4 w-4" />
                Point Buy
              </TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="roll" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">4d6 Drop Lowest</p>
                  <p className="text-sm text-muted-foreground">
                    Roll four dice and remove the lowest (range 3-18)
                  </p>
                </div>
                <Button onClick={rollAllAbilities} disabled={rollingAll} size="lg" className="gap-2">
                  <Dices className={`h-5 w-5 ${rollingAll ? "animate-spin" : ""}`} />
                  Roll All
                </Button>
              </div>
              {renderAbilityCards(true)}
            </TabsContent>

            <TabsContent value="standard" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Standard Array: 15, 14, 13, 12, 10, 8</p>
                  <p className="text-sm text-muted-foreground">
                    Assign these values to your abilities
                  </p>
                </div>
                <Button onClick={resetStandardArray} variant="outline" size="sm">
                  Reset
                </Button>
              </div>
              {renderAbilityCards()}
            </TabsContent>

            <TabsContent value="pointbuy" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Point Buy (27 points)</p>
                  <p className="text-sm text-muted-foreground">
                    Distribute points to customize your scores (range 8-15)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{pointsRemaining}</p>
                    <p className="text-xs text-muted-foreground">Points Left</p>
                  </div>
                  <Button onClick={resetPointBuy} variant="outline" size="sm">
                    Reset
                  </Button>
                </div>
              </div>
              {renderAbilityCards()}
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {Object.entries(POINT_BUY_COSTS).map(([score, cost]) => (
                      <div key={score} className="flex justify-between">
                        <span className="font-semibold">{score}:</span>
                        <span className="text-muted-foreground">{cost}pt</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold">Manual Entry</p>
                <p className="text-sm text-muted-foreground">
                  Enter your ability scores directly (range 1-20)
                </p>
              </div>
              {renderAbilityCards()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

