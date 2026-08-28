// Server-only. Never import in a client component. Never expose SUPABASE_SERVICE_ROLE_KEY.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const ALPHA_EMAIL = "alpha@levels.app";

export type AlphaUserResult = { userId: string | null; error: string | null };

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

export async function getAlphaUserId(admin: SupabaseClient): Promise<AlphaUserResult> {
  try {
    const { data: listData, error: listError } = await admin.auth.admin.listUsers();
    if (!listError) {
      const existing = listData.users.find((u) => u.email === ALPHA_EMAIL);
      if (existing) return { userId: existing.id, error: null };
    }

    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email: ALPHA_EMAIL,
      email_confirm: true,
    });
    if (createError) {
      return { userId: null, error: createError.message };
    }

    const userId = createData.user?.id ?? null;
    if (!userId) {
      return { userId: null, error: "createUser succeeded but no user id returned" };
    }

    return { userId, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { userId: null, error: message };
  }
}
