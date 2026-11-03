import type { MarketPriceProvider, MarketPriceSnapshot } from "../../domain/market-price"

const pairs: Record<string, string[]> = {
  BTC: ["XBTUSD", "XXBTZUSD", "BTCUSD"],
  ETH: ["ETHUSD", "XETHZUSD"],
  TON: ["TONUSD"],
  SOL: ["SOLUSD"],
  BNB: ["BNBUSD"],
  SUI: ["SUIUSD"],
  PI: ["PIUSD"],
  USDC: ["USDCUSD"],
  USDT: ["USDTUSD", "USDTZUSD"],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getLastPrice(value: unknown): number | null {
  if (!isRecord(value) || !Array.isArray(value.c) || typeof value.c[0] !== "string") return null
  const price = Number(value.c[0])
  return Number.isFinite(price) && price > 0 ? price : null
}

export class KrakenMarketPriceAdapter implements MarketPriceProvider {
  async getCurrentPrices(): Promise<MarketPriceSnapshot> {
    const url = new URL("https://api.kraken.com/0/public/Ticker")
    url.searchParams.set("pair", Object.values(pairs).map((aliases) => aliases[0]).join(","))
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) })

    if (!response.ok) throw new Error(`Kraken market data returned HTTP ${response.status}.`)

    const payload: unknown = await response.json()
    if (!isRecord(payload) || !isRecord(payload.result)) {
      throw new Error("Kraken returned an invalid market-price response.")
    }

    const prices: Record<string, number> = {}
    for (const [symbol, aliases] of Object.entries(pairs)) {
      const ticker = Object.entries(payload.result).find(([key]) =>
        aliases.includes(key.toUpperCase()),
      )?.[1]
      const price = getLastPrice(ticker)
      if (price !== null) prices[symbol] = price
    }

    const unavailableSymbols = Object.keys(pairs).filter((symbol) => prices[symbol] === undefined)
    if (Object.keys(prices).length === 0) throw new Error("Kraken returned no usable market prices.")

    return { prices, unavailableSymbols, updatedAt: new Date().toISOString() }
  }
}
