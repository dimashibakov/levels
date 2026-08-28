import Link from "next/link";
import { LevelVial } from "@/components/LevelVial";
import { FootprintsIcon, HeartPulseIcon, MoonIcon } from "@/components/icons/LineIcons";
import { TIER_META, type Tier } from "@/lib/scoring";
import { createAdminClient, getAlphaUserId, hasServiceRole } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TIER_HINT: Record<Tier, string> = {
  in_level: "Steady read. Sleep and a short walk are holding you level.",
  off_level: "Something's pulling you off level. Worth a closer look.",
  edge: "You're carrying a lot. What you marked matters — use what helps.",
};

const HERO_TINT: Record<Tier, { background: string; shadow: string }> = {
  in_level: {
    background: "linear-gradient(180deg, rgba(124,179,66,0.12) 0%, #FFFFFF 72%)",
    shadow: "0 10px 32px rgba(124,179,66,0.14), 0 2px 8px rgba(30,40,80,0.06)",
  },
  off_level: {
    background: "linear-gradient(180deg, rgba(224,163,46,0.12) 0%, #FFFFFF 72%)",
    shadow: "0 10px 32px rgba(224,163,46,0.14), 0 2px 8px rgba(30,40,80,0.06)",
  },
  edge: {
    background: "linear-gradient(180deg, rgba(229,83,59,0.12) 0%, #FFFFFF 72%)",
    shadow: "0 10px 32px rgba(229,83,59,0.14), 0 2px 8px rgba(30,40,80,0.06)",
  },
};

const SIGNALS = [
  { Icon: MoonIcon, key: "Sleep", value: "Good · 6h 6min" },
  { Icon: HeartPulseIcon, key: "HRV baseline", value: "Steady · +3.5%" },
  { Icon: FootprintsIcon, key: "Movement", value: "5,537 steps" },
] as const;

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
  const heroTint = HERO_TINT[displayTier];

  return (
    <div>
      <h1 className="mb-2 mt-1 font-display text-3xl font-bold tracking-tight">LEVELS</h1>

      <div
        className="hero-card mb-4 rounded-card border border-white/80 p-5"
        style={{ background: heroTint.background, boxShadow: heroTint.shadow }}
      >
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-mute">
          Your level
        </div>
        <div className="mb-1 font-display text-3xl font-bold" style={{ color: meta.color }}>
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
        className="flex items-center justify-between rounded-2xl bg-brand px-5 py-4 text-white shadow-md"
      >
        <div>
          <div className="text-base font-semibold">
            {hasCheck ? "Run today's check" : "Take your first check"}
          </div>
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] opacity-85">
            2 min · private · no one gets called
          </div>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">→</span>
      </Link>

      <h2 className="mb-3 mt-6 font-display text-xl font-bold">Signals</h2>
      {SIGNALS.map(({ Icon, key, value }) => (
        <div
          key={key}
          className="mb-3 flex items-center gap-4 rounded-card border border-line bg-card p-4 shadow-[0_1px_3px_rgba(30,40,80,0.05)]"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-brand/20 bg-brandsoft text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[15px] font-semibold">{value}</div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-mute">{key}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
