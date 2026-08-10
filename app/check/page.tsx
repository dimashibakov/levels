"use client";

import { useState } from "react";
import Link from "next/link";
import { LevelVial } from "@/components/LevelVial";
import { TIER_META, type Tier, type CheckAnswers } from "@/lib/scoring";
import { submitCheck } from "./actions";

const PHQ = [
  ["c1", "Over the last couple weeks — how often has stuff you care about felt not worth the effort?"],
  ["c2", "…and how often did it feel flat, low, or done?"],
  ["d4", "Shorter fuse than usual — snapping at people who didn't earn it?"],
  ["d5", "Drinking more, or leaning on something to take the edge off?"],
] as const;

const SAFE = [
  ["s1", "In the last month, wished you could go to sleep and not wake up?"],
  ["s2", "Had actual thoughts of ending your life?"],
] as const;

const OPTS = ["Rarely", "Some days", "Most days", "Nearly every day"];

export default function Check() {
  const [phq, setPhq] = useState<Record<string, number>>({});
  const [safety, setSafety] = useState<Record<string, 0 | 1>>({});
  const [result, setResult] = useState<Tier | null>(null);

  async function finish() {
    const answers: CheckAnswers = { phq, safety };
    const r = await submitCheck(answers);
    setResult(r.tier);
  }

  if (result) {
    const m = TIER_META[result];
    return (
      <div className="px-[22px] py-6">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-brand">Your read</div>
        <div className="my-4"><LevelVial tier={result} /></div>
        <div className="text-2xl font-extrabold" style={{ color: m.color }}>{m.en}</div>
        <p className="mt-2 text-[15px] text-ink2">
          A snapshot of the last couple of weeks, not a verdict. The level moves.
        </p>
        {result === "edge" && (
          <div className="mt-4 rounded-card border border-line bg-card p-4">
            <div className="text-3xl font-extrabold text-brand">988</div>
            <p className="mt-1.5 text-[13px] text-ink2">
              A trained counselor — not the police. Reach out before the peak.
            </p>
          </div>
        )}
        <Link href="/today" className="mt-6 block rounded-2xl bg-brand py-4 text-center font-bold text-white">
          Done
        </Link>
      </div>
    );
  }

  return (
    <div className="px-[22px] py-6">
      <div className="mb-4 text-xs font-bold uppercase tracking-widest text-brand">Daily check</div>

      {PHQ.map(([id, q]) => (
        <div key={id} className="mb-5">
          <div className="mb-2 text-[16px] font-semibold">{q}</div>
          <div className="grid grid-cols-2 gap-2">
            {OPTS.map((o, v) => (
              <button
                key={o}
                onClick={() => setPhq({ ...phq, [id]: v })}
                className={`rounded-xl border p-3 text-left text-[13px] ${phq[id] === v ? "border-brand bg-brandsoft font-semibold" : "border-line bg-card text-ink2"}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}

      {SAFE.map(([id, q]) => (
        <div key={id} className="mb-5">
          <div className="mb-2 text-[16px] font-semibold">{q}</div>
          <div className="grid grid-cols-2 gap-2">
            {[["No", 0], ["Yes", 1]].map(([label, v]) => (
              <button
                key={label as string}
                onClick={() => setSafety({ ...safety, [id]: v as 0 | 1 })}
                className={`rounded-xl border p-3 text-left text-[13px] ${safety[id] === v ? "border-edge bg-edgesoft font-semibold" : "border-line bg-card text-ink2"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={finish} className="mt-2 w-full rounded-2xl bg-brand py-4 font-bold text-white">
        Show my level
      </button>
    </div>
  );
}
