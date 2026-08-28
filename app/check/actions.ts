"use server";

import { scoreCheck, INSTRUMENT_VERSION, type CheckAnswers, type ScoreResult } from "@/lib/scoring";
import { createAdminClient, getAlphaUserId, hasServiceRole } from "@/lib/supabase/admin";

// Compute the tier server-side and (if Supabase service role is wired)
// persist the session and item-level responses under the alpha user.
// Safe to call without service role: it just returns the computed result without writing.
export async function submitCheck(answers: CheckAnswers): Promise<ScoreResult> {
  const result = scoreCheck(answers);

  if (!hasServiceRole()) return result;

  try {
    const admin = createAdminClient();
    const { userId } = await getAlphaUserId(admin);
    if (!userId) return result;

    const { data: session, error: sessionError } = await admin
      .from("check_sessions")
      .insert({
        user_id: userId,
        instrument_version: INSTRUMENT_VERSION,
        phq_sum: result.phqSum,
        safety_flag: result.safetyFlag,
        tier: result.tier,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("[submitCheck] check_sessions insert failed:", sessionError?.message ?? "no row");
      return result;
    }

    const rows = [
      ...Object.entries(answers.phq).map(([item_code, score]) => ({ item_code, score })),
      ...Object.entries(answers.safety).map(([item_code, score]) => ({ item_code, score })),
    ].map((r) => ({ ...r, session_id: session.id, user_id: userId }));

    const { error: responsesError } = await admin.from("check_responses").insert(rows);
    if (responsesError) {
      console.error("[submitCheck] check_responses insert failed:", responsesError.message);
    }
  } catch {
    // best-effort persistence — never block the result
  }

  return result;
}
