#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const SOURCE_ROOT = process.argv[2] || "D:/Kay/Games/& TTRPG/5etools export";
const WORKSPACE_ROOT = process.cwd();

const paths = {
  races: path.join(SOURCE_ROOT, "data", "races.json"),
  spellsPhb: path.join(SOURCE_ROOT, "data", "spells", "spells-phb.json"),
  spellLookup: path.join(SOURCE_ROOT, "data", "generated", "gendata-spell-source-lookup.json"),
  itemsBase: path.join(SOURCE_ROOT, "data", "items-base.json"),
  items: path.join(SOURCE_ROOT, "data", "items.json"),
};

const outFiles = {
  races: path.join(WORKSPACE_ROOT, "src", "data", "races.ts"),
  spells: path.join(WORKSPACE_ROOT, "src", "data", "spells.ts"),
  equipment: path.join(WORKSPACE_ROOT, "src", "data", "equipment.ts"),
};

for (const p of Object.values(paths)) {
  if (!fs.existsSync(p)) {
    throw new Error(`Missing required source file: ${p}`);
  }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniq(items) {
  return [...new Set(items)];
}

function cleanText(text) {
  return String(text)
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function untag(text) {
  let out = String(text);

  out = out.replace(/\{@([^ }]+)\s([^}]+)\}/g, (_m, tag, body) => {
    const parts = String(body).split("|");
    const first = parts[0];

    if (["damage", "dice", "d20", "hit", "dc", "chance", "recharge"].includes(tag)) {
      return cleanText(first);
    }

    if (["note", "i", "b", "u"].includes(tag)) {
      return cleanText(first);
    }

    return cleanText(first);
  });

  out = out.replace(/\{@[^}]+\}/g, "");
  return cleanText(out);
}

function flattenEntries(entry, options = {}) {
  if (entry == null) return "";
  if (typeof entry === "string") return untag(entry);

  if (Array.isArray(entry)) {
    const parts = entry
      .map(it => flattenEntries(it, options))
      .filter(Boolean);

    const sep = options.sep || "\n";
    return parts.join(sep).trim();
  }

  if (typeof entry === "object") {
    if (entry.type === "list" && Array.isArray(entry.items)) {
      return entry.items.map(it => flattenEntries(it, { sep: " " })).filter(Boolean).join("; ");
    }

    if (entry.type === "item" && entry.entry) {
      return flattenEntries(entry.entry, options);
    }

    if (entry.type === "itemSub") {
      const nm = entry.name ? `${untag(entry.name)}: ` : "";
      return `${nm}${flattenEntries(entry.entry || entry.entries || "", { sep: " " })}`.trim();
    }

    if (Array.isArray(entry.entries)) {
      const body = flattenEntries(entry.entries, { sep: " " });
      if (options.includeHeading && entry.name) {
        return `${untag(entry.name)}: ${body}`.trim();
      }
      return body;
    }

    if (Array.isArray(entry.items)) {
      return flattenEntries(entry.items, options);
    }

    if (entry.entry) {
      return flattenEntries(entry.entry, options);
    }

    if (entry.name) {
      return untag(entry.name);
    }
  }

  return "";
}

function formatCostFromCp(valueCp) {
  const cp = Number.isFinite(valueCp) ? Number(valueCp) : 0;
  if (cp % 1000 === 0) return { quantity: cp / 1000, unit: "pp" };
  if (cp % 100 === 0) return { quantity: cp / 100, unit: "gp" };
  if (cp % 10 === 0) return { quantity: cp / 10, unit: "sp" };
  return { quantity: cp, unit: "cp" };
}

function schoolFromCode(code) {
  const map = {
    A: "Abjuration",
    C: "Conjuration",
    D: "Divination",
    E: "Enchantment",
    V: "Evocation",
    I: "Illusion",
    N: "Necromancy",
    T: "Transmutation",
  };

  return map[code] || "Evocation";
}

