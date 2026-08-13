import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOG = "[levels:middleware]";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error(LOG, "missing env — skipping session update", {
      hasUrl: Boolean(url),
      hasAnonKey: Boolean(anonKey),
      path: request.nextUrl.pathname,
    });
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: auth, error: getUserError } = await supabase.auth.getUser();
  if (getUserError) {
    console.error(LOG, "getUser error:", getUserError.message, { path: request.nextUrl.pathname });
  }

  const hadUser = Boolean(auth?.user);
  console.error(LOG, "session check", {
    path: request.nextUrl.pathname,
    hadUser,
    userId: auth?.user?.id ?? null,
  });

  if (!auth?.user) {
    console.error(LOG, "calling signInAnonymously", { path: request.nextUrl.pathname });
    const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) {
      console.error(LOG, "signInAnonymously error:", signInError.message, signInError);
    } else {
      console.error(LOG, "signInAnonymously ok", {
        userId: signInData.user?.id ?? null,
        hasSession: Boolean(signInData.session),
      });
    }
  }

  return supabaseResponse;
}
