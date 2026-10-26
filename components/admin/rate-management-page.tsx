"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

const assetRates = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
    category: "crypto",
    currentPrice: 67234,
    buyRate: 1650, // NGN per USD
    sellRate: 1640, // NGN per USD
    buyFee: 2.0, // Changed from percentage to fixed dollar amount
    sellFee: 1.5, // Changed from percentage to fixed dollar amount
    spread: 0.6, // percentage
    isActive: true,
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    category: "crypto",
    currentPrice: 3456,
    buyRate: 1650,
    sellRate: 1640,
    buyFee: 2.0,
    sellFee: 1.5,
    spread: 0.6,
    isActive: true,
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    symbol: "TON",
    name: "Toncoin",
    icon: "💎",
    category: "crypto",
    currentPrice: 5.42,
    buyRate: 1650,
    sellRate: 1640,
    buyFee: 3.0,
    sellFee: 2.0,
    spread: 0.6,
    isActive: true,
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    category: "crypto",
    currentPrice: 178,
    buyRate: 1650,
    sellRate: 1640,
    buyFee: 2.0,
    sellFee: 1.5,
    spread: 0.6,
    isActive: true,
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    category: "stablecoin",
    currentPrice: 1,
    buyRate: 1650,
    sellRate: 1640,
    buyFee: 1.0,
    sellFee: 0.75,
    spread: 0.6,
    isActive: true,
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "₮",
    category: "stablecoin",
    currentPrice: 1,
    buyRate: 1650,
    sellRate: 1640,
    buyFee: 1.0,
    sellFee: 0.75,
    spread: 0.6,
    isActive: true,
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    symbol: "PAYPAL",
    name: "PayPal",
    icon: "💳",
    category: "fiat",
    currentPrice: 1.0,
    buyRate: 1650,
    sellRate: 1640,
    buyFee: 5.0,
    sellFee: 4.0,
    spread: 0.6,
    isActive: true,
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    symbol: "SKRILL",
    name: "Skrill",
    icon: "💳",
    category: "fiat",
    currentPrice: 1.0,
    buyRate: 1650,
    sellRate: 1640,
    buyFee: 4.0,
    sellFee: 3.0,
    spread: 0.6,
    isActive: true,
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    symbol: "NETELLER",
    name: "Neteller",
    icon: "💳",
    category: "fiat",
    currentPrice: 1.0,
    buyRate: 1650,
    sellRate: 1640,
    buyFee: 4.0,
    sellFee: 3.0,
    spread: 0.6,
    isActive: false,
    lastUpdated: "2024-01-15 14:30:00",
  },
]

const globalSettings = {
  baseCurrency: "NGN",
  defaultBuyRate: 1650,
  defaultSellRate: 1640,
  autoUpdateRates: true,
  rateUpdateInterval: 5, // minutes
  maxSpread: 2.0, // percentage
  emergencyStop: false,
}

