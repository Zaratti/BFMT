import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/src/modules/identity/infrastructure/supabase/server-client"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const destination = next.startsWith("/") ? new URL(next, origin) : new URL("/dashboard", origin)
  const safeNext = destination.origin === origin ? destination : new URL("/dashboard", origin)

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=oauth_callback", origin))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=oauth_callback", origin))
  }

  return NextResponse.redirect(safeNext)
}
