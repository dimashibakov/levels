"use server";

import { scoreCheck, INSTRUMENT_VERSION, type CheckAnswers, type ScoreResult } from "@/lib/scoring";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

// Compute the tier server-side and (if Supabase is wired + a user is signed in)
// persist the session and item-level responses. Safe to call before Supabase
// exists: it just returns the computed result without writing.
export async function submitCheck(answers: CheckAnswers): Promise<ScoreResult> {
  const result = scoreCheck(answers);

  if (!hasSupabaseEnv()) return result;

  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return result;

    const { data: session, error } = await supabase
      .from("check_sessions")
      .insert({
        user_id: user.id,
        instrument_version: INSTRUMENT_VERSION,
        phq_sum: result.phqSum,
        safety_flag: result.safetyFlag,
        tier: result.tier,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !session) return result;

    const rows = [
      ...Object.entries(answers.phq).map(([item_code, score]) => ({ item_code, score })),
      ...Object.entries(answers.safety).map(([item_code, score]) => ({ item_code, score })),
    ].map((r) => ({ ...r, session_id: session.id, user_id: user.id }));

    await supabase.from("check_responses").insert(rows);
  } catch {
    // alpha: never let persistence break the flow that shows help
  }
  return result;
}