export function RateManagementPage() {
  const [editingRate, setEditingRate] = useState<any>(null)
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredRates = assetRates.filter((rate) => selectedCategory === "all" || rate.category === selectedCategory)

  const updateAllRates = () => {
    console.log("Updating all rates from market data...")
  }

  const saveGlobalSettings = () => {
    console.log("Saving global settings...")
    setShowGlobalSettings(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Rate & Fee Management</h1>
            <p className="text-muted-foreground">Configure exchange rates and fees for all assets</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={updateAllRates}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Rates
          </Button>
          <Dialog open={showGlobalSettings} onOpenChange={setShowGlobalSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Global Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Global Rate Settings</DialogTitle>
                <DialogDescription>Configure system-wide rate and fee settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Base Currency</Label>
                  <Select defaultValue={globalSettings.baseCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Buy Rate (NGN per USD)</Label>
                  <Input type="number" defaultValue={globalSettings.defaultBuyRate} step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Default Sell Rate (NGN per USD)</Label>
                  <Input type="number" defaultValue={globalSettings.defaultSellRate} step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Rate Update Interval (minutes)</Label>
                  <Input type="number" defaultValue={globalSettings.rateUpdateInterval} />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Spread (%)</Label>
                  <Input type="number" defaultValue={globalSettings.maxSpread} step="0.1" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked={globalSettings.autoUpdateRates} />
                  <Label>Auto-update rates from market data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked={globalSettings.emergencyStop} />
                  <Label className="text-red-600">Emergency stop (disable all trading)</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowGlobalSettings(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveGlobalSettings}>Save Settings</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetRates.filter((r) => r.isActive).length}</div>
            <p className="text-xs text-muted-foreground">of {assetRates.length} total assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Buy Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{globalSettings.defaultBuyRate}</div>
            <p className="text-xs text-muted-foreground">per USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Sell Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{globalSettings.defaultSellRate}</div>
            <p className="text-xs text-muted-foreground">per USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Spread</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.6%</div>
            <p className="text-xs text-muted-foreground">across all assets</p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Management */}
      <Tabs defaultValue="rates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
          <TabsTrigger value="fees">Fee Structure</TabsTrigger>
          <TabsTrigger value="history">Rate History</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Asset Exchange Rates</CardTitle>
                  <CardDescription>Configure buy and sell rates for each asset</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="stablecoin">Stablecoin</SelectItem>
                      <SelectItem value="fiat">Fiat Rails</SelectItem>
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
                      <TableHead>Asset</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>USD Price</TableHead>
                      <TableHead>Buy Rate (NGN/USD)</TableHead>
                      <TableHead>Sell Rate (NGN/USD)</TableHead>
                      <TableHead>Spread</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRates.map((rate) => (
                      <TableRow key={rate.symbol}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{rate.icon}</span>
                            <div>
                              <p className="font-medium">{rate.name}</p>
                              <p className="text-sm text-muted-foreground">{rate.symbol}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {rate.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {rate.category === "fiat" || rate.category === "stablecoin"
                            ? `$${rate.currentPrice.toFixed(2)}`
                            : `$${rate.currentPrice.toLocaleString()}`}
                        </TableCell>
                        <TableCell className="font-mono">₦{rate.buyRate}</TableCell>
                        <TableCell className="font-mono">₦{rate.sellRate}</TableCell>
                        <TableCell className="font-mono">{rate.spread}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={rate.isActive ? "default" : "secondary"}
                            className={rate.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {rate.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(rate.lastUpdated).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setEditingRate(rate)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cryptocurrency Fees</CardTitle>
                <CardDescription>Default fees for crypto assets (fixed amounts in USD)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Buy Fee ($)</Label>
                  <Input type="number" defaultValue="2.0" step="0.5" min="0" />
                  <p className="text-xs text-muted-foreground">Fixed fee added to buy transactions</p>
                </div>
                <div className="space-y-2">
                  <Label>Sell Fee ($)</Label>
                  <Input type="number" defaultValue="1.5" step="0.5" min="0" />
                  <p className="text-xs text-muted-foreground">Fixed fee deducted from sell transactions</p>
                </div>
                <Button size="sm" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stablecoin Fees</CardTitle>
                <CardDescription>Default fees for stablecoins (fixed amounts in USD)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Buy Fee ($)</Label>
                  <Input type="number" defaultValue="1.0" step="0.5" min="0" />
                  <p className="text-xs text-muted-foreground">Fixed fee added to buy transactions</p>
                </div>
                <div className="space-y-2">
                  <Label>Sell Fee ($)</Label>
                  <Input type="number" defaultValue="0.75" step="0.25" min="0" />
                  <p className="text-xs text-muted-foreground">Fixed fee deducted from sell transactions</p>
                </div>
                <Button size="sm" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fiat Rail Fees</CardTitle>
                <CardDescription>Default fees for fiat payments (fixed amounts in USD)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Buy Fee ($)</Label>
                  <Input type="number" defaultValue="5.0" step="0.5" min="0" />
                  <p className="text-xs text-muted-foreground">Fixed fee added to buy transactions</p>
                </div>
                <div className="space-y-2">
                  <Label>Sell Fee ($)</Label>
                  <Input type="number" defaultValue="4.0" step="0.5" min="0" />
                  <p className="text-xs text-muted-foreground">Fixed fee deducted from sell transactions</p>
                </div>
                <Button size="sm" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate History</CardTitle>
              <CardDescription>Historical exchange rate data and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Rate history charts and logs will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Rate Dialog */}
      <Dialog open={!!editingRate} onOpenChange={() => setEditingRate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editingRate?.name} Rates</DialogTitle>
            <DialogDescription>Configure exchange rates and fees for this asset</DialogDescription>
          </DialogHeader>
          {editingRate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buy Rate (NGN/USD)</Label>
                  <Input type="number" defaultValue={editingRate.buyRate} step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label>Sell Rate (NGN/USD)</Label>
                  <Input type="number" defaultValue={editingRate.sellRate} step="0.1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buy Fee ($)</Label>
                  <Input type="number" defaultValue={editingRate.buyFee} step="0.5" min="0" />
                  <p className="text-xs text-muted-foreground">Fixed dollar amount</p>
                </div>
                <div className="space-y-2">
                  <Label>Sell Fee ($)</Label>
                  <Input type="number" defaultValue={editingRate.sellFee} step="0.5" min="0" />
                  <p className="text-xs text-muted-foreground">Fixed dollar amount</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked={editingRate.isActive} />
                <Label>Enable trading for this asset</Label>
              </div>
              {!editingRate.isActive && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">This asset is currently disabled for trading</p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingRate(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setEditingRate(null)}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
