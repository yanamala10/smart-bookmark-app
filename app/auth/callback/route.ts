import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("Exchange error:", error.message)
    return NextResponse.redirect(new URL("/auth/login?error=auth", request.url))
  }

  return NextResponse.redirect(new URL("/auth/dashboard", request.url))
}
