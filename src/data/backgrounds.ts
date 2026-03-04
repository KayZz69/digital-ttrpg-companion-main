import { Background } from "./types";

export const backgrounds: Background[] = [
  { id: "acolyte", name: "Acolyte", skills: ["Insight", "Religion"] },
  { id: "charlatan", name: "Charlatan", skills: ["Deception", "Sleight of Hand"] },
  { id: "criminal", name: "Criminal", skills: ["Deception", "Stealth"] },
  { id: "entertainer", name: "Entertainer", skills: ["Acrobatics", "Performance"] },
  { id: "folk-hero", name: "Folk Hero", skills: ["Animal Handling", "Survival"] },
  { id: "guild-artisan", name: "Guild Artisan", skills: ["Insight", "Persuasion"] },
  { id: "hermit", name: "Hermit", skills: ["Medicine", "Religion"] },
  { id: "noble", name: "Noble", skills: ["History", "Persuasion"] },
  { id: "outlander", name: "Outlander", skills: ["Athletics", "Survival"] },
  { id: "sage", name: "Sage", skills: ["Arcana", "History"] },
  { id: "sailor", name: "Sailor", skills: ["Athletics", "Perception"] },
  { id: "soldier", name: "Soldier", skills: ["Athletics", "Intimidation"] },
  { id: "urchin", name: "Urchin", skills: ["Sleight of Hand", "Stealth"] },
];

export function getAllBackgrounds(): Background[] {
  return backgrounds;
}

