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
  completed_by: string | null
  completed_at: string | null
}

export type TradingDatabase = {
  public: {
    Tables: {
      trade_ledger_entries: {
        Row: {
          id: string
          order_id: string
          user_id: string
          side: "buy" | "sell"
          asset_symbol: string
          amount_usd: number
          fee_usd: number
          asset_quantity: number
          completed_by: string
          created_at: string
        }
        Insert: never
        Update: never
        Relationships: []
      }
      trade_fee_tiers: {
        Row: {
          id: string
          side: "buy" | "sell"
          asset_symbol: string
          minimum_usd: number
          maximum_usd: number | null
          fee_usd: number
        }
        Insert: never
        Update: never
        Relationships: []
      }
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
      complete_trade_order: {
        Args: {
          p_order_id: string
          p_transaction_password: string
        }
        Returns: string
      }
      get_trade_fee: {
        Args: { p_side: "buy" | "sell"; p_asset_symbol: string; p_amount_usd: number }
        Returns: number | null
      }
      save_trade_fee_tier: {
        Args: {
          p_tier_id: string | null
          p_side: "buy" | "sell"
          p_asset_symbol: string
          p_minimum_usd: number
          p_maximum_usd: number | null
          p_fee_usd: number
        }
        Returns: TradingDatabase["public"]["Tables"]["trade_fee_tiers"]["Row"]
      }
      delete_trade_fee_tier: {
        Args: { p_tier_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
