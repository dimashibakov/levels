"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreCheck, INSTRUMENT_VERSION, type CheckAnswers, type ScoreResult } from "@/lib/scoring";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

const LOG = "[levels:submitCheck]";

async function ensureUser(supabase: SupabaseClient) {
  const { data: auth, error: getUserError } = await supabase.auth.getUser();
  if (getUserError) {
    console.error(LOG, "getUser error:", getUserError.message);
  }

  if (auth?.user) {
    console.error(LOG, "user present", { userId: auth.user.id });
    return auth.user;
  }

  console.error(LOG, "no user — calling signInAnonymously");
  const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
  if (signInError) {
    console.error(LOG, "signInAnonymously error:", signInError.message, signInError);
    return null;
  }

  if (signInData.user) {
    console.error(LOG, "signInAnonymously ok", {
      userId: signInData.user.id,
      hasSession: Boolean(signInData.session),
    });
    return signInData.user;
  }

  const { data: authAgain, error: getUserAgainError } = await supabase.auth.getUser();
  if (getUserAgainError) {
    console.error(LOG, "getUser after signInAnonymously error:", getUserAgainError.message);
  }
  if (authAgain?.user) {
    console.error(LOG, "user present after re-read", { userId: authAgain.user.id });
    return authAgain.user;
  }

  console.error(LOG, "signInAnonymously returned no user");
  return null;
}

// Compute the tier server-side and (if Supabase is wired + a user is signed in)
// persist the session and item-level responses. Safe to call before Supabase
// exists: it just returns the computed result without writing.
export async function submitCheck(answers: CheckAnswers): Promise<ScoreResult> {
  const result = scoreCheck(answers);

  console.error(LOG, "start", {
    hasSupabaseEnv: hasSupabaseEnv(),
    tier: result.tier,
  });

  if (!hasSupabaseEnv()) return result;

  try {
    const supabase = createClient();
    const user = await ensureUser(supabase);
    if (!user) return result;

    const { data: session, error: sessionError } = await supabase
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

    if (sessionError) {
      console.error(LOG, "check_sessions insert error:", sessionError.message, sessionError);
      return result;
    }
    if (!session) {
      console.error(LOG, "check_sessions insert returned no row");
      return result;
    }

    console.error(LOG, "check_sessions insert ok", { sessionId: session.id });

    const rows = [
      ...Object.entries(answers.phq).map(([item_code, score]) => ({ item_code, score })),
      ...Object.entries(answers.safety).map(([item_code, score]) => ({ item_code, score })),
    ].map((r) => ({ ...r, session_id: session.id, user_id: user.id }));

    const { error: responsesError } = await supabase.from("check_responses").insert(rows);
    if (responsesError) {
      console.error(LOG, "check_responses insert error:", responsesError.message, responsesError);
    } else {
      console.error(LOG, "check_responses insert ok", { count: rows.length });
    }
  } catch (err) {
    console.error(LOG, "unexpected error:", err);
  }

  return result;
}
