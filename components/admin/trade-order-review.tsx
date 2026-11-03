"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { TradeOrder, TradeOrderDecision } from "@/src/modules/trading/domain/trade-order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TradeOrderReviewProps {
  orders: TradeOrder[]
}

export function TradeOrderReview({ orders }: TradeOrderReviewProps) {
  const router = useRouter()
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [completionPassword, setCompletionPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function reviewOrder(order: TradeOrder, decision: TradeOrderDecision) {
    const verb = decision === "approve" ? "approve" : "reject"
    if (!window.confirm(`Are you sure you want to ${verb} order ${order.id}?`)) return

    const note = decision === "reject" ? window.prompt("Enter the reason for rejecting this order:")?.trim() : null
    if (decision === "reject" && !note) return

    setReviewingId(order.id)
    setError(null)
    try {
      const response = await fetch(`/api/admin/trade-orders/${encodeURIComponent(order.id)}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note }),
      })
      const result: { error?: string } = await response.json()

      if (!response.ok) throw new Error(result.error ?? "Unable to review this order.")
      router.refresh()
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Unable to review this order.")
    } finally {
      setReviewingId(null)
    }
  }

  async function completeOrder(order: TradeOrder) {
    if (!completionPassword) {
      setError("Enter your separate admin transaction password to complete this order.")
      return
    }

    setReviewingId(order.id)
    setError(null)
    try {
      const response = await fetch(`/api/admin/trade-orders/${encodeURIComponent(order.id)}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", transactionPassword: completionPassword }),
      })
      const result: { error?: string } = await response.json()

      if (!response.ok) {
        setCompletionPassword("")
        throw new Error(result.error ?? "Unable to complete this order.")
      }
      setCompletionPassword("")
      router.refresh()
    } catch (completionError) {
      setCompletionPassword("")
      setError(completionError instanceof Error ? completionError.message : "Unable to complete this order.")
    } finally {
      setReviewingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade order review</CardTitle>
        <CardDescription>
          Orders are user-submitted requests. Completing records that external settlement was manually confirmed; it does not execute a transfer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>}
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">There are no trade orders to review.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Side / asset</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>USD amount</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Reviewed by</TableHead>
                  <TableHead>Review note</TableHead>
                  <TableHead>Completed by / at</TableHead>
                  <TableHead className="text-right">Review / completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell className="uppercase">{order.side} / {order.assetSymbol}</TableCell>
                    <TableCell>{order.assetQuantity}</TableCell>
                    <TableCell>${order.amountUsd.toFixed(2)}</TableCell>
                    <TableCell className="max-w-48 truncate font-mono text-xs" title={order.destination}>
                      {order.destination}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === "rejected" ? "destructive" : "secondary"}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{order.reviewedBy ?? "—"}</TableCell>
                    <TableCell className="max-w-48 truncate" title={order.reviewNote ?? undefined}>
                      {order.reviewNote ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {order.completedAt
                        ? <>{order.completedBy ?? "—"}<br />{new Date(order.completedAt).toLocaleString()}</>
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {order.status === "pending_review" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => reviewOrder(order, "approve")}
                            disabled={reviewingId !== null}
                          >
                            {reviewingId === order.id ? "Saving..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => reviewOrder(order, "reject")}
                            disabled={reviewingId !== null}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : order.status === "approved" ? (
                        <div className="flex min-w-48 flex-col items-end gap-2">
                          <Input
                            type="password"
                            autoComplete="current-password"
                            aria-label="Admin transaction password"
                            placeholder="Transaction password"
                            value={completionPassword}
                            onChange={(event) => setCompletionPassword(event.target.value)}
                            className="max-w-56"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => void completeOrder(order)}
                              disabled={reviewingId !== null || !completionPassword}
                            >
                              {reviewingId === order.id ? "Saving..." : "Confirm completion"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => void reviewOrder(order, "reject")}
                              disabled={reviewingId !== null}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {order.reviewedAt ? new Date(order.reviewedAt).toLocaleString() : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
