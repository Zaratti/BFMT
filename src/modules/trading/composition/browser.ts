import { createTradeOrderUseCases } from "../application/trade-order-use-cases"
import { createSupabaseTradingClient } from "../infrastructure/supabase/browser-client"
import { SupabaseTradeOrderAdapter } from "../infrastructure/supabase/supabase-trade-order-adapter"

export function getBrowserTradeOrderUseCases() {
  const supabase = createSupabaseTradingClient()
  return createTradeOrderUseCases(new SupabaseTradeOrderAdapter(supabase))
}