function formatTimePart(t) {
  if (!t || typeof t !== "object") return "1 action";
  const n = Number(t.number || 1);
  const plural = n === 1 ? "" : "s";

  let unit;
  switch (t.unit) {
    case "bonus":
      unit = `bonus action${plural}`;
      break;
    case "reaction":
      unit = `reaction${plural}`;
      break;
    case "minute":
      unit = `minute${plural}`;
      break;
    case "hour":
      unit = `hour${plural}`;
      break;
    case "round":
      unit = `round${plural}`;
      break;
    default:
      unit = `action${plural}`;
      break;
  }

  let text = `${n} ${unit}`;
  if (t.condition) {
    text += `, ${untag(t.condition)}`;
  }
  return text;
}

function formatRange(range) {
  if (!range || typeof range !== "object") return "Self";
  if (range.type === "special") return "Special";

  const dist = range.distance || {};

  const distToText = (d) => {
    if (!d || typeof d !== "object") return "Special";
    switch (d.type) {
      case "self": return "Self";
      case "touch": return "Touch";
      case "sight": return "Sight";
      case "unlimited": return "Unlimited";
      case "feet": return `${d.amount} feet`;
      case "miles": return `${d.amount} mile${d.amount === 1 ? "" : "s"}`;
      default: {
        if (d.amount != null && d.type) return `${d.amount} ${d.type}`;
        return "Special";
      }
    }
  };

  if (range.type === "point") {
    return distToText(dist);
  }

  const shaped = ["line", "cone", "radius", "sphere", "hemisphere", "cylinder", "cube"];
  if (shaped.includes(range.type)) {
    const shape = range.type[0].toUpperCase() + range.type.slice(1);
    const size = distToText(dist);
    return `Self (${size} ${shape})`;
  }

  return "Special";
}

function getDurationInfo(durationArr) {
  const durations = Array.isArray(durationArr) ? durationArr : [];
  const concentration = durations.some(d => d && d.concentration);

  if (!durations.length) {
    return { text: "Instantaneous", concentration };
  }

  const one = durations[0];
  if (!one || typeof one !== "object") {
    return { text: "Instantaneous", concentration };
  }

  if (one.type === "instant") {
    return { text: "Instantaneous", concentration };
  }

  if (one.type === "timed" && one.duration) {
    const amount = one.duration.amount;
    const unit = one.duration.type || "round";
    const plural = amount === 1 ? "" : "s";
    const upTo = one.duration.upTo ? "up to " : "";
    const base = `${upTo}${amount} ${unit}${plural}`;
    return {
      text: concentration ? `Concentration, ${base}` : base,
      concentration,
    };
  }

  if (one.type === "permanent") {
    const ends = Array.isArray(one.ends) ? one.ends : [];
    if (ends.includes("dispel") && ends.includes("trigger")) return { text: "Until dispelled or triggered", concentration };
    if (ends.includes("dispel")) return { text: "Until dispelled", concentration };
    if (ends.includes("trigger")) return { text: "Until triggered", concentration };
    return { text: "Permanent", concentration };
  }

  if (one.type === "special") {
    return { text: "Special", concentration };
  }

  return { text: "Instantaneous", concentration };
}

function getSpellClasses(spellName, spellLookup) {
  const key = spellName.toLowerCase();
  const fromLookup = spellLookup?.phb?.[key];
  if (!fromLookup || !fromLookup.class) return [];

  const classes = [];
  for (const classMap of Object.values(fromLookup.class)) {
    if (!classMap || typeof classMap !== "object") continue;
    for (const className of Object.keys(classMap)) {
      classes.push(className);
    }
  }

  return uniq(classes).sort((a, b) => a.localeCompare(b));
}

function getPropertyNameMap(itemProperties) {
  const map = {};
  for (const prop of itemProperties) {
    const abbr = prop.abbreviation;
    const name = prop.entries?.[0]?.name;
    if (abbr && name) map[abbr] = name;
  }
  return map;
}

function mapDamageType(code) {
  const map = { S: "slashing", P: "piercing", B: "bludgeoning" };
  return map[code] || "";
}

