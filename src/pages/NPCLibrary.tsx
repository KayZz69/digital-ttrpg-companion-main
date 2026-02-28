/**
 * @fileoverview NPC Library page for managing reusable NPCs and enemies.
 * NPCs created here can be quickly added to combat encounters.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NPC, NPCAbility } from "@/types/npc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Edit, Users, Swords } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { readNPCs, writeNPCs } from "@/lib/storage";

/**
 * NPC Library page component.
 * Provides a catalog for creating and managing reusable NPCs:
 * - CRUD operations for NPCs
 * - Type classification (enemy, ally, neutral)
 * - Combat stats (HP, AC, initiative bonus)
 * - Custom abilities with descriptions
 * - Search and filter by type
 *
 * @route /npc-library
 */
export const NPCLibrary = () => {
  const navigate = useNavigate();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    type: "enemy" as "enemy" | "ally" | "neutral",
    hitPoints: "",
    armorClass: "",
    initiativeBonus: "",
    notes: "",
    abilities: [] as NPCAbility[],
  });

  useEffect(() => {
    loadNPCs();
  }, []);

  const loadNPCs = () => {
    setNpcs(readNPCs());
  };

  const saveNPCs = (updatedNPCs: NPC[]) => {
    writeNPCs(updatedNPCs);
    setNpcs(updatedNPCs);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "enemy",
      hitPoints: "",
      armorClass: "",
      initiativeBonus: "",
      notes: "",
      abilities: [],
    });
    setEditingNPC(null);
  };

  const openEditDialog = (npc: NPC) => {
    setEditingNPC(npc);
    setFormData({
      name: npc.name,
      type: npc.type,
      hitPoints: npc.hitPoints.toString(),
      armorClass: npc.armorClass.toString(),
      initiativeBonus: npc.initiativeBonus?.toString() || "",
      notes: npc.notes || "",
      abilities: npc.abilities || [],
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.hitPoints || !formData.armorClass) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, HP, and AC.",
        variant: "destructive",
      });
      return;
    }

    const npcData: NPC = {
      id: editingNPC?.id || crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      hitPoints: parseInt(formData.hitPoints),
      armorClass: parseInt(formData.armorClass),
      initiativeBonus: formData.initiativeBonus ? parseInt(formData.initiativeBonus) : undefined,
      abilities: formData.abilities,
      notes: formData.notes,
      createdAt: editingNPC?.createdAt || new Date().toISOString(),
    };

    let updatedNPCs: NPC[];
    if (editingNPC) {
      updatedNPCs = npcs.map((n) => (n.id === editingNPC.id ? npcData : n));
      toast({
        title: "NPC Updated",
        description: `${npcData.name} has been updated.`,
      });
    } else {
      updatedNPCs = [...npcs, npcData];
      toast({
        title: "NPC Added",
        description: `${npcData.name} has been added to your library.`,
      });
    }

    saveNPCs(updatedNPCs);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const npc = npcs.find((n) => n.id === id);
    const updatedNPCs = npcs.filter((n) => n.id !== id);
    saveNPCs(updatedNPCs);
    toast({
      title: "NPC Deleted",
      description: `${npc?.name} has been removed from your library.`,
    });
  };

  const addAbility = () => {
    setFormData({
      ...formData,
      abilities: [...formData.abilities, { name: "", description: "" }],
    });
  };

  const updateAbility = (index: number, field: "name" | "description", value: string) => {
    const updated = [...formData.abilities];
    updated[index][field] = value;
    setFormData({ ...formData, abilities: updated });
  };

  const removeAbility = (index: number) => {
    setFormData({
      ...formData,
      abilities: formData.abilities.filter((_, i) => i !== index),
    });
  };

  const filteredNPCs = npcs.filter((npc) => {
    const matchesSearch = npc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || npc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "enemy":
        return "destructive";
      case "ally":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">NPC Library</CardTitle>
                  <CardDescription>Manage your NPCs and enemies for quick combat use</CardDescription>
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add NPC
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingNPC ? "Edit NPC" : "Add New NPC"}</DialogTitle>
                    <DialogDescription>
                      Create reusable NPCs and enemies for your encounters
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          placeholder="Goblin Scout"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(v: "enemy" | "ally" | "neutral") => setFormData({ ...formData, type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enemy">Enemy</SelectItem>
                            <SelectItem value="ally">Ally</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Hit Points *</Label>
                        <Input
                          type="number"
                          placeholder="7"
                          value={formData.hitPoints}
                          onChange={(e) => setFormData({ ...formData, hitPoints: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Armor Class *</Label>
                        <Input
                          type="number"
                          placeholder="15"
                          value={formData.armorClass}
                          onChange={(e) => setFormData({ ...formData, armorClass: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Initiative Bonus</Label>
                        <Input
                          type="number"
                          placeholder="+2"
                          value={formData.initiativeBonus}
                          onChange={(e) => setFormData({ ...formData, initiativeBonus: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Abilities</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addAbility}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Ability
                        </Button>
                      </div>
                      {formData.abilities.map((ability, index) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ability name"
                              value={ability.name}
                              onChange={(e) => updateAbility(index, "name", e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAbility(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Ability description"
                            value={ability.description}
                            onChange={(e) => updateAbility(index, "description", e.target.value)}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Additional notes or lore"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="flex-1">
                        {editingNPC ? "Update NPC" : "Add NPC"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        <div className="mb-6 flex gap-4">
          <Input
            placeholder="Search NPCs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="enemy">Enemies</SelectItem>
              <SelectItem value="ally">Allies</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredNPCs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No NPCs in your library yet. Add some to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNPCs.map((npc) => (
              <Card key={npc.id} className="fantasy-card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {npc.name}
                        <Badge variant={getTypeBadgeVariant(npc.type)}>
                          {npc.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex gap-4 text-sm">
                          <span>HP: {npc.hitPoints}</span>
                          <span>AC: {npc.armorClass}</span>
                          {npc.initiativeBonus !== undefined && (
                            <span>Init: {npc.initiativeBonus >= 0 ? '+' : ''}{npc.initiativeBonus}</span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {npc.abilities && npc.abilities.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Abilities</Label>
                      {npc.abilities.map((ability, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{ability.name}:</span> {ability.description}
                        </div>
                      ))}
                    </div>
                  )}
                  {npc.notes && (
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">Notes</Label>
                      <p className="text-sm text-muted-foreground">{npc.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(npc)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(npc.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
