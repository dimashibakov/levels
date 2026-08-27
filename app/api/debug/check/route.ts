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

function decodeJwtClaims(token: string): { role: string | null; ref: string | null } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return {
      role: typeof payload.role === "string" ? payload.role : null,
      ref: typeof payload.ref === "string" ? payload.ref : null,
    };
  } catch {
    return null;
  }
}

function keyFingerprint() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return { exists: false, length: 0, first4: null, last6: null, hasWhitespace: false, format: "other" as const, claims: null };
  }

  const format = key.startsWith("eyJ")
    ? ("jwt" as const)
    : key.startsWith("sb_secret")
      ? ("sb_secret" as const)
      : ("other" as const);

  return {
    exists: true,
    length: key.length,
    first4: key.slice(0, 4),
    last6: key.slice(-6),
    hasWhitespace: /\s/.test(key),
    format,
    claims: format === "jwt" ? decodeJwtClaims(key) : null,
  };
}

async function rawRest() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { status: null, body: "skipped — missing url or service key" };
  }
  try {
    const res = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const text = await res.text();
    return {
      status: res.status,
      body: text.length > 300 ? `${text.slice(0, 300)}…` : text,
    };
  } catch (err) {
    return {
      status: null,
      body: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const out: Record<string, unknown> = {
    keyFingerprint: keyFingerprint(),
    url,
    urlHasWhitespace: url ? /\s/.test(url) : false,
    rawRest: await rawRest(),
  };

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
