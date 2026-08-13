import Link from "next/link";
import { LevelVial } from "@/components/LevelVial";
import { TIER_META, type Tier } from "@/lib/scoring";
import { STRINGS } from "./strings";
import { CheckNav } from "./CheckNav";

type ResultStepProps = {
  tier: Tier;
  onContinue: () => void;
};

export function ResultStep({ tier, onContinue }: ResultStepProps) {
  const meta = TIER_META[tier];
  return (
    <div>
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-brand">
        {STRINGS.result.heading}
      </div>
      <div className="my-4">
        <LevelVial tier={tier} />
      </div>
      <div className="text-2xl font-extrabold" style={{ color: meta.color }}>
        {meta.en}
      </div>
      <p className="mt-2 text-[15px] leading-snug text-ink2">{STRINGS.result.sentence[tier]}</p>
      <CheckNav onNext={onContinue} nextLabel={STRINGS.nav.continue} showBack={false} />
    </div>
  );
}

type ResponseStepProps = {
  tier: Tier;
};

export function ResponseStep({ tier }: ResponseStepProps) {
  const steps = STRINGS.response[tier];

  return (
    <div>
      <div className="mb-4 text-xs font-bold uppercase tracking-widest text-brand">What helps</div>
      <div className="space-y-3">
        {steps.map((step) =>
          "kind" in step && step.kind === "988" ? (
            <div key={step.title} className="rounded-card border border-edge bg-edgesoft p-5 shadow-sm">
              <div className="text-3xl font-extrabold text-brand">{step.title}</div>
              <p className="mt-2 text-[14px] leading-relaxed text-ink2">{step.body}</p>
            </div>
          ) : (
            <div key={step.title} className="rounded-card border border-line bg-card p-5 shadow-sm">
              <div className="text-[16px] font-extrabold">{step.title}</div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink2">{step.body}</p>
            </div>
          ),
        )}
      </div>
      <Link
        href="/today"
        className="mt-8 block rounded-2xl bg-brand py-4 text-center text-[15px] font-bold text-white"
      >
        {STRINGS.nav.done}
      </Link>
    </div>
  );
}