function languageDisplay(key) {
  const map = {
    common: "Common",
    dwarvish: "Dwarvish",
    elvish: "Elvish",
    gnomish: "Gnomish",
    halfling: "Halfling",
    draconic: "Draconic",
    infernal: "Infernal",
    celestial: "Celestial",
    giant: "Giant",
    orc: "Orc",
    abyssal: "Abyssal",
    primordial: "Primordial",
    sylvan: "Sylvan",
    undercommon: "Undercommon",
  };
  return map[key] || key[0].toUpperCase() + key.slice(1);
}

function parseLanguages(languageProficiencies) {
  if (!Array.isArray(languageProficiencies) || !languageProficiencies.length) return undefined;

  const out = [];
  for (const prof of languageProficiencies) {
    if (!prof || typeof prof !== "object") continue;

    for (const [key, val] of Object.entries(prof)) {
      if (!val) continue;

      if (key === "other") {
        out.push("One other language of your choice");
        continue;
      }

      if (key === "anyStandard") {
        const n = Number(val) || 1;
        out.push(`${n} standard language${n === 1 ? "" : "s"} of your choice`);
        continue;
      }

      if (key === "anyExotic") {
        const n = Number(val) || 1;
        out.push(`${n} exotic language${n === 1 ? "" : "s"} of your choice`);
        continue;
      }

      if (key === "choose") {
        out.push("Choice-based languages");
        continue;
      }

      out.push(languageDisplay(key));
    }
  }

  return uniq(out);
}

function formatAbilityIncrease(ability) {
  if (!Array.isArray(ability) || !ability.length) return undefined;
  const ab = ability[0];
  if (!ab || typeof ab !== "object") return undefined;

  const statMap = {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma",
  };

  const bits = [];
  for (const [k, v] of Object.entries(statMap)) {
    if (ab[k] != null) {
      const n = Number(ab[k]);
      if (Number.isFinite(n)) {
        bits.push(`${v} +${n}`);
      }
    }
  }

  if (ab.choose) {
    bits.push("Choose ability score increases");
  }

  return bits.length ? bits.join(", ") : undefined;
}

function extractRaceTraits(entries) {
  if (!Array.isArray(entries)) return [];

  const excluded = new Set(["Age", "Alignment", "Size", "Language", "Languages", "Creature Type"]);
  const traits = [];

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    if (entry.type !== "entries" || !entry.name) continue;

    const name = untag(entry.name);
    if (excluded.has(name)) continue;

    const description = flattenEntries(entry.entries, { sep: " " });
    if (!description) continue;

    traits.push({ name, description });
  }

  return traits;
}

function writeTsFile(outPath, content) {
  fs.writeFileSync(outPath, content.replace(/\r?\n/g, "\n"), "utf8");
}

const racesRaw = readJson(paths.races).race;
const spellsRaw = readJson(paths.spellsPhb).spell;
const spellLookup = readJson(paths.spellLookup);
const itemsBaseRaw = readJson(paths.itemsBase);
const itemsRaw = readJson(paths.items).item;

const raceSelection = [
  ["Aasimar", ["XPHB", "MPMM", "VGM", "DMG"]],
  ["Dragonborn", ["XPHB", "PHB"]],
  ["Dwarf", ["XPHB", "PHB"]],
  ["Elf", ["XPHB", "PHB"]],
  ["Gnome", ["XPHB", "PHB"]],
  ["Goliath", ["XPHB", "MPMM", "VGM"]],
  ["Halfling", ["XPHB", "PHB"]],
  ["Human", ["XPHB", "PHB"]],
  ["Orc", ["XPHB", "MPMM", "VGM", "ERLW", "DMG"]],
  ["Tiefling", ["XPHB", "PHB"]],
];

const races = raceSelection
  .map(([name, sources]) => {
    const picked = sources
      .map(src => racesRaw.find(r => r.name === name && r.source === src))
      .find(Boolean);

    if (!picked) return null;

    const sizes = Array.isArray(picked.size) ? picked.size : [picked.size];
    const size = sizes.includes("S") && !sizes.includes("M") ? "Small" : "Medium";

    const speed = typeof picked.speed === "number"
      ? picked.speed
      : Number(picked.speed?.walk || 30);

    const traits = extractRaceTraits(picked.entries);

    return {
      id: slugify(name),
      name,
      size,
      speed,
      creatureType: Array.isArray(picked.creatureTypes) && picked.creatureTypes.length
        ? picked.creatureTypes.map(untag).join(", ")
        : "Humanoid",
      traits,
      abilityScoreIncrease: formatAbilityIncrease(picked.ability),
      languages: parseLanguages(picked.languageProficiencies),
    };
  })
  .filter(Boolean);

