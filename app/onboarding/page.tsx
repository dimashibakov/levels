"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { tag: "Welcome", h: "A straight read on how you're holding.", p: "Not a test that judges you — a tool that shows your level.", cta: "Get started" },
  { tag: "Your privacy", h: "No one gets called.", p: "Your answers are yours. No boss, no insurer, no family sees your result — ever.", cta: "Good. Continue" },
  { tag: "Passive read", h: "Let your watch do the quiet work.", p: "Connect your watch and LEVELS reads sleep, HRV and movement in the background.", cta: "Continue" },
  { tag: "On your terms", h: "One nudge, when it suits you.", p: "Pick a light check-in time, and set your local crisis line.", cta: "Finish setup" },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const router = useRouter();
  const s = STEPS[i];
  return (
    <div className="flex min-h-screen flex-col px-7 pb-8 pt-16">
      <div className="flex-1 flex-col justify-center">
        <div className="mb-2.5 text-xs font-bold uppercase tracking-widest text-brand">{s.tag}</div>
        <h1 className="mb-3.5 text-3xl font-extrabold leading-tight">{s.h}</h1>
        <p className="text-base leading-relaxed text-ink2">{s.p}</p>
      </div>
      <div>
        <div className="mb-4 flex justify-center gap-1.5">
          {STEPS.map((_, k) => (
            <span key={k} className={`h-1.5 rounded-full ${k === i ? "w-6 bg-brand" : "w-1.5 bg-[#D5D2EC]"}`} />
          ))}
        </div>
        <button
          onClick={() => (i < STEPS.length - 1 ? setI(i + 1) : router.push("/today"))}
          className="w-full rounded-2xl bg-brand py-4 font-bold text-white"
        >
          {s.cta}
        </button>
      </div>
    </div>
  );
}
