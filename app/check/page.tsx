"use client";

import { useState } from "react";
import type { CheckAnswers, Tier } from "@/lib/scoring";
import { submitCheck } from "./actions";
import { CheckProgress } from "./CheckProgress";
import { CheckNav } from "./CheckNav";
import { QuestionStep } from "./QuestionStep";
import { ReassuranceStep } from "./ReassuranceStep";
import { ResultStep, ResponseStep } from "./ResultStep";
import { FLOW_STEPS, isSafetyItem, progressSegments, type FlowStep } from "./steps";

import { STRINGS } from "./strings";

export default function CheckPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [phq, setPhq] = useState<Record<string, number>>({});
  const [safety, setSafety] = useState<Record<string, 0 | 1>>({});
  const [tier, setTier] = useState<Tier | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const step: FlowStep = FLOW_STEPS[stepIndex];

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function goNext() {
    if (step.kind === "question" && step.code === "s3") {
      setSubmitting(true);
      try {
        const answers: CheckAnswers = { phq, safety };
        const result = await submitCheck(answers);
        setTier(result.tier);
        setStepIndex((i) => i + 1);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function canAdvance(): boolean {
    if (step.kind === "reassurance") return true;
    if (step.kind === "question") {
      if (isSafetyItem(step.code)) return safety[step.code] !== undefined;
      return phq[step.code] !== undefined;
    }
    return true;
  }

  if (step.kind === "result" && tier) {
    return (
      <div className="px-[22px] py-6">
        <ResultStep tier={tier} onContinue={() => setStepIndex((i) => i + 1)} />
      </div>
    );
  }

  if (step.kind === "response" && tier) {
    return (
      <div className="px-[22px] py-6">
        <ResponseStep tier={tier} />
      </div>
    );
  }

  const stageLabel =
    step.kind === "result" || step.kind === "response" ? null : STRINGS.stages[step.stage];

  return (
    <div className="px-[22px] py-6">
      <CheckProgress segments={progressSegments(step)} />

      {stageLabel && (
        <div className="mb-4 text-xs font-bold uppercase tracking-widest text-brand">{stageLabel}</div>
      )}

      {step.kind === "reassurance" && <ReassuranceStep />}

      {step.kind === "question" && (
        <QuestionStep
          code={step.code}
          phq={phq}
          safety={safety}
          onPhq={(code, value) => setPhq((prev) => ({ ...prev, [code]: value }))}
          onSafety={(code, value) => setSafety((prev) => ({ ...prev, [code]: value as 0 | 1 }))}
        />
      )}

      <CheckNav
        onBack={goBack}
        onNext={goNext}
        nextDisabled={!canAdvance()}
        nextLoading={submitting}
        showBack={stepIndex > 0}
      />
    </div>
  );
}
