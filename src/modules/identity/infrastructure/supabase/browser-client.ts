import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseConfiguration } from "./configuration"
import type { Database } from "./database.types"

export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseConfiguration()
  return createBrowserClient<Database>(url, key)
}
