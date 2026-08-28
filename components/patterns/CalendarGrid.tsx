"use client";

import type { Tier } from "@/lib/scoring";

export type CheckSessionRow = {
  id: string;
  tier: Tier;
  started_at: string;
  completed_at: string | null;
};

const TIER_COLOR: Record<Tier, string> = {
  in_level: "#7CB342",
  off_level: "#E0A32E",
  edge: "#E5533B",
};

// Severity rank for bucket merge: edge (worst) > off_level > in_level (best).
const TIER_RANK: Record<Tier, number> = {
  in_level: 0,
  off_level: 1,
  edge: 2,
};

const BUCKETS = [0, 4, 8, 12, 16, 20] as const;

function tierRank(tier: Tier): number {
  return TIER_RANK[tier] ?? -1;
}

/** Keep the more severe tier when multiple checks share a day+bucket. */
function worstTier(current: Tier | null, incoming: Tier): Tier {
  if (current === null) return incoming;
  return tierRank(incoming) > tierRank(current) ? incoming : current;
}

function localDateKey(d: Date): string {
  // Local calendar date — never use UTC getters here.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfLocalDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0); // local midnight
  return copy;
}

function last7LocalDays(): Date[] {
  const today = startOfLocalDay(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i)); // local date arithmetic
    return d;
  });
}

/** Map local hour (0–23) to bucket column 0–5. */
function localBucketIndex(hourLocal: number): number {
  if (hourLocal < 4) return 0;
  if (hourLocal < 8) return 1;
  if (hourLocal < 12) return 2;
  if (hourLocal < 16) return 3;
  if (hourLocal < 20) return 4;
  return 5;
}

function sessionLocalDate(s: CheckSessionRow): Date {
  const iso = s.completed_at ?? s.started_at;
  return new Date(iso); // parsed instant; getters below use local timezone
}

function computeStreak(sessions: CheckSessionRow[]): number {
  const daysWithChecks = new Set<string>();
  for (const s of sessions) {
    daysWithChecks.add(localDateKey(sessionLocalDate(s)));
  }

  const today = startOfLocalDay(new Date());
  let streak = 0;
  for (let offset = 0; offset < 365; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    if (daysWithChecks.has(localDateKey(d))) streak++;
    else break;
  }
  return streak;
}

function buildGrid(sessions: CheckSessionRow[]) {
  const days = last7LocalDays();
  const grid: (Tier | null)[][] = days.map(() =>
    Array.from({ length: BUCKETS.length }, (): Tier | null => null),
  );

  for (const s of sessions) {
    const at = sessionLocalDate(s);
    const dayIdx = days.findIndex((day) => localDateKey(day) === localDateKey(at));
    if (dayIdx === -1) continue;

    const bucket = localBucketIndex(at.getHours()); // local hour, not getUTCHours()
    // Multiple checks in one bucket: show the MOST SEVERE tier (edge > off_level > in_level).
    grid[dayIdx][bucket] = worstTier(grid[dayIdx][bucket], s.tier);
  }

  return { days, grid };
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

type CalendarGridProps = {
  sessions: CheckSessionRow[];
};

export function CalendarGrid({ sessions }: CalendarGridProps) {
  const streak = computeStreak(sessions);
  const { days, grid } = buildGrid(sessions);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-ink2">
        <span className="text-base">🔥</span>
        <span className="font-semibold">
          {streak === 0 ? "No streak yet" : `${streak} day streak`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[280px]">
          <div className="mb-2 grid grid-cols-[36px_repeat(6,1fr)] gap-1">
            <div />
            {BUCKETS.map((h) => (
              <div key={h} className="text-center text-[10px] font-semibold text-mute">
                {String(h).padStart(2, "0")}
              </div>
            ))}
          </div>

          {days.map((day, rowIdx) => (
            <div
              key={localDateKey(day)}
              className="mb-1.5 grid grid-cols-[36px_repeat(6,1fr)] items-center gap-1"
            >
              <div className="text-[11px] font-semibold text-mute">{dayLabel(day)}</div>
              {grid[rowIdx].map((tier, colIdx) => (
                <div key={colIdx} className="flex justify-center py-1">
                  {tier ? (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: TIER_COLOR[tier] }}
                      title={tier}
                    />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-line bg-transparent" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
