import { createAdminClient, getAlphaUserId, hasServiceRole } from "@/lib/supabase/admin";
import type { Tier } from "@/lib/scoring";
import { Analytics } from "@/components/patterns/Analytics";
import { CalendarGrid, type CheckSessionRow } from "@/components/patterns/CalendarGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getCheckSessions(): Promise<CheckSessionRow[]> {
  if (!hasServiceRole()) return [];

  try {
    const admin = createAdminClient();
    const { userId } = await getAlphaUserId(admin);
    if (!userId) return [];

    const { data, error } = await admin
      .from("check_sessions")
      .select("id, tier, started_at, completed_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: true });

    if (error || !data) return [];

    return data
      .filter((row): row is typeof row & { tier: Tier } => Boolean(row.tier))
      .map((row) => ({
        id: row.id,
        tier: row.tier as Tier,
        started_at: row.started_at,
        completed_at: row.completed_at,
      }));
  } catch {
    return [];
  }
}

function EmptyHistory() {
  return <p className="py-6 text-center text-[15px] text-ink2">No checks yet — your history will appear here.</p>;
}

export default async function Patterns() {
  const sessions = await getCheckSessions();

  return (
    <div>
      <h1 className="mb-3 mt-1 text-2xl font-extrabold">Patterns</h1>

      <div className="rounded-card bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand">Check history</h2>
        {sessions.length === 0 ? <EmptyHistory /> : <CalendarGrid sessions={sessions} />}
      </div>

      {sessions.length > 0 && (
        <div className="mt-4 rounded-card bg-card p-5 shadow-sm">
          <Analytics sessions={sessions} />
        </div>
      )}
    </div>
  );
}
