import { describe, expect, it } from "vitest";
import {
  applyAbilityBonuses,
  buildRaceAbilityBonuses,
  hasRequiredRaceAbilityChoices,
  parseAbilityScoreIncrease,
} from "./characterCreationRules";

describe("characterCreationRules", () => {
  it("parses fixed race ability score increases", () => {
    const parsed = parseAbilityScoreIncrease("Strength +2, Charisma +1");
    expect(parsed.fixedBonuses.strength).toBe(2);
    expect(parsed.fixedBonuses.charisma).toBe(1);
    expect(parsed.choiceBonuses).toEqual([]);
  });

  it("parses and applies choice-based ability increases", () => {
    const text = "Choose +2 to one ability and +1 to another";
    expect(hasRequiredRaceAbilityChoices(text, ["strength"])).toBe(false);
    expect(hasRequiredRaceAbilityChoices(text, ["strength", "strength"])).toBe(false);
    expect(hasRequiredRaceAbilityChoices(text, ["strength", "wisdom"])).toBe(true);

    const bonuses = buildRaceAbilityBonuses(text, ["strength", "wisdom"]);
    expect(bonuses).toMatchObject({ strength: 2, wisdom: 1 });
  });

  it("applies bonuses and caps resulting abilities at 20", () => {
    const scores = applyAbilityBonuses(
      {
        strength: 19,
        dexterity: 14,
        constitution: 12,
        intelligence: 10,
        wisdom: 8,
        charisma: 18,
      },
      { strength: 2, charisma: 4 }
    );
    expect(scores.strength).toBe(20);
    expect(scores.charisma).toBe(20);
  });
});

