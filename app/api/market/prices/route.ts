import { NextResponse } from "next/server"
import { getServerMarketPriceUseCases } from "@/src/modules/trading/composition/market-prices"

export const revalidate = 30

export async function GET() {
  try {
    const snapshot = await getServerMarketPriceUseCases().getCurrentPrices()
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    })
  } catch (error) {
    console.error("Could not retrieve live Kraken prices.", error instanceof Error ? error.name : "Unknown error")
    return NextResponse.json({ error: "Live market prices are temporarily unavailable." }, { status: 502 })
  }
}
