"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Menu,
  TrendingUp,
  TrendingDown,
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
import { useState } from "react"
import { LanguageSelector } from "@/components/language-selector"

interface MainContentProps {
  onMenuClick: () => void
}

const stats = [
  {
    name: "Portfolio Balance",
    value: "$12,847.32",
    change: "+12.5%",
    changeType: "increase" as "increase" | "decrease" | "neutral",
    icon: Wallet,
  },
  {
    name: "Last Transaction",
    value: "BTC Buy",
    change: "$2,450.00",
    changeType: "increase" as "increase" | "decrease" | "neutral",
    icon: CreditCard,
  },
  {
    name: "Pending Orders",
    value: "3 Active",
    change: "2 Buy, 1 Sell",
    changeType: "neutral" as "increase" | "decrease" | "neutral",
    icon: Activity,
  },
]

const recentTransactions = [
  { id: 1, description: "Bitcoin Purchase", amount: "+0.05 BTC", value: "$2,450.00", date: "2 hours ago", type: "buy" },
  { id: 2, description: "Ethereum Sale", amount: "-2.5 ETH", value: "$4,200.00", date: "4 hours ago", type: "sell" },
  { id: 3, description: "USDT Deposit", amount: "+1,000 USDT", value: "$1,000.00", date: "1 day ago", type: "deposit" },
  { id: 4, description: "BNB Purchase", amount: "+15 BNB", value: "$3,750.00", date: "2 days ago", type: "buy" },
]

export function MainContent({ onMenuClick }: MainContentProps) {
  const [hasNewMessages, setHasNewMessages] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [notificationClicked, setNotificationClicked] = useState(false)

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
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">JD</AvatarFallback>
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
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, John!</h2>
                <p className="text-muted-foreground">Ready to trade? Your portfolio is up 12.5% this week.</p>
              </div>
              <div className="hidden sm:block">
                <BarChart3 className="h-12 w-12 text-accent/60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {stat.changeType === "increase" ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : stat.changeType === "decrease" ? (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  ) : null}
                  <span
                    className={
                      stat.changeType === "increase"
                        ? "text-green-600"
                        : stat.changeType === "decrease"
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }
                  >
                    {stat.change}
                  </span>
                </p>
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
              <CardDescription className="text-muted-foreground">Your latest trading activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "buy"
                            ? "bg-green-100 text-green-600"
                            : transaction.type === "sell"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {transaction.type === "buy" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : transaction.type === "sell" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-card-foreground">{transaction.amount}</p>
                      <p className="text-xs text-muted-foreground">{transaction.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Portfolio Activity</CardTitle>
              <CardDescription className="text-muted-foreground">Your trading performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Activity chart will be displayed here</p>
                  <p className="text-xs text-muted-foreground mt-1">Portfolio up 12.5% this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
