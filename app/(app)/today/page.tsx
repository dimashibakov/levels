import Link from "next/link";
import { LevelVial } from "@/components/LevelVial";
import { TIER_META, type Tier } from "@/lib/scoring";
import { createAdminClient, getAlphaUserId, hasServiceRole } from "@/lib/supabase/admin";

const TIER_HINT: Record<Tier, string> = {
  in_level: "Steady read. Sleep and a short walk are holding you level.",
  off_level: "Something's pulling you off level. Worth a closer look.",
  edge: "You're carrying a lot. What you marked matters — use what helps.",
};

async function getLatestTier(): Promise<Tier | null> {
  if (!hasServiceRole()) return null;

  try {
    const admin = createAdminClient();
    const { userId } = await getAlphaUserId(admin);
    if (!userId) return null;

    const { data, error } = await admin
      .from("check_sessions")
      .select("tier")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data?.tier) return null;
    return data.tier as Tier;
  } catch {
    return null;
  }
}

export default async function Today() {
  const latestTier = await getLatestTier();
  const hasCheck = latestTier !== null;
  const displayTier: Tier = latestTier ?? "in_level";
  const meta = TIER_META[displayTier];

  return (
    <div>
      <h1 className="mb-2 mt-1 text-3xl font-extrabold tracking-tight">LEVELS</h1>

      <div className="mb-4 rounded-card bg-card p-5 shadow-sm">
        <div className="text-sm font-semibold text-mute">Your level</div>
        <div className="mb-1 text-3xl font-extrabold" style={{ color: meta.color }}>
          {hasCheck ? meta.en : "—"}
        </div>
        <div className="my-4">
          <LevelVial tier={displayTier} />
        </div>
        <p className="text-[15px] leading-snug text-ink2">
          {hasCheck ? TIER_HINT[displayTier] : "Take your first check to see where you're holding."}
        </p>
      </div>

      <Link
        href="/check"
        className="flex items-center justify-between rounded-2xl bg-brand px-5 py-4 text-white"
      >
        <div>
          <div className="text-base font-bold">
            {hasCheck ? "Run today's check" : "Take your first check"}
          </div>
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
