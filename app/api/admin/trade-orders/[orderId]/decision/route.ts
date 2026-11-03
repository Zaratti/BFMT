import { NextResponse, type NextRequest } from "next/server"
import { getServerIdentityAuthentication } from "@/src/modules/identity/composition/server"
import { getServerTradeOrderUseCases } from "@/src/modules/trading/composition/server"
import type { TradeOrderDecision } from "@/src/modules/trading/domain/trade-order"

interface DecisionRequest {
  decision: TradeOrderDecision
  note?: string | null
}

interface CompletionRequest {
  action: "complete"
  transactionPassword: string
}

function isOrderId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function isDecisionRequest(value: unknown): value is DecisionRequest | CompletionRequest {
  if (typeof value !== "object" || value === null) return false
  const body = value as Record<string, unknown>
  if ("action" in body) {
    return body.action === "complete"
      && typeof body.transactionPassword === "string"
      && body.transactionPassword.length > 0
      && body.transactionPassword.length <= 256
  }
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
  if (!isOrderId(params.orderId)) return NextResponse.json({ error: "A valid trade order ID is required." }, { status: 400 })

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
    const useCases = await getServerTradeOrderUseCases()
    if ("action" in body) {
      await useCases.completeOrder(params.orderId, body.transactionPassword)
      return NextResponse.json({ completed: true })
    }

    const order = await useCases.reviewOrder(params.orderId, body.decision, body.note ?? null)
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
    if (message.includes("already reviewed") || message.includes("not found") || message.includes("awaiting completion")) {
      return NextResponse.json({ error: "This order is no longer awaiting review." }, { status: 409 })
    }
    if (message.includes("transaction password is incorrect")) {
      return NextResponse.json({ error: message }, { status: 401 })
    }
    if (
      message.includes("2-hour lockout") ||
      message.includes("12-hour lockout") ||
      message.includes("24-hour lockout") ||
      message.includes("temporarily locked")
    ) {
      return NextResponse.json({ error: message }, { status: 429 })
    }
    if (message.includes("require a transaction-password reset")) {
      return NextResponse.json({ error: message }, { status: 423 })
    }
    if (message.includes("Set an admin transaction password")) {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    return NextResponse.json({ error: "Unable to review this trade order." }, { status: 500 })
  }
}
