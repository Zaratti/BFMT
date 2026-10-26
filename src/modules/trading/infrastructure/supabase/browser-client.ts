import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseConfiguration } from "../../../identity/infrastructure/supabase/configuration"
import type { TradingDatabase } from "./database.types"

export function createSupabaseTradingClient() {
  const { url, key } = getSupabaseConfiguration()
  return createBrowserClient<TradingDatabase>(url, key)
}
