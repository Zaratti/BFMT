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
import { Textarea } from "@/components/ui/textarea"
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
  ArrowLeft,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import Link from "next/link"

const systemAccounts = [
  {
    id: "bank-001",
    type: "bank",
    name: "Primary Bank Account",
    provider: "Access Bank",
    accountName: "Bifimoto Exchange Limited",
    accountNumber: "1234567890",
    currency: "NGN",
    status: "active",
    isDefault: true,
    balance: "₦45,678,900",
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    id: "bank-002",
    type: "bank",
    name: "Secondary Bank Account",
    provider: "GTBank",
    accountName: "Bifimoto Exchange Limited",
    accountNumber: "0987654321",
    currency: "NGN",
    status: "active",
    isDefault: false,
    balance: "₦12,345,600",
    lastUpdated: "2024-01-15 12:00:00",
  },
  {
    id: "paypal-001",
    type: "fiat",
    name: "PayPal Business Account",
    provider: "PayPal",
    email: "business@bifimoto.com",
    currency: "USD",
    status: "active",
    isDefault: true,
    balance: "$125,430",
    lastUpdated: "2024-01-15 13:45:00",
  },
  {
    id: "skrill-001",
    type: "fiat",
    name: "Skrill Business Account",
    provider: "Skrill",
    email: "payments@bifimoto.com",
    currency: "USD",
    status: "active",
    isDefault: false,
    balance: "$67,890",
    lastUpdated: "2024-01-15 11:20:00",
  },
  {
    id: "neteller-001",
    type: "fiat",
    name: "Neteller Business Account",
    provider: "Neteller",
    email: "finance@bifimoto.com",
    currency: "USD",
    status: "maintenance",
    isDefault: false,
    balance: "$23,456",
    lastUpdated: "2024-01-14 16:30:00",
  },
]

const cryptoWallets = [
  {
    id: "btc-001",
    type: "crypto",
    name: "Bitcoin Hot Wallet",
    asset: "BTC",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    network: "Bitcoin",
    status: "active",
    isDefault: true,
    balance: "12.45678 BTC",
    usdValue: "$836,789",
    lastUpdated: "2024-01-15 14:30:00",
  },
  {
    id: "eth-001",
    type: "crypto",
    name: "Ethereum Hot Wallet",
    asset: "ETH",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    network: "Ethereum",
    status: "active",
    isDefault: true,
    balance: "234.567 ETH",
    usdValue: "$810,234",
    lastUpdated: "2024-01-15 14:25:00",
  },
  {
    id: "usdc-001",
    type: "crypto",
    name: "USDC Treasury Wallet",
    asset: "USDC",
    address: "0x8ba1f109551bD432803012645Hac136c22C57592",
    network: "Ethereum",
    status: "active",
    isDefault: true,
    balance: "456,789 USDC",
    usdValue: "$456,789",
    lastUpdated: "2024-01-15 14:20:00",
  },
]

