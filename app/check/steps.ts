export type FlowStage = "quick" | "deeper" | "safety";

export type FlowStep =
  | { kind: "question"; stage: FlowStage; code: string }
  | { kind: "reassurance"; stage: "safety" }
  | { kind: "result" }
  | { kind: "response" };

export const FLOW_STEPS: FlowStep[] = [
  { kind: "question", stage: "quick", code: "c1" },
  { kind: "question", stage: "quick", code: "c2" },
  { kind: "question", stage: "deeper", code: "d1" },
  { kind: "question", stage: "deeper", code: "d2" },
  { kind: "question", stage: "deeper", code: "d3" },
  { kind: "question", stage: "deeper", code: "d4" },
  { kind: "question", stage: "deeper", code: "d5" },
  { kind: "question", stage: "deeper", code: "d6" },
  { kind: "reassurance", stage: "safety" },
  { kind: "question", stage: "safety", code: "s1" },
  { kind: "question", stage: "safety", code: "s2" },
  { kind: "question", stage: "safety", code: "s3" },
  { kind: "result" },
  { kind: "response" },
];

const STAGE_ITEMS: Record<FlowStage, string[]> = {
  quick: ["c1", "c2"],
  deeper: ["d1", "d2", "d3", "d4", "d5", "d6"],
  safety: ["s1", "s2", "s3"],
};

export function stageProgress(step: FlowStep): { stage: FlowStage; ratio: number } | null {
  if (step.kind === "result" || step.kind === "response") return null;

  const stage = step.stage;
  const items = STAGE_ITEMS[stage];

  if (step.kind === "reassurance") {
    return { stage, ratio: 0 };
  }

  const itemIndex = items.indexOf(step.code);
  return { stage, ratio: (itemIndex + 1) / items.length };
}

export function progressSegments(current: FlowStep): [number, number, number] {
  const stages: FlowStage[] = ["quick", "deeper", "safety"];
  const active = stageProgress(current);
  if (!active) return [1, 1, 1];

  return stages.map((stage) => {
    const stageIdx = stages.indexOf(stage);
    const activeIdx = stages.indexOf(active.stage);
    if (stageIdx < activeIdx) return 1;
    if (stageIdx > activeIdx) return 0;
    return active.ratio;
  }) as [number, number, number];
}

export function isSafetyItem(code: string): boolean {
  return code.startsWith("s");
}
