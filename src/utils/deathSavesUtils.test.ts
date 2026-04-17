import { describe, it, expect } from "vitest";
import {
  applyDeathSaveRoll,
  initialDeathSaves,
  isStabilized,
  isDead,
  type DeathSaves,
} from "./deathSavesUtils";

//  initialDeathSaves 

describe("initialDeathSaves", () => {
  it("returns zero successes and failures", () => {
    expect(initialDeathSaves()).toEqual({ successes: 0, failures: 0 });
  });
});

//  isStabilized 

describe("isStabilized", () => {
  it("returns false when successes is 0", () => {
    expect(isStabilized({ successes: 0, failures: 0 })).toBe(false);
  });

  it("returns false when successes is 1", () => {
    expect(isStabilized({ successes: 1, failures: 0 })).toBe(false);
  });

  it("returns false when successes is 2", () => {
    expect(isStabilized({ successes: 2, failures: 1 })).toBe(false);
  });

  it("returns true when successes reaches 3", () => {
    expect(isStabilized({ successes: 3, failures: 0 })).toBe(true);
  });
});

//  isDead 

describe("isDead", () => {
  it("returns false when failures is 0", () => {
    expect(isDead({ successes: 0, failures: 0 })).toBe(false);
  });

  it("returns false when failures is 1", () => {
    expect(isDead({ successes: 0, failures: 1 })).toBe(false);
  });

  it("returns false when failures is 2", () => {
    expect(isDead({ successes: 1, failures: 2 })).toBe(false);
  });

  it("returns true when failures reaches 3", () => {
    expect(isDead({ successes: 0, failures: 3 })).toBe(true);
  });
});

//  applyDeathSaveRoll 

const empty: DeathSaves = { successes: 0, failures: 0 };

describe("applyDeathSaveRoll — natural 20", () => {
  it("sets isNatural20 true", () => {
    const result = applyDeathSaveRoll(empty, 20);
    expect(result.isNatural20).toBe(true);
  });

  it("sets isNatural1 false", () => {
    const result = applyDeathSaveRoll(empty, 20);
    expect(result.isNatural1).toBe(false);
  });

  it("returns updatedSaves as null", () => {
    const result = applyDeathSaveRoll(empty, 20);
    expect(result.updatedSaves).toBeNull();
  });

  it("adds no successes or failures", () => {
    const result = applyDeathSaveRoll(empty, 20);
    expect(result.successesAdded).toBe(0);
    expect(result.failuresAdded).toBe(0);
  });
});

describe("applyDeathSaveRoll — natural 1", () => {
  it("sets isNatural1 true", () => {
    const result = applyDeathSaveRoll(empty, 1);
    expect(result.isNatural1).toBe(true);
  });

  it("sets isNatural20 false", () => {
    const result = applyDeathSaveRoll(empty, 1);
    expect(result.isNatural20).toBe(false);
  });

  it("adds 2 failures", () => {
    const result = applyDeathSaveRoll(empty, 1);
    expect(result.failuresAdded).toBe(2);
    expect(result.successesAdded).toBe(0);
  });

  it("applies 2 failures to state", () => {
    const result = applyDeathSaveRoll(empty, 1);
    expect(result.updatedSaves).toEqual({ successes: 0, failures: 2 });
  });

  it("caps failures at 3 even with prior failures", () => {
    const current: DeathSaves = { successes: 0, failures: 2 };
    const result = applyDeathSaveRoll(current, 1);
    expect(result.updatedSaves?.failures).toBe(3);
  });
});

describe("applyDeathSaveRoll — roll 10 or above (success)", () => {
  it("roll of 10 is a success", () => {
    const result = applyDeathSaveRoll(empty, 10);
    expect(result.successesAdded).toBe(1);
    expect(result.failuresAdded).toBe(0);
    expect(result.updatedSaves).toEqual({ successes: 1, failures: 0 });
  });

  it("roll of 15 is a success", () => {
    const result = applyDeathSaveRoll(empty, 15);
    expect(result.successesAdded).toBe(1);
    expect(result.failuresAdded).toBe(0);
  });

  it("roll of 19 is a success", () => {
    const result = applyDeathSaveRoll(empty, 19);
    expect(result.successesAdded).toBe(1);
    expect(result.failuresAdded).toBe(0);
  });

  it("caps successes at 3", () => {
    const current: DeathSaves = { successes: 2, failures: 0 };
    const result = applyDeathSaveRoll(current, 15);
    expect(result.updatedSaves?.successes).toBe(3);
  });

  it("reaching 3 successes means stabilized", () => {
    const current: DeathSaves = { successes: 2, failures: 1 };
    const result = applyDeathSaveRoll(current, 12);
    expect(isStabilized(result.updatedSaves!)).toBe(true);
  });
});

describe("applyDeathSaveRoll — roll 2–9 (failure)", () => {
  it("roll of 9 is a failure", () => {
    const result = applyDeathSaveRoll(empty, 9);
    expect(result.failuresAdded).toBe(1);
    expect(result.successesAdded).toBe(0);
    expect(result.updatedSaves).toEqual({ successes: 0, failures: 1 });
  });

  it("roll of 2 is a failure", () => {
    const result = applyDeathSaveRoll(empty, 2);
    expect(result.failuresAdded).toBe(1);
    expect(result.successesAdded).toBe(0);
  });

  it("roll of 5 is a failure", () => {
    const result = applyDeathSaveRoll(empty, 5);
    expect(result.failuresAdded).toBe(1);
    expect(result.successesAdded).toBe(0);
  });

  it("caps failures at 3", () => {
    const current: DeathSaves = { successes: 0, failures: 2 };
    const result = applyDeathSaveRoll(current, 5);
    expect(result.updatedSaves?.failures).toBe(3);
  });

  it("reaching 3 failures means dead", () => {
    const current: DeathSaves = { successes: 1, failures: 2 };
    const result = applyDeathSaveRoll(current, 4);
    expect(isDead(result.updatedSaves!)).toBe(true);
  });
});

describe("applyDeathSaveRoll — mixed state", () => {
  it("existing successes and failures are preserved when adding a success", () => {
    const current: DeathSaves = { successes: 1, failures: 1 };
    const result = applyDeathSaveRoll(current, 14);
    expect(result.updatedSaves).toEqual({ successes: 2, failures: 1 });
  });

  it("existing successes and failures are preserved when adding a failure", () => {
    const current: DeathSaves = { successes: 1, failures: 1 };
    const result = applyDeathSaveRoll(current, 8);
    expect(result.updatedSaves).toEqual({ successes: 1, failures: 2 });
  });
});