const spells = spellsRaw
  .filter(sp => ["PHB", "XPHB"].includes(sp.source))
  .map(sp => {
    const durationInfo = getDurationInfo(sp.duration);
    const material = sp.components?.m
      ? {
          required: true,
          components: typeof sp.components.m === "string"
            ? untag(sp.components.m)
            : untag(sp.components.m.text || "Material component"),
        }
      : false;

    const higher = flattenEntries(sp.entriesHigherLevel, { sep: "\n" });

    return {
      id: slugify(sp.name),
      name: untag(sp.name),
      level: Number(sp.level || 0),
      school: schoolFromCode(sp.school),
      castingTime: Array.isArray(sp.time) && sp.time.length
        ? sp.time.map(formatTimePart).join(" or ")
        : "1 action",
      range: formatRange(sp.range),
      components: {
        verbal: Boolean(sp.components?.v),
        somatic: Boolean(sp.components?.s),
        material,
      },
      duration: durationInfo.text,
      concentration: durationInfo.concentration,
      ritual: Boolean(sp.meta?.ritual),
      description: flattenEntries(sp.entries, { sep: "\n\n" }),
      higherLevels: higher || undefined,
      classes: getSpellClasses(sp.name, spellLookup),
    };
  })
  .sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name));

const propertyNameMap = getPropertyNameMap(itemsBaseRaw.itemProperty || []);

