"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { TradeOrder, TradeOrderDecision } from "@/src/modules/trading/domain/trade-order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TradeOrderReviewProps {
  orders: TradeOrder[]
}

export function TradeOrderReview({ orders }: TradeOrderReviewProps) {
  const router = useRouter()
  const [reviewingId, setReviewingId] = useState<string | null>(null)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade order review</CardTitle>
        <CardDescription>
          Orders are user-submitted requests. Approval records an admin decision; it does not execute a transfer.
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
                  <TableHead className="text-right">Decision</TableHead>
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
