import { DnD5eCharacter } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface BasicInfoStepProps {
  character: Partial<DnD5eCharacter>;
  setCharacter: (character: Partial<DnD5eCharacter>) => void;
}

export const BasicInfoStep = ({ character, setCharacter }: BasicInfoStepProps) => {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Who is your character?</CardTitle>
            <CardDescription>
              Give your character a name to begin their adventure
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base">Character Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Thorin Ironforge"
            value={character.name || ""}
            onChange={(e) => setCharacter({ ...character, name: e.target.value })}
            className="text-lg h-12"
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            This name will represent your character throughout their journey
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="font-semibold mb-2 text-sm">Tips for choosing a name:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Consider your character's background and personality</li>
            <li>Think about their race and cultural heritage</li>
            <li>Make it memorable and easy to pronounce</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
