import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  TradeOrder,
  TradeOrderAdministrationRepository,
  TradeOrderDraft,
  TradeLedgerEntry,
  TradeFeeTier,
  TradeFeeTierDraft,
  TradeOrderRepository,
} from "../../domain/trade-order"
import type { TradeOrderRow, TradingDatabase } from "./database.types"

const orderColumns =
  "id,user_id,side,asset_symbol,network,amount_usd,asset_quantity,fee_usd,destination,status,created_at,reviewed_by,reviewed_at,review_note,completed_by,completed_at"

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
    completedBy: row.completed_by,
    completedAt: row.completed_at,
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

  async listMyLedgerEntries(): Promise<TradeLedgerEntry[]> {
    const { data, error } = await this.supabase
      .from("trade_ledger_entries")
      .select("id,order_id,user_id,side,asset_symbol,amount_usd,fee_usd,asset_quantity,completed_by,created_at")
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => ({
      id: row.id,
      orderId: row.order_id,
      userId: row.user_id,
      side: row.side,
      assetSymbol: row.asset_symbol,
      amountUsd: Number(row.amount_usd),
      feeUsd: Number(row.fee_usd),
      assetQuantity: Number(row.asset_quantity),
      completedBy: row.completed_by,
      createdAt: row.created_at,
    }))
  }

  async getFee(side: "buy" | "sell", assetSymbol: string, amountUsd: number): Promise<number | null> {
    const { data, error } = await this.supabase.rpc("get_trade_fee", {
      p_side: side,
      p_asset_symbol: assetSymbol,
      p_amount_usd: amountUsd,
    })
    if (error) throw new Error(error.message)
    return data === null ? null : Number(data)
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

  async complete(id: string, transactionPassword: string): Promise<void> {
    const { data, error } = await this.supabase.rpc("complete_trade_order", {
      p_order_id: id,
      p_transaction_password: transactionPassword,
    })

    if (error) throw new Error(error.message)
    if (data !== "completed") {
      const messages: Record<string, string> = {
        invalid_transaction_password: "The transaction password is incorrect.",
        transaction_password_locked_2_hours: "Five incorrect attempts. Try again after the 2-hour lockout.",
        transaction_password_locked_12_hours: "Five more incorrect attempts. Try again after the 12-hour lockout.",
        transaction_password_locked_24_hours: "Five more incorrect attempts. Try again after the 24-hour lockout.",
        transaction_password_locked: "Transaction password attempts are temporarily locked.",
        transaction_password_not_set: "Set an admin transaction password before completing orders.",
        transaction_password_reset_required:
          "Repeated failed attempts require a transaction-password reset. Contact the Supabase project owner.",
      }
      throw new Error(messages[data] ?? "The order could not be completed.")
    }
  }

  async listFeeTiers(): Promise<TradeFeeTier[]> {
    const { data, error } = await this.supabase
      .from("trade_fee_tiers")
      .select("id,side,asset_symbol,minimum_usd,maximum_usd,fee_usd")
      .order("side", { ascending: true })
      .order("asset_symbol", { ascending: true })
      .order("minimum_usd", { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []).map((tier) => ({
      id: tier.id,
      side: tier.side,
      assetSymbol: tier.asset_symbol,
      minimumUsd: Number(tier.minimum_usd),
      maximumUsd: tier.maximum_usd === null ? null : Number(tier.maximum_usd),
      feeUsd: Number(tier.fee_usd),
    }))
  }

  async saveFeeTier(tier: TradeFeeTierDraft): Promise<TradeFeeTier> {
    const { data, error } = await this.supabase.rpc("save_trade_fee_tier", {
      p_tier_id: tier.id ?? null,
      p_side: tier.side,
      p_asset_symbol: tier.assetSymbol,
      p_minimum_usd: tier.minimumUsd,
      p_maximum_usd: tier.maximumUsd,
      p_fee_usd: tier.feeUsd,
    })
    if (error) throw new Error(error.message)
    return {
      id: data.id,
      side: data.side,
      assetSymbol: data.asset_symbol,
      minimumUsd: Number(data.minimum_usd),
      maximumUsd: data.maximum_usd === null ? null : Number(data.maximum_usd),
      feeUsd: Number(data.fee_usd),
    }
  }

  async deleteFeeTier(id: string): Promise<void> {
    const { error } = await this.supabase.rpc("delete_trade_fee_tier", { p_tier_id: id })
    if (error) throw new Error(error.message)
  }
}
