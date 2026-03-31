import { Background } from "./types";

export const backgrounds: Background[] = [
  {
    id: "acolyte",
    name: "Acolyte",
    skills: ["Insight", "Religion"],
    tools: ["Calligrapher's Supplies"],
    languages: ["Celestial", "Choose one"],
    description: "You spent years in service to a temple, learning sacred rites and providing sacrifices to the god or gods you worship.",
  },
  {
    id: "charlatan",
    name: "Charlatan",
    skills: ["Deception", "Sleight of Hand"],
    tools: ["Disguise Kit", "Forgery Kit"],
    description: "You have always had a way with people. You know what makes them tick, and you can tease out their hearts' desires after a few minutes of conversation.",
  },
  {
    id: "criminal",
    name: "Criminal",
    skills: ["Deception", "Stealth"],
    tools: ["Thieves' Tools"],
    description: "You have a history of breaking the law. You have spent a lot of time among other criminals and still have contacts within the criminal underworld.",
  },
  {
    id: "entertainer",
    name: "Entertainer",
    skills: ["Acrobatics", "Performance"],
    tools: ["Disguise Kit", "Musical Instrument"],
    description: "You thrive in front of an audience. You know how to entrance them, entertain them, and even inspire them.",
  },
  {
    id: "folk-hero",
    name: "Folk Hero",
    skills: ["Animal Handling", "Survival"],
    tools: ["Artisan's Tools", "Vehicles (Land)"],
    description: "You come from a humble social rank, but you are destined for so much more. The people of your home village regard you as their champion.",
  },
  {
    id: "guild-artisan",
    name: "Guild Artisan",
    skills: ["Insight", "Persuasion"],
    tools: ["Artisan's Tools"],
    languages: ["Choose one"],
    description: "You are a member of an artisan's guild, skilled in a particular field and closely associated with other artisans.",
  },
  {
    id: "hermit",
    name: "Hermit",
    skills: ["Medicine", "Religion"],
    tools: ["Herbalism Kit"],
    languages: ["Choose one"],
    description: "You lived in seclusion for a formative time in your life, either in a sheltered community or entirely alone.",
  },
  {
    id: "noble",
    name: "Noble",
    skills: ["History", "Persuasion"],
    tools: ["Gaming Set"],
    languages: ["Choose one"],
    description: "You understand wealth, power, and privilege. You carry a noble title, and your family owns land, collects taxes, and wields significant political influence.",
  },
  {
    id: "outlander",
    name: "Outlander",
    skills: ["Athletics", "Survival"],
    tools: ["Musical Instrument"],
    languages: ["Choose one"],
    description: "You grew up in the wilds, far from civilization and the comforts of town and technology.",
  },
  {
    id: "sage",
    name: "Sage",
    skills: ["Arcana", "History"],
    languages: ["Choose two"],
    description: "You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you.",
  },
  {
    id: "sailor",
    name: "Sailor",
    skills: ["Athletics", "Perception"],
    tools: ["Navigator's Tools", "Vehicles (Water)"],
    description: "You sailed on a seagoing vessel for years. In that time, you faced down mighty storms, monsters of the deep, and those who wanted to sink your craft to the bottomless depths.",
  },
  {
    id: "soldier",
    name: "Soldier",
    skills: ["Athletics", "Intimidation"],
    tools: ["Gaming Set", "Vehicles (Land)"],
    description: "War has been your life for as long as you care or choose to remember. You trained as a youth, studied the use of weapons and armor, and learned basic survival techniques.",
  },
  {
    id: "urchin",
    name: "Urchin",
    skills: ["Sleight of Hand", "Stealth"],
    tools: ["Disguise Kit", "Thieves' Tools"],
    description: "You grew up on the streets alone, orphaned, and poor. You had no one to watch over you or to provide for you, so you learned to provide for yourself.",
  },
];

export function getAllBackgrounds(): Background[] {
  return backgrounds;
}

