"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Menu,
  Wallet,
  Activity,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Bell,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { LanguageSelector } from "@/components/language-selector"
import { getBrowserIdentityAuthentication } from "@/src/modules/identity/composition/browser"
import { getBrowserTradeOrderUseCases } from "@/src/modules/trading/composition/browser"
import type { TradeLedgerEntry, TradeOrder } from "@/src/modules/trading/domain/trade-order"

interface MainContentProps {
  onMenuClick: () => void
}

export function MainContent({ onMenuClick }: MainContentProps) {
  const [hasNewMessages, setHasNewMessages] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [notificationClicked, setNotificationClicked] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [welcomeBack, setWelcomeBack] = useState(false)
  const [orders, setOrders] = useState<TradeOrder[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<TradeLedgerEntry[]>([])
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadDashboard() {
      try {
        const [identity, visitedRecently, userOrders, userLedgerEntries] = await Promise.all([
          getBrowserIdentityAuthentication().getCurrentIdentity(),
          getBrowserIdentityAuthentication().recordDashboardVisit(),
          getBrowserTradeOrderUseCases().listMyOrders(),
          getBrowserTradeOrderUseCases().listMyLedgerEntries(),
        ])
        if (!active) return
        setUsername(identity?.username ?? identity?.email?.split("@")[0] ?? null)
        setWelcomeBack(visitedRecently)
        setOrders(userOrders)
        setLedgerEntries(userLedgerEntries)
      } catch (error) {
        console.error("Could not load dashboard data.", error)
        if (active) setDashboardError("Dashboard information could not be loaded. Please refresh to try again.")
      } finally {
        if (active) setIsDashboardLoading(false)
      }
    }

    void loadDashboard()
    return () => {
      active = false
    }
  }, [])

  const completedTotal = ledgerEntries.reduce((total, entry) => total + entry.amountUsd, 0)
  const waitingOrders = orders.filter((order) => order.status === "pending_review" || order.status === "approved").length
  const stats = [
    { name: "Portfolio Balance", value: `$${completedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, description: "Total of completed buy and sell records", icon: Wallet },
    { name: "Total Requests", value: String(orders.length), description: "All submitted trade requests", icon: CreditCard },
    { name: "Open Requests", value: String(waitingOrders), description: "Awaiting review or completion", icon: Activity },
  ]
  const recentTransactions = ledgerEntries.slice(0, 4)

  const handleNotificationClick = () => {
    setNotificationClicked(true)
    if (hasNewMessages) {
      setHasNewMessages(false)
      setHasUnreadMessages(true)
    }
    // Navigate to messages or show notification panel
  }

  const getNotificationColor = () => {
    if (hasNewMessages) return "bg-green-500" // Green for new messages
    if (hasUnreadMessages && notificationClicked) return "bg-red-500" // Red for unread after clicking
    return "bg-white border border-gray-300" // White after reading all messages
  }

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="lg:hidden mr-2" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-serif font-bold text-foreground">Bifimoto</h1>
              <span className="hidden sm:inline text-sm text-muted-foreground">Exchange</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            <Button variant="ghost" size="sm" className="relative" onClick={handleNotificationClick}>
              <Bell className="h-4 w-4" />
              <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${getNotificationColor()}`}></span>
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User Profile" />
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {(username?.slice(0, 2) ?? "BF").toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {welcomeBack ? "Welcome back" : "Hello"}, {username ?? "there"}!
                </h2>
                <p className="text-muted-foreground">
                  Your completed transaction total is not a wallet balance and does not represent withdrawable funds.
                </p>
              </div>
              <div className="hidden sm:block">
                <BarChart3 className="h-12 w-12 text-accent/60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {dashboardError && <p role="alert" className="mb-4 text-sm text-destructive">{dashboardError}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{isDashboardLoading ? "—" : stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/buy">
            <Button size="lg" className="h-16 bg-green-600 hover:bg-green-700 text-white w-full">
              <ArrowUpRight className="h-5 w-5 mr-2" />
              Buy Assets
            </Button>
          </Link>
          <Link href="/dashboard/sell">
            <Button
              size="lg"
              variant="outline"
              className="h-16 border-red-200 text-red-600 hover:bg-red-50 bg-transparent w-full"
            >
              <ArrowDownLeft className="h-5 w-5 mr-2" />
              Sell Assets
            </Button>
          </Link>
          <Link href="/dashboard/transactions">
            <Button size="lg" className="h-16 bg-accent hover:bg-accent/90 w-full">
              <Activity className="h-5 w-5 mr-2" />
              Transactions
            </Button>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
              <CardDescription className="text-muted-foreground">Completed requests recorded in your ledger</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {isDashboardLoading ? "Loading transactions..." : "No completed transactions yet."}
                </p>
              ) : <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.side === "buy"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.side === "buy" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{transaction.side.toUpperCase()} {transaction.assetSymbol}</p>
                        <p className="text-xs text-muted-foreground">{new Date(transaction.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-card-foreground">{transaction.assetQuantity} {transaction.assetSymbol}</p>
                      <p className="text-xs text-muted-foreground">${transaction.amountUsd.toFixed(2)} · fee ${transaction.feeUsd.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Portfolio Activity</CardTitle>
              <CardDescription className="text-muted-foreground">Status of your submitted requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">{orders.length} total request{orders.length === 1 ? "" : "s"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{waitingOrders} awaiting review or completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
