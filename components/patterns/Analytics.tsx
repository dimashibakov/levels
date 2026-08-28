"use client";

import type { Tier } from "@/lib/scoring";
import type { CheckSessionRow } from "@/components/patterns/CalendarGrid";

const TIER_COLOR: Record<Tier, string> = {
  in_level: "#7CB342",
  off_level: "#E0A32E",
  edge: "#E5533B",
};

const TIER_LABEL: Record<Tier, string> = {
  in_level: "In level",
  off_level: "Off level",
  edge: "On the edge",
};

const HOUR_BUCKETS: { start: number; end: number; label: string }[] = [
  { start: 0, end: 4, label: "12 AM–4 AM" },
  { start: 4, end: 8, label: "4 AM–8 AM" },
  { start: 8, end: 12, label: "8 AM–12 PM" },
  { start: 12, end: 16, label: "12 PM–4 PM" },
  { start: 16, end: 20, label: "4 PM–8 PM" },
  { start: 20, end: 24, label: "8 PM–12 AM" },
];

const TREND_MAX = 14;

function sessionTime(s: CheckSessionRow): number {
  return new Date(s.completed_at ?? s.started_at).getTime();
}

function sessionLocalHour(s: CheckSessionRow): number {
  return new Date(s.completed_at ?? s.started_at).getHours();
}

function hourBucketIndex(hour: number): number {
  if (hour < 4) return 0;
  if (hour < 8) return 1;
  if (hour < 12) return 2;
  if (hour < 16) return 3;
  if (hour < 20) return 4;
  return 5;
}

function tierCounts(sessions: CheckSessionRow[]): Record<Tier, number> {
  const counts: Record<Tier, number> = { in_level: 0, off_level: 0, edge: 0 };
  for (const s of sessions) counts[s.tier]++;
  return counts;
}

function donutGradient(counts: Record<Tier, number>): string {
  const total = counts.in_level + counts.off_level + counts.edge;
  if (total === 0) return "conic-gradient(#ECEAE4 0deg 360deg)";

  const inPct = (counts.in_level / total) * 100;
  const offPct = (counts.off_level / total) * 100;
  const inEnd = inPct;
  const offEnd = inPct + offPct;

  return `conic-gradient(
    ${TIER_COLOR.in_level} 0% ${inEnd}%,
    ${TIER_COLOR.off_level} ${inEnd}% ${offEnd}%,
    ${TIER_COLOR.edge} ${offEnd}% 100%
  )`;
}

function dominantTierCopy(counts: Record<Tier, number>): string | null {
  const total = counts.in_level + counts.off_level + counts.edge;
  if (total === 0) return null;

  const entries = (Object.entries(counts) as [Tier, number][]).sort((a, b) => b[1] - a[1]);
  const [topTier, topCount] = entries[0];
  if (topCount === 0) return null;

  const share = topCount / total;
  if (share >= 0.5) {
    return `Your checks have leaned toward "${TIER_LABEL[topTier].toLowerCase()}" in this window.`;
  }
  return "Your checks have been mixed across levels in this window.";
}

function toughestWindow(sessions: CheckSessionRow[]): string | null {
  const atRisk = sessions.filter((s) => s.tier === "edge" || s.tier === "off_level");
  if (atRisk.length < 2) return null;

  const bucketScores = Array(HOUR_BUCKETS.length).fill(0);
  for (const s of atRisk) {
    bucketScores[hourBucketIndex(sessionLocalHour(s))]++;
  }

  const max = Math.max(...bucketScores);
  if (max === 0) return null;

  const winners = HOUR_BUCKETS.filter((_, i) => bucketScores[i] === max);
  if (winners.length === 0) return null;

  const label = winners.length === 1 ? winners[0].label : winners.map((w) => w.label).join(", ");
  return `Toughest window: ${label}`;
}

type AnalyticsProps = {
  sessions: CheckSessionRow[];
};

export function Analytics({ sessions }: AnalyticsProps) {
  if (sessions.length === 0) return null;

  const enough = sessions.length >= 5;
  const counts = tierCounts(sessions);
  const trend = [...sessions].sort((a, b) => sessionTime(a) - sessionTime(b)).slice(-TREND_MAX);
  const insight = dominantTierCopy(counts);
  const toughest = toughestWindow(sessions);

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-brand">Analytics</h2>

      {!enough && (
        <p className="text-[15px] leading-snug text-ink2">
          Not enough checks yet for patterns — keep checking in.
        </p>
      )}

      {enough && insight && (
        <p className="text-[14px] leading-snug text-ink2">{insight}</p>
      )}

      {/* 1. Levels distribution */}
      <section>
        <h3 className="mb-3 text-[13px] font-bold text-mute">Levels distribution</h3>
        {enough ? (
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 shrink-0">
              <div
                className="h-full w-full rounded-full"
                style={{ background: donutGradient(counts) }}
                aria-hidden
              />
              <div className="absolute inset-[22%] rounded-full bg-card" />
            </div>
            <ul className="space-y-2 text-[14px]">
              {(["in_level", "off_level", "edge"] as Tier[]).map((tier) => (
                <li key={tier} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: TIER_COLOR[tier] }}
                  />
                  <span className="text-ink2">
                    {TIER_LABEL[tier]} · <span className="font-semibold text-ink">{counts[tier]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[13px] text-mute">Distribution appears after a few more checks.</p>
        )}
      </section>

      {/* 2. Trend */}
      <section>
        <h3 className="mb-3 text-[13px] font-bold text-mute">Recent trend</h3>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {trend.map((s) => (
            <div
              key={s.id}
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: TIER_COLOR[s.tier] }}
              title={TIER_LABEL[s.tier]}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-mute">Oldest ← · → most recent</p>
      </section>

      {/* 3. Toughest hours */}
      {toughest && (
        <section>
          <h3 className="mb-2 text-[13px] font-bold text-mute">When it tilts</h3>
          <p className="text-[15px] text-ink2">{toughest}</p>
        </section>
      )}
    </div>
  );
}
