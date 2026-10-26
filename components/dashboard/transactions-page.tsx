"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ChevronRight,
  Home,
  Settings,
  MessageSquare,
} from "lucide-react"
import { getBrowserTradeOrderUseCases } from "@/src/modules/trading/composition/browser"
import type { TradeOrder } from "@/src/modules/trading/domain/trade-order"

type TransactionRow = {
  id: string
  date: string
  type: "buy" | "sell"
  asset: string
  amount: string
  value: string
  fee: string
  status: "pending_review" | "approved" | "completed" | "rejected"
  hash: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

function toTransactionRow(order: TradeOrder): TransactionRow {
  return {
    id: order.id,
    date: new Date(order.createdAt).toLocaleString(),
    type: order.side,
    asset: order.assetSymbol,
    amount: `${order.side === "buy" ? "+" : "−"}${order.assetQuantity.toLocaleString()} ${order.assetSymbol}`,
    value: formatCurrency(order.amountUsd),
    fee: formatCurrency(order.feeUsd),
    status: order.status,
    hash: order.id.slice(0, 8),
  }
}

export function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let cancelled = false
    getBrowserTradeOrderUseCases()
      .listMyOrders()
      .then((orders) => {
        if (!cancelled) setTransactions(orders.map(toTransactionRow))
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Could not load your transactions.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const visibleTransactions = transactions.filter((transaction) => {
    const matchesSearch = `${transaction.id} ${transaction.asset} ${transaction.hash}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const exportTransactions = () => {
    const columns = ["ID", "Date", "Type", "Asset", "Amount", "Value", "Fee", "Status", "Reference"]
    const rows = visibleTransactions.map((transaction) => [
      transaction.id,
      transaction.date,
      transaction.type,
      transaction.asset,
      transaction.amount,
      transaction.value,
      transaction.fee,
      transaction.status,
      transaction.hash,
    ])
    const csv = [columns, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "bifimoto-transactions.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case "sell":
      case "withdraw":
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />
      case "deposit":
        return <Wallet className="h-4 w-4 text-blue-600" />
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
      case "pending_review":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending review</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <UserDashboard>
      <div className="p-6">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Transactions</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-foreground">Transaction History</h1>
          <Button variant="outline" className="border-border bg-transparent" onClick={exportTransactions} disabled={isLoading || transactions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-card-foreground">Your trade requests</CardTitle>
            <CardDescription className="text-muted-foreground">
              Orders are saved for review. This preview does not execute transfers or update balances.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Total requests</p>
              <p className="mt-1 text-2xl font-semibold">{transactions.length}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Pending review</p>
              <p className="mt-1 text-2xl font-semibold">
                {transactions.filter((transaction) => transaction.status === "pending_review").length}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="mt-1 text-2xl font-semibold">
                {transactions.filter((transaction) => transaction.status === "completed").length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Complete Transaction History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-card-foreground">Complete Transaction History</CardTitle>
                <CardDescription className="text-muted-foreground">
                  View all your cryptocurrency transactions and trading activities
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-8 w-full sm:w-64"
                    aria-label="Search transactions by ID, asset, or reference"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-32" aria-label="Filter transactions by type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-32" aria-label="Filter transactions by status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending_review">Pending review</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-card-foreground">Type</TableHead>
                    <TableHead className="text-card-foreground">Asset</TableHead>
                    <TableHead className="text-card-foreground">Amount</TableHead>
                    <TableHead className="text-card-foreground">Value</TableHead>
                    <TableHead className="text-card-foreground">Fee</TableHead>
                    <TableHead className="text-card-foreground">Date</TableHead>
                    <TableHead className="text-card-foreground">Status</TableHead>
                    <TableHead className="text-card-foreground">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        Loading your trade requests…
                      </TableCell>
                    </TableRow>
                  )}
                  {loadError && (
                    <TableRow>
                      <TableCell colSpan={8} role="alert" className="h-24 text-center text-red-700">
                        {loadError}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !loadError && visibleTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="capitalize text-card-foreground font-medium">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-card-foreground font-medium">{transaction.asset}</TableCell>
                      <TableCell
                        className={`font-medium ${
                          transaction.type === "buy" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.amount}
                      </TableCell>
                      <TableCell className="text-card-foreground font-medium">{transaction.value}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.fee}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{transaction.hash}</TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && !loadError && visibleTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        {transactions.length === 0
                          ? "No trade requests yet. Your submitted orders will appear here."
                          : "No trade requests match these filters. Try a different search or filter."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-border bg-transparent">
              <Link href="/dashboard" className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border bg-transparent">
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-border bg-transparent">
              <Link href="/dashboard/support" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </UserDashboard>
  )
}
