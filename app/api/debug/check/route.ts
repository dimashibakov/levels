// TEMPORARY DIAGNOSTIC — delete after debugging.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function pgError(error: { message?: string; code?: string } | null) {
  return {
    message: error?.message ?? null,
    code: error?.code ?? null,
  };
}

export async function GET() {
  const out: Record<string, unknown> = {};

  try {
    const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    out.env = { hasUrl, hasAnonKey };

    if (!hasUrl || !hasAnonKey) {
      return json(out);
    }

    const supabase = createClient();

    const { data: beforeAuth, error: getUserBeforeError } = await supabase.auth.getUser();
    out.getUserBefore = {
      userId: beforeAuth?.user?.id ?? null,
      error: getUserBeforeError?.message ?? null,
    };

    if (beforeAuth?.user) {
      out.signIn = "skipped";
    } else {
      const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
      out.signIn = {
        userId: signInData.user?.id ?? null,
        error: signInError?.message ?? null,
      };
    }

    const { data: writeAuth } = await supabase.auth.getUser();
    const userAtWrite = writeAuth?.user?.id ?? null;
    out.userAtWrite = userAtWrite;

    if (!userAtWrite) {
      out.insertSession = { id: null, error: "no user at write time", code: null };
      out.insertResponses = { ok: false, error: "skipped — no user" };
      out.counts = await fetchCounts(supabase);
      return json(out);
    }

    const { data: session, error: sessionError } = await supabase
      .from("check_sessions")
      .insert({
        user_id: userAtWrite,
        instrument_version: "debug",
        phq_sum: 0,
        safety_flag: false,
        tier: "in_level",
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    const sessionErr = pgError(sessionError);
    out.insertSession = {
      id: session?.id ?? null,
      error: sessionErr.message,
      code: sessionErr.code,
    };

    if (session?.id) {
      const { error: responsesError } = await supabase.from("check_responses").insert({
        session_id: session.id,
        user_id: userAtWrite,
        item_code: "debug",
        score: 0,
      });
      out.insertResponses = {
        ok: !responsesError,
        error: responsesError?.message ?? null,
      };
    } else {
      out.insertResponses = { ok: false, error: "skipped — session insert failed" };
    }

    out.counts = await fetchCounts(supabase);
    return json(out);
  } catch (e) {
    out.fatal = e instanceof Error ? e.message : String(e);
    return json(out);
  }
}

async function fetchCounts(supabase: ReturnType<typeof createClient>) {
  const [{ count: sessions }, { count: responses }] = await Promise.all([
    supabase.from("check_sessions").select("*", { count: "exact", head: true }),
    supabase.from("check_responses").select("*", { count: "exact", head: true }),
  ]);
  return { sessions: sessions ?? null, responses: responses ?? null };
}

function json(body: Record<string, unknown>) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
