import type { MarketPriceProvider } from "../domain/market-price"

export function createMarketPriceUseCases(provider: MarketPriceProvider) {
  return {
    getCurrentPrices: () => provider.getCurrentPrices(),
  }
}
