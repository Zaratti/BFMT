export type TradeOrderRow = {
  id: string
  user_id: string
  side: "buy" | "sell"
  asset_symbol: string
  network: string | null
  amount_usd: number
  asset_quantity: number
  fee_usd: number
  destination: string
  status: "pending_review" | "approved" | "completed" | "rejected"
  created_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
}

export type TradingDatabase = {
  public: {
    Tables: {
      trade_orders: {
        Row: TradeOrderRow
        Insert: {
          side: TradeOrderRow["side"]
          asset_symbol: string
          network?: string | null
          amount_usd: number
          asset_quantity: number
          fee_usd: number
          destination: string
        }
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      decide_trade_order: {
        Args: {
          p_order_id: string
          p_decision: "approve" | "reject"
          p_review_note?: string | null
        }
        Returns: TradeOrderRow
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
