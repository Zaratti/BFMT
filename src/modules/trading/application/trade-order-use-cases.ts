import {
  validateTradeOrderDecision,
  validateTradeOrderDraft,
  type TradeOrderDecision,
  type TradeOrderAdministrationRepository,
  type TradeOrderDraft,
  type TradeOrderRepository,
  type TradeFeeTierDraft,
} from "../domain/trade-order"

export function createTradeOrderUseCases(repository: TradeOrderRepository) {
  return {
    submitOrder: async (draft: TradeOrderDraft) => {
      const validationError = validateTradeOrderDraft(draft)
      if (validationError) throw new Error(validationError)
      return repository.create(draft)
    },
    listMyOrders: () => repository.listMine(),
    listMyLedgerEntries: () => repository.listMyLedgerEntries(),
    getFee: (side: "buy" | "sell", assetSymbol: string, amountUsd: number) =>
      repository.getFee(side, assetSymbol, amountUsd),
  }
}

export function createTradeOrderAdministrationUseCases(repository: TradeOrderAdministrationRepository) {
  return {
    listAllOrders: () => repository.listAll(),
    completeOrder: (id: string, transactionPassword: string) => repository.complete(id, transactionPassword),
    listFeeTiers: () => repository.listFeeTiers(),
    saveFeeTier: (tier: TradeFeeTierDraft) => repository.saveFeeTier(tier),
    deleteFeeTier: (id: string) => repository.deleteFeeTier(id),
    reviewOrder: (id: string, decision: TradeOrderDecision, note: string | null = null) => {
      const validationError = validateTradeOrderDecision(id, decision, note)
      if (validationError) throw new Error(validationError)
      return repository.review(id, decision, note)
    },
  }
}