const weapons = (itemsBaseRaw.baseitem || [])
  .filter(it => it.source === "PHB" && it.weapon)
  .map(it => {
    const properties = (it.property || []).map(raw => {
      const abbr = String(raw).split("|")[0];
      const baseName = propertyNameMap[abbr] || abbr;
      if (abbr === "T" && it.range) return `${baseName} (${it.range})`;
      if (abbr === "V" && it.dmg2) return `${baseName} (${it.dmg2})`;
      return baseName;
    });

    const rangeBits = typeof it.range === "string"
      ? it.range.split("/").map(n => Number(n.trim()))
      : [];

    return {
      id: slugify(it.name),
      name: it.name,
      type: "weapon",
      category: it.weaponCategory === "martial" ? "martial" : "simple",
      weaponType: it.type === "R" ? "ranged" : "melee",
      damage: {
        dice: it.dmg1 || "",
        type: mapDamageType(it.dmgType),
      },
      properties,
      range: rangeBits.length >= 1 && Number.isFinite(rangeBits[0])
        ? {
            normal: rangeBits[0],
            long: Number.isFinite(rangeBits[1]) ? rangeBits[1] : undefined,
          }
        : undefined,
      cost: formatCostFromCp(it.value || 0),
      weight: Number(it.weight || 0),
      description: flattenEntries(it.entries, { sep: " " }) || undefined,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const armor = (itemsBaseRaw.baseitem || [])
  .filter(it => it.source === "PHB" && it.armor)
  .map(it => {
    let category = "light";
    if (it.type === "MA") category = "medium";
    if (it.type === "HA") category = "heavy";
    if (it.type === "S") category = "shield";

    let armorClass = String(it.ac || "0");
    if (category === "light") armorClass = `${it.ac} + Dex modifier`;
    if (category === "medium") armorClass = `${it.ac} + Dex modifier (max 2)`;
    if (category === "shield") armorClass = `+${it.ac}`;

    const strReq = it.strength != null ? Number(String(it.strength).replace(/[^0-9]/g, "")) : undefined;

    return {
      id: slugify(it.name),
      name: it.name,
      type: "armor",
      category,
      armorClass,
      stealthDisadvantage: Boolean(it.stealth) || undefined,
      strengthRequirement: Number.isFinite(strReq) && strReq > 0 ? strReq : undefined,
      cost: formatCostFromCp(it.value || 0),
      weight: Number(it.weight || 0),
      description: flattenEntries(it.entries, { sep: " " }) || undefined,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const gearCategoryMap = {
  G: "adventuring",
  A: "ammunition",
  AT: "artisanTool",
  INS: "instrument",
  GS: "gamingSet",
  T: "tool",
  SCF: "spellcastingFocus",
  FD: "foodDrink",
  TAH: "tackHarness",
  MNT: "mount",
  VEH: "vehicle",
  TG: "tradeGood",
  "$C": "coin",
};

const adventuringGear = itemsRaw
  .filter(it => it.source === "PHB" && (it.rarity || "none") === "none")
  .map(it => {
    let description = flattenEntries(it.entries, { sep: " " });

    if (!description && Array.isArray(it.packContents) && it.packContents.length) {
      const list = it.packContents
        .map(pc => {
          const itemName = String(pc.item || "").split("|")[0];
          return `${pc.quantity || 1} x ${untag(itemName)}`;
        })
        .join(", ");
      description = `Contains: ${list}.`;
    }

    return {
      id: slugify(`${it.name}-${it.type || "gear"}`),
      name: it.name,
      type: "adventuringGear",
      category: gearCategoryMap[it.type] || "misc",
      cost: formatCostFromCp(it.value || 0),
      weight: Number(it.weight || 0),
      description: description || undefined,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const racesFile = `import { Race } from "./types";

/**
 * D&D 5e Races (core set used by this app).
 *
 * Generated from local 5etools JSON export.
 */

export const races: Race[] = ${JSON.stringify(races, null, 2)};

export function getRaceById(id: string): Race | undefined {
  return races.find(race => race.id === id);
}

export function getAllRaces(): Race[] {
  return races;
}
`;

const spellsFile = `import { Spell } from "./types";

/**
 * D&D 5e Spells.
 *
 * Generated from local 5etools JSON export (PHB source list).
 */

export const spells: Spell[] = ${JSON.stringify(spells, null, 2)};

export function getSpellById(id: string): Spell | undefined {
  return spells.find(spell => spell.id === id);
}

export function getSpellsByLevel(level: number): Spell[] {
  return spells.filter(spell => spell.level === level);
}

export function getSpellsByClass(className: string): Spell[] {
  return spells.filter(spell =>
    spell.classes.some(c => c.toLowerCase() === className.toLowerCase())
  );
}

export function getAllSpells(): Spell[] {
  return spells;
}

export function searchSpells(query: string): Spell[] {
  const lowerQuery = query.toLowerCase();
  return spells.filter(spell =>
    spell.name.toLowerCase().includes(lowerQuery) ||
    spell.description.toLowerCase().includes(lowerQuery)
  );
}
`;

const equipmentFile = `import { Weapon, Armor, AdventuringGear } from "./types";

/**
 * D&D 5e Equipment.
 *
 * Generated from local 5etools JSON export (PHB source list).
 */

export const weapons: Weapon[] = ${JSON.stringify(weapons, null, 2)};

export const armor: Armor[] = ${JSON.stringify(armor, null, 2)};

export const adventuringGear: AdventuringGear[] = ${JSON.stringify(adventuringGear, null, 2)};

export function getWeaponById(id: string): Weapon | undefined {
  return weapons.find(w => w.id === id);
}

export function getArmorById(id: string): Armor | undefined {
  return armor.find(a => a.id === id);
}

export function getGearById(id: string): AdventuringGear | undefined {
  return adventuringGear.find(g => g.id === id);
}

export function getAllWeapons(): Weapon[] {
  return weapons;
}

export function getAllArmor(): Armor[] {
  return armor;
}

export function getAllAdventuringGear(): AdventuringGear[] {
  return adventuringGear;
}
`;

writeTsFile(outFiles.races, racesFile);
writeTsFile(outFiles.spells, spellsFile);
writeTsFile(outFiles.equipment, equipmentFile);

console.log(`Wrote races: ${races.length}`);
console.log(`Wrote spells: ${spells.length}`);
console.log(`Wrote weapons: ${weapons.length}`);
console.log(`Wrote armor: ${armor.length}`);
console.log(`Wrote gear: ${adventuringGear.length}`);
