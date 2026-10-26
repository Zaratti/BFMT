import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseConfiguration } from "./configuration"
import type { Database } from "./database.types"

export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseConfiguration()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components cannot write cookies. Middleware refreshes the session.
        }
      },
    },
  })
}
