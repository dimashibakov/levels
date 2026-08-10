import { describe, it, expect } from "vitest";
import { scoreCheck } from "./scoring";

const noSafety = { s1: 0, s2: 0, s3: 0 } as const;

describe("scoreCheck", () => {
  it("all zero → in_level", () => {
    expect(scoreCheck({ phq: { c1: 0, c2: 0 }, safety: { ...noSafety } }).tier).toBe("in_level");
  });

  it("phqSum 4 → off_level", () => {
    expect(scoreCheck({ phq: { c1: 2, c2: 2 }, safety: { ...noSafety } }).tier).toBe("off_level");
  });

  it("phqSum 8 → edge", () => {
    expect(scoreCheck({ phq: { c1: 3, c2: 3, d1: 2 }, safety: { ...noSafety } }).tier).toBe("edge");
  });

  it("any safety flag → edge regardless of low phq", () => {
    const r = scoreCheck({ phq: { c1: 0, c2: 0 }, safety: { s1: 1, s2: 0, s3: 0 } });
    expect(r.tier).toBe("edge");
    expect(r.safetyFlag).toBe(true);
  });

  it("active ideation (s2) → edge", () => {
    expect(scoreCheck({ phq: { c1: 1 }, safety: { s1: 0, s2: 1, s3: 0 } }).tier).toBe("edge");
  });
});
