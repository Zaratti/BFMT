import { NextResponse, type NextRequest } from "next/server"
import { getServerIdentityAuthentication } from "@/src/modules/identity/composition/server"
import { getServerTradeOrderUseCases } from "@/src/modules/trading/composition/server"
import type { TradeOrderDecision } from "@/src/modules/trading/domain/trade-order"

interface DecisionRequest {
  decision: TradeOrderDecision
  note?: string | null
}

function isDecisionRequest(value: unknown): value is DecisionRequest {
  if (typeof value !== "object" || value === null) return false
  const body = value as Record<string, unknown>
  return (
    (body.decision === "approve" || body.decision === "reject") &&
    (body.note === undefined || body.note === null || typeof body.note === "string")
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Cross-origin requests are not allowed." }, { status: 403 })
  }

  const authentication = await getServerIdentityAuthentication()
  const identity = await authentication.getCurrentIdentity()

  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 })
  if (identity.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 })
  }

  if (!isDecisionRequest(body)) {
    return NextResponse.json({ error: "Provide an approve or reject decision and an optional note." }, { status: 400 })
  }

  try {
    const { reviewOrder } = await getServerTradeOrderUseCases()
    const order = await reviewOrder(params.orderId, body.decision, body.note ?? null)
    return NextResponse.json({ order })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trade order review failed."
    console.error("Trade order review failed:", error)

    if (
      message.includes("valid trade order ID") ||
      message.includes("Choose approve") ||
      message.includes("reason is required") ||
      message.includes("2,000 characters")
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    if (message.includes("already reviewed") || message.includes("not found")) {
      return NextResponse.json({ error: "This order is no longer awaiting review." }, { status: 409 })
    }

    return NextResponse.json({ error: "Unable to review this trade order." }, { status: 500 })
  }
}
