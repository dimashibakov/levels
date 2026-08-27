// TEMPORARY DIAGNOSTIC — delete after debugging.

import { NextResponse } from "next/server";
import { createAdminClient, getAlphaUserId, hasServiceRole } from "@/lib/supabase/admin";

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
    out.hasServiceRole = hasServiceRole();

    if (!hasServiceRole()) {
      return json(out);
    }

    const admin = createAdminClient();
    const { userId: alphaUserId, error: alphaError } = await getAlphaUserId(admin);
    out.alphaUserId = alphaUserId;
    out.alphaError = alphaError;

    if (!alphaUserId) {
      out.insertSession = { id: null, error: "no alpha user id", code: null };
      out.insertResponses = { ok: false, error: "skipped — no alpha user" };
      out.counts = await fetchCounts(admin);
      return json(out);
    }

    const { data: session, error: sessionError } = await admin
      .from("check_sessions")
      .insert({
        user_id: alphaUserId,
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
      const { error: responsesError } = await admin.from("check_responses").insert({
        session_id: session.id,
        user_id: alphaUserId,
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

    out.counts = await fetchCounts(admin);
    return json(out);
  } catch (e) {
    out.fatal = e instanceof Error ? e.message : String(e);
    return json(out);
  }
}

async function fetchCounts(admin: ReturnType<typeof createAdminClient>) {
  const [{ count: sessions }, { count: responses }] = await Promise.all([
    admin.from("check_sessions").select("*", { count: "exact", head: true }),
    admin.from("check_responses").select("*", { count: "exact", head: true }),
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
