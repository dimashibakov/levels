"use server";

import { scoreCheck, INSTRUMENT_VERSION, type CheckAnswers, type ScoreResult } from "@/lib/scoring";
import { createAdminClient, getAlphaUserId, hasServiceRole } from "@/lib/supabase/admin";

const LOG = "[levels:submitCheck]";

// Compute the tier server-side and (if Supabase service role is wired)
// persist the session and item-level responses under the alpha user.
// Safe to call without service role: it just returns the computed result without writing.
export async function submitCheck(answers: CheckAnswers): Promise<ScoreResult> {
  const result = scoreCheck(answers);

  if (!hasServiceRole()) return result;

  try {
    const admin = createAdminClient();
    const { userId } = await getAlphaUserId(admin);
    if (!userId) {
      console.error(LOG, "no alpha user id");
      return result;
    }

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

    if (sessionError) {
      console.error(LOG, "check_sessions insert error:", sessionError.message, sessionError.code);
      return result;
    }
    if (!session) {
      console.error(LOG, "check_sessions insert returned no row");
      return result;
    }

    const rows = [
      ...Object.entries(answers.phq).map(([item_code, score]) => ({ item_code, score })),
      ...Object.entries(answers.safety).map(([item_code, score]) => ({ item_code, score })),
    ].map((r) => ({ ...r, session_id: session.id, user_id: userId }));

    const { error: responsesError } = await admin.from("check_responses").insert(rows);
    if (responsesError) {
      console.error(LOG, "check_responses insert error:", responsesError.message, responsesError.code);
    }
  } catch (err) {
    console.error(LOG, "unexpected error:", err);
  }

  return result;
}
