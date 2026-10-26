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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Settings,
  TrendingUp,
  DollarSign,
  Network,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

type ManagedAsset = {
  symbol: string
  name: string
  price?: number
  icon: string
  category: "crypto" | "stablecoin" | "fiat"
  network?: string
  networks?: string[]
  status: string
  tradingEnabled: boolean
  buyFee: number
  sellFee: number
  minAmount: number
  maxAmount: number
  liquidity?: number
  processingTime?: string
}

type AssetNetwork = {
  name: string
  standard: string
  contractAddress: string
  confirmations: number
  active: boolean
}

type NetworkAsset = "USDC" | "USDT"

const cryptoAssets: ManagedAsset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 67234,
    icon: "₿",
    category: "crypto",
    network: "Bitcoin",
    status: "active",
    tradingEnabled: true,
    buyFee: 0.5,
    sellFee: 0.5,
    minAmount: 0.0001,
    maxAmount: 10,
    liquidity: 45.67,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3456,
    icon: "Ξ",
    category: "crypto",
    network: "Ethereum",
    status: "active",
    tradingEnabled: true,
    buyFee: 0.5,
    sellFee: 0.5,
    minAmount: 0.001,
    maxAmount: 100,
    liquidity: 123.45,
  },
  {
    symbol: "TON",
    name: "Toncoin",
    price: 5.42,
    icon: "💎",
    category: "crypto",
    network: "TON",
    status: "active",
    tradingEnabled: true,
    buyFee: 0.75,
    sellFee: 0.75,
    minAmount: 1,
    maxAmount: 10000,
    liquidity: 89.23,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 178,
    icon: "◎",
    category: "crypto",
    network: "Solana",
    status: "active",
    tradingEnabled: true,
    buyFee: 0.5,
    sellFee: 0.5,
    minAmount: 0.01,
    maxAmount: 1000,
    liquidity: 67.89,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    price: 1,
    icon: "💵",
    category: "stablecoin",
    networks: ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Base"],
    status: "active",
    tradingEnabled: true,
    buyFee: 0.25,
    sellFee: 0.25,
    minAmount: 10,
    maxAmount: 100000,
    liquidity: 234.56,
  },
  {
    symbol: "USDT",
    name: "Tether",
    price: 1,
    icon: "₮",
    category: "stablecoin",
    networks: ["Ethereum", "Tron", "BSC", "Polygon", "Arbitrum"],
    status: "active",
    tradingEnabled: true,
    buyFee: 0.25,
    sellFee: 0.25,
    minAmount: 10,
    maxAmount: 100000,
    liquidity: 345.67,
  },
]

const fiatRails: ManagedAsset[] = [
  {
    symbol: "PAYPAL",
    name: "PayPal",
    icon: "💳",
    category: "fiat",
    status: "active",
    tradingEnabled: true,
    buyFee: 2.5,
    sellFee: 2.5,
    minAmount: 10,
    maxAmount: 5000,
    processingTime: "Instant",
  },
  {
    symbol: "SKRILL",
    name: "Skrill",
    icon: "💳",
    category: "fiat",
    status: "active",
    tradingEnabled: true,
    buyFee: 2.0,
    sellFee: 2.0,
    minAmount: 10,
    maxAmount: 10000,
    processingTime: "1-2 hours",
  },
  {
    symbol: "NETELLER",
    name: "Neteller",
    icon: "💳",
    category: "fiat",
    status: "maintenance",
    tradingEnabled: false,
    buyFee: 2.0,
    sellFee: 2.0,
    minAmount: 10,
    maxAmount: 10000,
    processingTime: "1-2 hours",
  },
]

