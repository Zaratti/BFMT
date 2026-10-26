import {
  validateTradeOrderDecision,
  validateTradeOrderDraft,
  type TradeOrderDecision,
  type TradeOrderAdministrationRepository,
  type TradeOrderDraft,
  type TradeOrderRepository,
} from "../domain/trade-order"

export function createTradeOrderUseCases(repository: TradeOrderRepository) {
  return {
    submitOrder: async (draft: TradeOrderDraft) => {
      const validationError = validateTradeOrderDraft(draft)
      if (validationError) throw new Error(validationError)
      return repository.create(draft)
    },
    listMyOrders: () => repository.listMine(),
  }
}

export function createTradeOrderAdministrationUseCases(repository: TradeOrderAdministrationRepository) {
  return {
    listAllOrders: () => repository.listAll(),
    reviewOrder: (id: string, decision: TradeOrderDecision, note: string | null = null) => {
      const validationError = validateTradeOrderDecision(id, decision, note)
      if (validationError) throw new Error(validationError)
      return repository.review(id, decision, note)
    },
  }
}
