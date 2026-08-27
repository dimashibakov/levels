#!/usr/bin/env node
/**
 * Throwaway Supabase service-role key diagnostic.
 * Run: node --env-file=.env.local scripts/diag-key.mjs
 * Never prints full secrets.
 */

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function keyChecks(label, key) {
  console.log(`\n--- ${label} ---`);
  if (!key) {
    console.log("exists: false");
    return null;
  }
  console.log("exists: true");
  console.log("length:", key.length);
  console.log("first4:", key.slice(0, 4));
  console.log("last4:", key.slice(-4));
  console.log("hasWhitespace:", /\s/.test(key));

  if (key.startsWith("eyJ")) {
    const claims = decodeJwtPayload(key);
    if (claims) {
      console.log("JWT claims (non-secret):", {
        role: claims.role ?? null,
        iss: claims.iss ?? null,
        ref: claims.ref ?? null,
      });
    } else {
      console.log("JWT payload: failed to decode");
    }
    return claims;
  }
  console.log("not a JWT (does not start with eyJ)");
  return null;
}

async function main() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("=== LEVELS Supabase key diagnostic ===\n");

  console.log("1. URL");
  console.log("URL =", URL ?? "(missing)");

  console.log("\n2. serviceKey");
  const serviceClaims = keyChecks("serviceKey", serviceKey);

  console.log("\n3. anonKey");
  const anonClaims = keyChecks("anonKey", anonKey);

  if (!URL || !serviceKey) {
    console.log("\nAbort: missing URL or serviceKey");
    return;
  }

  console.log("\n4. RAW REST /auth/v1/admin/users");
  try {
    const res = await fetch(`${URL}/auth/v1/admin/users?page=1&per_page=1`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const body = await res.text();
    console.log("HTTP status:", res.status);
    console.log("response body:", body);
  } catch (err) {
    console.error("RAW REST error:", err instanceof Error ? err.message : err);
  }

  console.log("\n5. supabase-js auth.admin.listUsers");
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(URL, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    console.log({
      hasError: Boolean(error),
      errorMessage: error?.message ?? null,
      userCount: data?.users?.length ?? 0,
    });
  } catch (err) {
    console.error("supabase-js error:", err instanceof Error ? err.message : err);
  }

  console.log("\n=== Summary hints ===");
  if (serviceClaims?.role === "anon") console.log("- service key role is anon → wrong key pasted");
  if (serviceClaims?.ref && serviceClaims.ref !== "tgjdvqshcnzbruugdxkl") {
    console.log(`- service key ref=${serviceClaims.ref} ≠ tgjdvqshcnzbruugdxkl → wrong project`);
  }
  if (anonClaims?.role) console.log(`- anon key role: ${anonClaims.role}`);
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(1);
});
