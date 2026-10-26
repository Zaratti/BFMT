export type TradeSide = "buy" | "sell"
export type TradeOrderStatus = "pending_review" | "approved" | "completed" | "rejected"
export type TradeOrderDecision = "approve" | "reject"

export interface TradeOrder {
  id: string
  userId: string
  side: TradeSide
  assetSymbol: string
  network: string | null
  amountUsd: number
  assetQuantity: number
  feeUsd: number
  destination: string
  status: TradeOrderStatus
  createdAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNote: string | null
}

export interface TradeOrderDraft {
  side: TradeSide
  assetSymbol: string
  network: string | null
  amountUsd: number
  assetQuantity: number
  feeUsd: number
  destination: string
}

export interface TradeOrderRepository {
  create(draft: TradeOrderDraft): Promise<TradeOrder>
  listMine(): Promise<TradeOrder[]>
}

export interface TradeOrderAdministrationRepository {
  listAll(): Promise<TradeOrder[]>
  review(id: string, decision: TradeOrderDecision, note: string | null): Promise<TradeOrder>
}

export function validateTradeOrderDecision(id: string, decision: string, note: string | null): string | null {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return "A valid trade order ID is required."
  }
  if (decision !== "approve" && decision !== "reject") return "Choose approve or reject."
  if (decision === "reject" && !note?.trim()) return "A reason is required when rejecting an order."
  if (note !== null && note.length > 2000) return "The review note must be 2,000 characters or fewer."
  return null
}

export function validateTradeOrderDraft(draft: TradeOrderDraft): string | null {
  if (!draft.assetSymbol.trim()) return "Select an asset before submitting your order."
  if (!Number.isFinite(draft.amountUsd) || draft.amountUsd <= 0) return "Enter a valid order amount."
  if (!Number.isFinite(draft.assetQuantity) || draft.assetQuantity <= 0) return "Enter an amount that produces a valid asset quantity."
  if (!Number.isFinite(draft.feeUsd) || draft.feeUsd < 0) return "The order fee is invalid."
  if (!draft.destination.trim()) return "Enter a valid destination for this order."
  return null
}
