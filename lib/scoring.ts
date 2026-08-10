// LEVELS — stratification logic (pure, testable, versioned).
// The single place the tier is decided. Swap DEMO thresholds for
// clinically validated PHQ-9 / C-SSRS cutoffs here when moving past alpha.

export type Tier = "in_level" | "off_level" | "edge";

export interface CheckAnswers {
  /** PHQ-2 + PHQ-9 items (c1,c2,d1..d6), each 0..3 */
  phq: Record<string, number>;
  /** C-SSRS items (s1,s2,s3), each 0 | 1 */
  safety: Record<string, 0 | 1>;
}

export interface ScoreResult {
  tier: Tier;
  phqSum: number;
  safetyFlag: boolean;
}

// ⚠️ DEMO thresholds — not validated cutoffs.
export const THRESHOLD_EDGE = 8;
export const THRESHOLD_OFF = 4;
export const INSTRUMENT_VERSION = "demo-0.1";

export function scoreCheck(a: CheckAnswers): ScoreResult {
  const phqSum = Object.values(a.phq).reduce((s, v) => s + (v || 0), 0);
  const safetyFlag = Object.values(a.safety).some((v) => v === 1);
  const activeIdeation = a.safety["s2"] === 1;

  let tier: Tier;
  if (safetyFlag || activeIdeation) tier = "edge";
  else if (phqSum >= THRESHOLD_EDGE) tier = "edge";
  else if (phqSum >= THRESHOLD_OFF) tier = "off_level";
  else tier = "in_level";

  return { tier, phqSum, safetyFlag };
}

export const TIER_META: Record<Tier, { en: string; ru: string; color: string; pos: string }> = {
  in_level: { en: "In level", ru: "В уровне", color: "#7CB342", pos: "50%" },
  off_level: { en: "Off level", ru: "Повело", color: "#E0A32E", pos: "74%" },
  edge: { en: "On the edge", ru: "У края", color: "#E5533B", pos: "92%" },
};
