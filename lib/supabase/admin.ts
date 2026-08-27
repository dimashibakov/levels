// Server-only. Never import in a client component. Never expose SUPABASE_SERVICE_ROLE_KEY.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const ALPHA_EMAIL = "alpha@levels.local";

const LOG = "[levels:admin]";

export function hasServiceRole() {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function getAlphaUserId(admin: SupabaseClient): Promise<string | null> {
  try {
    const { data: listData, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      console.error(LOG, "listUsers error:", listError.message);
      return null;
    }

    const existing = listData.users.find((u) => u.email === ALPHA_EMAIL);
    if (existing) return existing.id;

    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email: ALPHA_EMAIL,
      email_confirm: true,
    });
    if (createError) {
      console.error(LOG, "createUser error:", createError.message);
      return null;
    }

    return createData.user?.id ?? null;
  } catch (err) {
    console.error(LOG, "getAlphaUserId unexpected error:", err);
    return null;
  }
}
