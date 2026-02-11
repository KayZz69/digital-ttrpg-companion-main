import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DnD5eCharacter, DnD5eAbilityScores, Character } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dices, Save, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { readCharacters, writeCharacters } from "@/lib/storage";
import { getAllClasses, getAllRaces } from "@/data";
import {
  getClassByName,
  getClassSpellcastingAbility,
  getRaceByName,
} from "@/lib/dndCompendium";
import { getDefaultSpellSlots, getLevelOneHitPoints } from "@/lib/dndRules";

interface DnD5eCharacterFormProps {
  onBack: () => void;
  editMode?: boolean;
}

export const DnD5eCharacterForm = ({ onBack, editMode = false }: DnD5eCharacterFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Partial<DnD5eCharacter>>({
    name: "",
    race: "",
    class: "",
    level: 1,
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  });

  useEffect(() => {
    if (editMode && id) {
      loadCharacter(id);
    }
  }, [editMode, id]);

  const loadCharacter = (characterId: string) => {
    const characters: Character[] = readCharacters();
    const found = characters.find((c) => c.id === characterId);
    if (found && found.system === "dnd5e") {
      setCharacter(found.data as DnD5eCharacter);
    } else {
      toast({
        title: "Character Not Found",
        description: "The character you're trying to edit doesn't exist.",
        variant: "destructive",
      });
      navigate("/characters");
    }
  };

  const races = getAllRaces().map((race) => race.name);
  const classes = getAllClasses().map((entry) => entry.name);

  const abilityNames: (keyof DnD5eAbilityScores)[] = [
    "strength", "dexterity", "constitution", 
    "intelligence", "wisdom", "charisma"
  ];

  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const rollAbilityScore = () => {
    // Roll 4d6, drop lowest
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    return rolls.slice(1).reduce((sum, roll) => sum + roll, 0);
  };

  const rollAllAbilities = () => {
    const newScores: DnD5eAbilityScores = {
      strength: rollAbilityScore(),
      dexterity: rollAbilityScore(),
      constitution: rollAbilityScore(),
      intelligence: rollAbilityScore(),
      wisdom: rollAbilityScore(),
      charisma: rollAbilityScore(),
    };
    setCharacter({ ...character, abilityScores: newScores });
    toast({
      title: "Abilities Rolled!",
      description: "Your ability scores have been generated.",
    });
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

  const handleSave = () => {
    if (!character.name || !character.race || !character.class) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, race, and class.",
        variant: "destructive",
      });
      return;
    }

    const characters: Character[] = readCharacters();

    if (editMode && id) {
      // Update existing character
      const index = characters.findIndex((c) => c.id === id);
      if (index !== -1) {
        characters[index] = {
          ...characters[index],
          updatedAt: new Date().toISOString(),
          data: character as DnD5eCharacter,
        };
        writeCharacters(characters);
        toast({
          title: "Character Updated!",
          description: `${character.name} has been updated.`,
        });
        navigate(`/character/${id}`);
      }
    } else {
      // Create new character
      const level = character.level || 1;
      const maxHP = getLevelOneHitPoints(
        character.class,
        character.abilityScores?.constitution || 10
      );
      const spellcastingAbility = getClassSpellcastingAbility(character.class);
      const classRecord = getClassByName(character.class);
      const raceRecord = getRaceByName(character.race);
      
      const completeCharacter: DnD5eCharacter = {
        id: character.id || crypto.randomUUID(),
        classId: classRecord?.id,
        raceId: raceRecord?.id,
        name: character.name,
        race: character.race,
        class: character.class,
        level,
        abilityScores: character.abilityScores!,
        experiencePoints: character.experiencePoints || 0,
        hitPoints: character.hitPoints || {
          current: maxHP,
          max: maxHP,
        },
        inventory: character.inventory || [],
        skills: character.skills || {},
        savingThrows: character.savingThrows || {},
        ...(spellcastingAbility && {
          spellcastingAbility,
          spellSlots: character.spellSlots || getDefaultSpellSlots(character.class, level),
          preparedSpells: [],
        }),
      };

      characters.push({
        id: completeCharacter.id,
        system: "dnd5e",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: completeCharacter,
      });
      writeCharacters(characters);

      toast({
        title: "Character Saved!",
        description: `${completeCharacter.name} has been created.`,
      });
      navigate("/characters");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Systems
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {editMode ? "Edit D&D 5e Character" : "Create D&D 5e Character"}
          </CardTitle>
          <CardDescription>
            {editMode
              ? "Update your adventurer's details"
              : "Build your adventurer for the quest ahead"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Character Name</Label>
              <Input
                id="name"
                placeholder="Enter character name"
                value={character.name}
                onChange={(e) => setCharacter({ ...character, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="number"
                min="1"
                max="20"
                value={character.level}
                onChange={(e) => setCharacter({ ...character, level: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="race">Race</Label>
              <Select
                value={character.race}
                onValueChange={(value) =>
                  setCharacter({
                    ...character,
                    race: value,
                    raceId: getRaceByName(value)?.id,
                  })
                }
              >
                <SelectTrigger id="race" className="bg-popover">
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {races.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select
                value={character.class}
                onValueChange={(value) =>
                  setCharacter({
                    ...character,
                    class: value,
                    classId: getClassByName(value)?.id,
                    spellcastingAbility: getClassSpellcastingAbility(value),
                  })
                }
              >
                <SelectTrigger id="class" className="bg-popover">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ability Scores */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg">Ability Scores</Label>
              <Button onClick={rollAllAbilities} variant="outline" size="sm">
                <Dices className="w-4 h-4 mr-2" />
                Roll All (4d6 drop lowest)
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {abilityNames.map((ability) => (
                <div key={ability} className="space-y-2">
                  <Label htmlFor={ability} className="capitalize">
                    {ability}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={ability}
                      type="number"
                      min="1"
                      max="20"
                      value={character.abilityScores?.[ability] || 10}
                      onChange={(e) => updateAbilityScore(ability, e.target.value)}
                      className="w-20"
                    />
                    <span className="text-sm font-medium text-muted-foreground w-10">
                      {getModifier(character.abilityScores?.[ability] || 10)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} size="lg" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {editMode ? "Update Character" : "Save Character"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