export function AssetManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingAsset, setEditingAsset] = useState<any>(null)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [editingNetworks, setEditingNetworks] = useState<{ asset: NetworkAsset; networks: AssetNetwork[] } | null>(null)
  const [showAddNetwork, setShowAddNetwork] = useState<string | null>(null)
  const [networkConfigs, setNetworkConfigs] = useState<Record<NetworkAsset, AssetNetwork[]>>({
    USDC: [
      {
        name: "Ethereum",
        standard: "ERC-20",
        contractAddress: "0xA0b86a33E6417c8C6CC8F19c8C6CC8F19c8C6CC8",
        confirmations: 12,
        active: true,
      },
      {
        name: "Polygon",
        standard: "Polygon",
        contractAddress: "0x2791Bca1f2de4661ED88837ca1490cCa17c31607",
        confirmations: 6,
        active: true,
      },
      {
        name: "Arbitrum",
        standard: "L2",
        contractAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        confirmations: 1,
        active: true,
      },
      {
        name: "Optimism",
        standard: "L2",
        contractAddress: "0x7F5c764cBc14f9669B88837ca1471b54bdA02913",
        confirmations: 1,
        active: true,
      },
      {
        name: "Base",
        standard: "L2",
        contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        confirmations: 1,
        active: true,
      },
    ],
    USDT: [
      {
        name: "Ethereum",
        standard: "ERC-20",
        contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        confirmations: 12,
        active: true,
      },
      {
        name: "Tron",
        standard: "TRC-20",
        contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        confirmations: 3,
        active: true,
      },
      {
        name: "BSC",
        standard: "BEP-20",
        contractAddress: "0x55d398326f99059fF775485246999027B3197955",
        confirmations: 3,
        active: true,
      },
      {
        name: "Polygon",
        standard: "Polygon",
        contractAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        confirmations: 6,
        active: true,
      },
      {
        name: "Arbitrum",
        standard: "L2",
        contractAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        confirmations: 1,
        active: true,
      },
    ],
  })

  const allAssets = [...cryptoAssets, ...fiatRails]
  const filteredAssets = allAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleNetworkUpdate = (
    asset: NetworkAsset,
    networkIndex: number,
    field: keyof AssetNetwork,
    value: string | number | boolean,
  ) => {
    setNetworkConfigs((prev) => ({
      ...prev,
      [asset]: prev[asset].map((network, index) => (index === networkIndex ? { ...network, [field]: value } : network)),
    }))
  }

  const handleRemoveNetwork = (asset: NetworkAsset, networkIndex: number) => {
    setNetworkConfigs((prev) => ({
      ...prev,
      [asset]: prev[asset].filter((_, index) => index !== networkIndex),
    }))
  }

  const handleAddNetwork = (asset: NetworkAsset, networkData: AssetNetwork) => {
    setNetworkConfigs((prev) => ({
      ...prev,
      [asset]: [...prev[asset], networkData],
    }))
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
            <h1 className="text-2xl font-bold">Asset Management</h1>
            <p className="text-muted-foreground">Manage cryptocurrencies, stablecoins, and fiat rails</p>
          </div>
        </div>
        <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>Configure a new trading asset</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Asset Symbol</Label>
                <Input placeholder="e.g., BTC" />
              </div>
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input placeholder="e.g., Bitcoin" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="stablecoin">Stablecoin</SelectItem>
                    <SelectItem value="fiat">Fiat Rail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddAsset(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddAsset(false)}>Add Asset</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              {cryptoAssets.length} crypto, {fiatRails.length} fiat
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trading</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allAssets.filter((a) => a.tradingEnabled).length}</div>
            <p className="text-xs text-muted-foreground">Assets enabled for trading</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">Across all assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allAssets.filter((a) => a.status === "maintenance").length}</div>
            <p className="text-xs text-muted-foreground">Assets under maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Management Tabs */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="trading-pairs">Trading Pairs</TabsTrigger>
          <TabsTrigger value="networks">Networks</TabsTrigger>
          <TabsTrigger value="fees">Fee Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Asset Configuration</CardTitle>
                  <CardDescription>Manage asset settings and trading parameters</CardDescription>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      className="pl-8 w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="stablecoin">Stablecoin</SelectItem>
                      <SelectItem value="fiat">Fiat</SelectItem>
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
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trading</TableHead>
                      <TableHead>Buy Fee</TableHead>
                      <TableHead>Sell Fee</TableHead>
                      <TableHead>Liquidity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.symbol}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{asset.icon}</span>
                            <div>
                              <p className="font-medium">{asset.name}</p>
                              <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {asset.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {asset.category === "fiat" ? "N/A" : `$${asset.price?.toLocaleString()}`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={asset.status === "active" ? "default" : "secondary"}
                            className={
                              asset.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch checked={asset.tradingEnabled} />
                        </TableCell>
                        <TableCell className="font-mono">{asset.buyFee}%</TableCell>
                        <TableCell className="font-mono">{asset.sellFee}%</TableCell>
                        <TableCell className="font-mono">
                          {asset.category === "fiat" ? asset.processingTime : `$${asset.liquidity}K`}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingAsset(asset)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Asset
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Networks
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Disable Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading-pairs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Pairs Management</CardTitle>
              <CardDescription>Configure available trading pairs and their parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Trading pairs configuration will be available here</p>
                <Button variant="outline" className="mt-4 bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trading Pair
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Configuration</CardTitle>
              <CardDescription>Manage blockchain networks for USDC/USDT and other multi-chain assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">USDC Networks</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingNetworks({
                            asset: "USDC",
                            networks: networkConfigs.USDC,
                          })
                        }
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Networks
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {networkConfigs.USDC.map((network, index) => (
                        <div
                          key={`${network.name}-${index}`}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{network.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {network.standard}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch checked={network.active} />
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => setShowAddNetwork("USDC")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Network
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">USDT Networks</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingNetworks({
                            asset: "USDT",
                            networks: networkConfigs.USDT,
                          })
                        }
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Networks
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {networkConfigs.USDT.map((network, index) => (
                        <div
                          key={`${network.name}-${index}`}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{network.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {network.standard}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch checked={network.active} />
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => setShowAddNetwork("USDT")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Network
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fee Configuration</CardTitle>
              <CardDescription>Set trading fees and limits for each asset category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cryptocurrency Fees</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Default Buy Fee (%)</Label>
                        <Input type="number" defaultValue="0.5" step="0.1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Default Sell Fee (%)</Label>
                        <Input type="number" defaultValue="0.5" step="0.1" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stablecoin Fees</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Default Buy Fee (%)</Label>
                        <Input type="number" defaultValue="0.25" step="0.1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Default Sell Fee (%)</Label>
                        <Input type="number" defaultValue="0.25" step="0.1" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fiat Rail Fees</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Default Buy Fee (%)</Label>
                        <Input type="number" defaultValue="2.0" step="0.1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Default Sell Fee (%)</Label>
                        <Input type="number" defaultValue="2.0" step="0.1" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-end">
                  <Button>Save Fee Configuration</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Asset Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={() => setEditingAsset(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editingAsset?.name}</DialogTitle>
            <DialogDescription>Update asset configuration and trading parameters</DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Buy Fee (%)</Label>
                <Input type="number" defaultValue={editingAsset.buyFee} step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Sell Fee (%)</Label>
                <Input type="number" defaultValue={editingAsset.sellFee} step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Minimum Amount</Label>
                <Input type="number" defaultValue={editingAsset.minAmount} step="0.001" />
              </div>
              <div className="space-y-2">
                <Label>Maximum Amount</Label>
                <Input type="number" defaultValue={editingAsset.maxAmount} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked={editingAsset.tradingEnabled} />
                <Label>Enable Trading</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingAsset(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setEditingAsset(null)}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNetworks} onOpenChange={() => setEditingNetworks(null)}>
        <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit {editingNetworks?.asset} Networks</DialogTitle>
            <DialogDescription>
              Configure blockchain networks and their parameters for {editingNetworks?.asset}
            </DialogDescription>
          </DialogHeader>
          {editingNetworks && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {networkConfigs[editingNetworks.asset as keyof typeof networkConfigs].map((network, index) => (
                  <div key={`${network.name}-${index}`} className="p-3 sm:p-4 border rounded-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="w-full sm:w-32">
                          <Label className="text-sm block sm:hidden mb-1">Network Name</Label>
                          <Input
                            value={network.name}
                            onChange={(e) => handleNetworkUpdate(editingNetworks.asset, index, "name", e.target.value)}
                            className="w-full"
                            placeholder="Network name"
                          />
                        </div>
                        <div className="w-full sm:w-32">
                          <Label className="text-sm block sm:hidden mb-1">Token Standard</Label>
                          <Select
                            value={network.standard}
                            onValueChange={(value) =>
                              handleNetworkUpdate(editingNetworks.asset, index, "standard", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ERC-20">ERC-20</SelectItem>
                              <SelectItem value="TRC-20">TRC-20</SelectItem>
                              <SelectItem value="BEP-20">BEP-20</SelectItem>
                              <SelectItem value="Polygon">Polygon</SelectItem>
                              <SelectItem value="L2">L2</SelectItem>
                              <SelectItem value="SPL">SPL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">Active</Label>
                          <Switch
                            checked={network.active}
                            onCheckedChange={(checked) =>
                              handleNetworkUpdate(editingNetworks.asset, index, "active", checked)
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNetwork(editingNetworks.asset, index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Contract Address</Label>
                        <Input
                          value={network.contractAddress}
                          onChange={(e) =>
                            handleNetworkUpdate(editingNetworks.asset, index, "contractAddress", e.target.value)
                          }
                          placeholder="0x..."
                          className="font-mono text-sm w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Min Confirmations</Label>
                        <Input
                          type="number"
                          value={network.confirmations}
                          onChange={(e) =>
                            handleNetworkUpdate(
                              editingNetworks.asset,
                              index,
                              "confirmations",
                              Number.parseInt(e.target.value),
                            )
                          }
                          className="w-full sm:w-32"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddNetwork(editingNetworks.asset)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Network
                </Button>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="outline" onClick={() => setEditingNetworks(null)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={() => setEditingNetworks(null)} className="w-full sm:w-auto">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!showAddNetwork} onOpenChange={() => setShowAddNetwork(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Network to {showAddNetwork}</DialogTitle>
            <DialogDescription>Configure a new blockchain network for {showAddNetwork}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Network Name</Label>
              <Input placeholder="e.g., Avalanche" id="network-name" />
            </div>
            <div className="space-y-2">
              <Label>Token Standard</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select token standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ERC-20">ERC-20</SelectItem>
                  <SelectItem value="TRC-20">TRC-20</SelectItem>
                  <SelectItem value="BEP-20">BEP-20</SelectItem>
                  <SelectItem value="SPL">SPL Token</SelectItem>
                  <SelectItem value="L2">Layer 2</SelectItem>
                  <SelectItem value="Polygon">Polygon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contract Address</Label>
              <Input placeholder="0x..." className="font-mono" id="contract-address" />
            </div>
            <div className="space-y-2">
              <Label>Minimum Confirmations</Label>
              <Input type="number" defaultValue="12" id="confirmations" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch defaultChecked id="network-active" />
              <Label>Enable this network</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddNetwork(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const networkName = (document.getElementById("network-name") as HTMLInputElement)?.value
                  const contractAddress = (document.getElementById("contract-address") as HTMLInputElement)?.value
                  const confirmations = Number.parseInt(
                    (document.getElementById("confirmations") as HTMLInputElement)?.value || "12",
                  )
                  const active = (document.getElementById("network-active") as HTMLInputElement)?.checked

                  if (networkName && contractAddress && showAddNetwork) {
                    const newNetwork = {
                      name: networkName,
                      standard: "ERC-20", // Default, can be enhanced to get from select
                      contractAddress,
                      confirmations,
                      active: active || true,
                    }
                    handleAddNetwork(showAddNetwork as NetworkAsset, newNetwork)
                  }
                  setShowAddNetwork(null)
                }}
              >
                Add Network
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