export function SystemAccountsPage() {
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const [selectedTab, setSelectedTab] = useState("bank")

  const [accounts, setAccounts] = useState(systemAccounts)
  const [wallets, setWallets] = useState(cryptoWallets)
  const [formData, setFormData] = useState({
    accountType: "",
    accountName: "",
    provider: "",
    accountNumber: "",
    email: "",
    walletAddress: "",
    asset: "",
    network: "",
    currency: "NGN",
  })

  const toggleSensitive = (id: string) => {
    setShowSensitive((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const resetForm = () => {
    setFormData({
      accountType: "",
      accountName: "",
      provider: "",
      accountNumber: "",
      email: "",
      walletAddress: "",
      asset: "",
      network: "",
      currency: "NGN",
    })
  }

  const handleAddAccount = () => {
    console.log("[v0] Adding account with data:", formData)

    if (!formData.accountType || !formData.accountName) {
      alert("Please fill in all required fields")
      return
    }

    const newId = `${formData.accountType}-${Date.now()}`
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19)

    if (formData.accountType === "crypto") {
      if (!formData.walletAddress || !formData.asset) {
        alert("Please fill in wallet address and asset")
        return
      }

      const newWallet = {
        id: newId,
        type: "crypto",
        name: formData.accountName,
        asset: formData.asset.toUpperCase(),
        address: formData.walletAddress,
        network: formData.network || formData.asset,
        status: "active",
        isDefault: false,
        balance: "0 " + formData.asset.toUpperCase(),
        usdValue: "$0",
        lastUpdated: timestamp,
      }

      console.log("[v0] Adding new crypto wallet:", newWallet)
      setWallets((prev) => [...prev, newWallet])
      setSelectedTab("crypto")
    } else {
      const newAccount = {
        id: newId,
        type: formData.accountType === "bank" ? "bank" : "fiat",
        name: formData.accountName,
        provider: formData.provider,
        ...(formData.accountType === "bank"
          ? {
              accountName: formData.accountName,
              accountNumber: formData.accountNumber,
              currency: formData.currency,
            }
          : {
              email: formData.email,
              currency: "USD",
            }),
        status: "active",
        isDefault: false,
        balance: formData.accountType === "bank" ? "₦0" : "$0",
        lastUpdated: timestamp,
      }

      console.log("[v0] Adding new account:", newAccount)
      setAccounts((prev) => [...prev, newAccount])
      setSelectedTab(formData.accountType === "bank" ? "bank" : "fiat")
    }

    resetForm()
    setShowAddAccount(false)
  }

  const getFieldLabel = () => {
    switch (formData.accountType) {
      case "crypto":
        return "Wallet Address"
      case "bank":
        return "Account Name"
      default:
        return "Account Name"
    }
  }

  const getFieldPlaceholder = () => {
    switch (formData.accountType) {
      case "crypto":
        return "Enter wallet address"
      case "bank":
        return "e.g., Primary Bank Account"
      default:
        return "e.g., Primary Bank Account"
    }
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
            <h1 className="text-2xl font-bold">System Account Management</h1>
            <p className="text-muted-foreground">Manage system accounts for receiving payments and crypto wallets</p>
          </div>
        </div>
        <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add System Account</DialogTitle>
              <DialogDescription>Configure a new system account for payments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, accountType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="skrill">Skrill</SelectItem>
                    <SelectItem value="neteller">Neteller</SelectItem>
                    <SelectItem value="crypto">Crypto Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{getFieldLabel()}</Label>
                {formData.accountType === "crypto" ? (
                  <Textarea
                    placeholder={getFieldPlaceholder()}
                    value={formData.walletAddress}
                    onChange={(e) => setFormData((prev) => ({ ...prev, walletAddress: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <Input
                    placeholder={getFieldPlaceholder()}
                    value={formData.accountName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accountName: e.target.value }))}
                  />
                )}
              </div>

              {formData.accountType === "crypto" && (
                <>
                  <div className="space-y-2">
                    <Label>Wallet Name</Label>
                    <Input
                      placeholder="e.g., Solana Hot Wallet"
                      value={formData.accountName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, accountName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset</Label>
                    <Select
                      value={formData.asset}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, asset: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sol">Solana (SOL)</SelectItem>
                        <SelectItem value="ton">Toncoin (TON)</SelectItem>
                        <SelectItem value="usdt">Tether (USDT)</SelectItem>
                        <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                        <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Input
                      placeholder="e.g., Solana, Ethereum, TON"
                      value={formData.network}
                      onChange={(e) => setFormData((prev) => ({ ...prev, network: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {formData.accountType === "bank" && (
                <>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      placeholder="e.g., Access Bank"
                      value={formData.provider}
                      onChange={(e) => setFormData((prev) => ({ ...prev, provider: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Enter account number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {(formData.accountType === "paypal" ||
                formData.accountType === "skrill" ||
                formData.accountType === "neteller") && (
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setShowAddAccount(false)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAccount}>Add Account</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length + wallets.length}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length} fiat, {wallets.length} crypto
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...accounts, ...wallets].filter((a) => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.1M</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...accounts, ...wallets].filter((a) => a.status === "maintenance").length}
            </div>
            <p className="text-xs text-muted-foreground">Under maintenance</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
          <TabsTrigger value="fiat">Fiat Rails</TabsTrigger>
          <TabsTrigger value="crypto">Crypto Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="bank" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Configuration</CardTitle>
              <CardDescription>Manage bank accounts for receiving NGN payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Account Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts
                      .filter((acc) => acc.type === "bank")
                      .map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{account.name}</p>
                                <p className="text-sm text-muted-foreground">{account.currency}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{account.provider}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{account.accountName}</p>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm">
                                  {showSensitive[account.id] ? account.accountNumber : "••••••••••"}
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => toggleSensitive(account.id)}>
                                  {showSensitive[account.id] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => account.accountNumber && copyToClipboard(account.accountNumber)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={account.status === "active" ? "default" : "secondary"}
                              className={
                                account.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch checked={account.isDefault} />
                          </TableCell>
                          <TableCell className="font-mono">{account.balance}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setEditingAccount(account)}>
                              <Edit className="h-4 w-4" />
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

        <TabsContent value="fiat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fiat Rail Configuration</CardTitle>
              <CardDescription>Manage PayPal, Skrill, and Neteller accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts
                      .filter((acc) => acc.type === "fiat")
                      .map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{account.name}</p>
                                <p className="text-sm text-muted-foreground">{account.currency}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{account.provider}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm">
                                {showSensitive[account.id] ? account.email : "••••••@••••••.com"}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => toggleSensitive(account.id)}>
                                {showSensitive[account.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.email!)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={account.status === "active" ? "default" : "secondary"}
                              className={
                                account.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch checked={account.isDefault} />
                          </TableCell>
                          <TableCell className="font-mono">{account.balance}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setEditingAccount(account)}>
                              <Edit className="h-4 w-4" />
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

        <TabsContent value="crypto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crypto Wallet Configuration</CardTitle>
              <CardDescription>Manage cryptocurrency wallets for receiving digital assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>USD Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Wallet className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{wallet.name}</p>
                              <p className="text-sm text-muted-foreground">{wallet.asset}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{wallet.asset}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm max-w-32 truncate">
                              {showSensitive[wallet.id]
                                ? wallet.address
                                : `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => toggleSensitive(wallet.id)}>
                              {showSensitive[wallet.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(wallet.address)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{wallet.network}</TableCell>
                        <TableCell>
                          <Badge
                            variant={wallet.status === "active" ? "default" : "secondary"}
                            className={
                              wallet.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {wallet.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{wallet.balance}</TableCell>
                        <TableCell className="font-mono text-sm">{wallet.usdValue}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setEditingAccount(wallet)}>
                            <Edit className="h-4 w-4" />
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
      </Tabs>

      {/* Edit Account Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editingAccount?.name}</DialogTitle>
            <DialogDescription>Update account configuration and settings</DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input defaultValue={editingAccount.name} />
              </div>
              {editingAccount.type === "bank" && (
                <>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input defaultValue={editingAccount.accountName} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input defaultValue={editingAccount.accountNumber} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input defaultValue={editingAccount.provider} />
                  </div>
                </>
              )}
              {editingAccount.type === "fiat" && (
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue={editingAccount.email} />
                </div>
              )}
              {editingAccount.type === "crypto" && (
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Textarea defaultValue={editingAccount.address} rows={3} />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch defaultChecked={editingAccount.status === "active"} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked={editingAccount.isDefault} />
                <Label>Set as Default</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingAccount(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setEditingAccount(null)}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
