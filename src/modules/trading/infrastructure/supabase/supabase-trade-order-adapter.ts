import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  TradeOrder,
  TradeOrderAdministrationRepository,
  TradeOrderDraft,
  TradeOrderRepository,
} from "../../domain/trade-order"
import type { TradeOrderRow, TradingDatabase } from "./database.types"

const orderColumns =
  "id,user_id,side,asset_symbol,network,amount_usd,asset_quantity,fee_usd,destination,status,created_at,reviewed_by,reviewed_at,review_note"

function toDomain(row: TradeOrderRow): TradeOrder {
  return {
    id: row.id,
    userId: row.user_id,
    side: row.side,
    assetSymbol: row.asset_symbol,
    network: row.network,
    amountUsd: Number(row.amount_usd),
    assetQuantity: Number(row.asset_quantity),
    feeUsd: Number(row.fee_usd),
    destination: row.destination,
    status: row.status,
    createdAt: row.created_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    reviewNote: row.review_note,
  }
}

export class SupabaseTradeOrderAdapter implements TradeOrderRepository, TradeOrderAdministrationRepository {
  constructor(private readonly supabase: SupabaseClient<TradingDatabase>) {}

  async create(draft: TradeOrderDraft): Promise<TradeOrder> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser()
    if (userError || !userData.user) throw new Error("Sign in before submitting a trade request.")

    const { data, error } = await this.supabase
      .from("trade_orders")
      .insert({
        side: draft.side,
        asset_symbol: draft.assetSymbol,
        network: draft.network,
        amount_usd: draft.amountUsd,
        asset_quantity: draft.assetQuantity,
        fee_usd: draft.feeUsd,
        destination: draft.destination,
      })
      .select(orderColumns)
      .single()

    if (error) throw new Error(error.message)
    return toDomain(data)
  }

  async listMine(): Promise<TradeOrder[]> {
    const { data, error } = await this.supabase
      .from("trade_orders")
      .select(orderColumns)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toDomain)
  }

  async listAll(): Promise<TradeOrder[]> {
    const { data, error } = await this.supabase
      .from("trade_orders")
      .select(orderColumns)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toDomain)
  }

  async review(id: string, decision: "approve" | "reject", note: string | null): Promise<TradeOrder> {
    const { data, error } = await this.supabase.rpc("decide_trade_order", {
      p_order_id: id,
      p_decision: decision,
      p_review_note: note,
    })

    if (error) throw new Error(error.message)
    return toDomain(data)
  }
}
