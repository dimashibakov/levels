import Link from "next/link";
import { LevelVial } from "@/components/LevelVial";

// Alpha: level is static until a check writes it. Wire to the latest
// check_session once Supabase is connected.
export default function Today() {
  const tier = "in_level" as const;
  return (
    <div>
      <h1 className="mb-2 mt-1 text-3xl font-extrabold tracking-tight">LEVELS</h1>

      <div className="mb-4 rounded-card bg-card p-5 shadow-sm">
        <div className="text-sm font-semibold text-mute">Your level</div>
        <div className="mb-1 text-3xl font-extrabold text-good">In level</div>
        <div className="my-4"><LevelVial tier={tier} /></div>
        <p className="text-[15px] leading-snug text-ink2">
          Steady read. Sleep and a short walk are holding you level.
        </p>
      </div>

      <Link
        href="/check"
        className="flex items-center justify-between rounded-2xl bg-brand px-5 py-4 text-white"
      >
        <div>
          <div className="text-base font-bold">Run today&apos;s check</div>
          <div className="text-xs opacity-85">2 min · private · no one gets called</div>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">→</span>
      </Link>

      <h2 className="mb-3 mt-6 text-xl font-extrabold">Signals</h2>
      {[
        ["🌙", "Sleep", "Good · 6h 6min"],
        ["💓", "HRV baseline", "Steady · +3.5%"],
        ["👟", "Movement", "5,537 steps"],
      ].map(([e, k, v]) => (
        <div key={k} className="mb-3 flex items-center gap-4 rounded-card bg-card p-4 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brandsoft text-lg">{e}</div>
          <div>
            <div className="text-[15px] font-extrabold">{v}</div>
            <div className="text-xs text-mute">{k}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
