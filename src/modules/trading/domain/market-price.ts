export interface MarketPriceSnapshot {
  prices: Record<string, number>
  unavailableSymbols: string[]
  updatedAt: string
}

export interface MarketPriceProvider {
  getCurrentPrices(): Promise<MarketPriceSnapshot>
}
