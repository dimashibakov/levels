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

// edge > off_level > in_level
const TIER_SEVERITY: Record<Tier, number> = {
  in_level: 0,
  off_level: 1,
  edge: 2,
};

const BUCKET_STARTS = [0, 4, 8, 12, 16, 20];

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function last7Days(): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

function bucketIndex(hour: number): number {
  if (hour < 4) return 0;
  if (hour < 8) return 1;
  if (hour < 12) return 2;
  if (hour < 16) return 3;
  if (hour < 20) return 4;
  return 5;
}

function sessionTimestamp(s: CheckSessionRow): Date {
  return new Date(s.completed_at ?? s.started_at);
}

function computeStreak(sessions: CheckSessionRow[]): number {
  const daysWithChecks = new Set<string>();
  for (const s of sessions) {
    daysWithChecks.add(localDateKey(sessionTimestamp(s)));
  }

  const today = startOfDay(new Date());
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
  const days = last7Days();
  const grid: (Tier | null)[][] = days.map(() => Array(BUCKET_STARTS.length).fill(null));

  for (const s of sessions) {
    const at = sessionTimestamp(s);
    const dayIdx = days.findIndex((day) => localDateKey(day) === localDateKey(at));
    if (dayIdx === -1) continue;

    const b = bucketIndex(at.getHours());
    const prev = grid[dayIdx][b];
    // Multiple checks in one bucket: show the MOST SEVERE tier (edge > off_level > in_level).
    if (!prev || TIER_SEVERITY[s.tier] > TIER_SEVERITY[prev]) {
      grid[dayIdx][b] = s.tier;
    }
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
          {/* hour labels */}
          <div className="mb-2 grid grid-cols-[36px_repeat(6,1fr)] gap-1">
            <div />
            {BUCKET_STARTS.map((h) => (
              <div key={h} className="text-center text-[10px] font-semibold text-mute">
                {String(h).padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* day rows — oldest at top, today at bottom */}
          {days.map((day, rowIdx) => (
            <div key={localDateKey(day)} className="mb-1.5 grid grid-cols-[36px_repeat(6,1fr)] items-center gap-1">
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
