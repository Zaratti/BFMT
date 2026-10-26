import "server-only"

import { createTradeOrderAdministrationUseCases } from "../application/trade-order-use-cases"
import { createSupabaseTradingServerClient } from "../infrastructure/supabase/server-client"
import { SupabaseTradeOrderAdapter } from "../infrastructure/supabase/supabase-trade-order-adapter"

export async function getServerTradeOrderUseCases() {
  const supabase = await createSupabaseTradingServerClient()
  return createTradeOrderAdministrationUseCases(new SupabaseTradeOrderAdapter(supabase))
}
