import "server-only"

import { createMarketPriceUseCases } from "../application/market-price-use-cases"
import { KrakenMarketPriceAdapter } from "../infrastructure/market-data/kraken-market-price-adapter"

export function getServerMarketPriceUseCases() {
  return createMarketPriceUseCases(new KrakenMarketPriceAdapter())
}
