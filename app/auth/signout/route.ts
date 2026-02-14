import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Verify there is a user to sign out
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // 2. Clear the Supabase session cookies
    await supabase.auth.signOut();
  }

  // 3. Updated redirect to /auth/login instead of /login
  const logoutUrl = new URL("/auth/sign-up", request.url);
  return NextResponse.redirect(logoutUrl, {
    status: 302,
  });
}