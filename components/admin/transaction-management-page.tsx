"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const transactionData = [
  {
    id: "TXN-001",
    type: "buy",
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder-32px.png",
    },
    asset: "BTC",
    amount: "0.5",
    usdValue: "33617.00",
    ngnValue: "55,467,050",
    fee: "168.09",
    status: "pending",
    paymentProof: "proof_001.pdf",
    walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    network: "Bitcoin",
    timestamp: "2024-01-15 14:30:00",
    adminNotes: "",
  },
  {
    id: "TXN-002",
    type: "sell",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder-32px.png",
    },
    asset: "ETH",
    amount: "2.0",
    usdValue: "6912.00",
    ngnValue: "11,404,800",
    fee: "34.56",
    status: "completed",
    paymentProof: "proof_002.jpg",
    bankDetails: {
      accountName: "Jane Smith",
      bankName: "Access Bank",
      accountNumber: "1234567890",
    },
    network: "Ethereum",
    timestamp: "2024-01-15 13:15:00",
    adminNotes: "Verified and processed",
  },
  {
    id: "TXN-003",
    type: "buy",
    user: {
      name: "Bob Johnson",
      email: "bob@example.com",
      avatar: "/placeholder-32px.png",
    },
    asset: "USDC",
    amount: "1000",
    usdValue: "1000.00",
    ngnValue: "1,650,000",
    fee: "2.50",
    status: "rejected",
    paymentProof: "proof_003.png",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    network: "Ethereum",
    timestamp: "2024-01-15 12:00:00",
    adminNotes: "Invalid payment proof",
  },
  {
    id: "TXN-004",
    type: "sell",
    user: {
      name: "Alice Brown",
      email: "alice@example.com",
      avatar: "/placeholder-32px.png",
    },
    asset: "SOL",
    amount: "50",
    usdValue: "8900.00",
    ngnValue: "14,685,000",
    fee: "44.50",
    status: "processing",
    paymentProof: "proof_004.pdf",
    bankDetails: {
      accountName: "Alice Brown",
      bankName: "GTBank",
      accountNumber: "0987654321",
    },
    network: "Solana",
    timestamp: "2024-01-15 11:45:00",
    adminNotes: "Awaiting bank transfer",
  },
]

const transactionStats = [
  {
    name: "Total Transactions",
    value: "1,247",
    change: "+12.5%",
    changeType: "increase" as const,
    icon: TrendingUp,
  },
  {
    name: "Pending Approval",
    value: "23",
    change: "+5",
    changeType: "increase" as const,
    icon: Clock,
  },
  {
    name: "Daily Volume",
    value: "$2.4M",
    change: "+18.2%",
    changeType: "increase" as const,
    icon: DollarSign,
  },
  {
    name: "Success Rate",
    value: "94.2%",
    change: "+2.1%",
    changeType: "increase" as const,
    icon: Check,
  },
]

export function TransactionManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [bulkSelected, setBulkSelected] = useState<string[]>([])

  const filteredTransactions = transactionData.filter((transaction) => {
    const matchesSearch =
      transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.asset.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for transactions:`, bulkSelected)
    setBulkSelected([])
  }

  const handleTransactionAction = (transactionId: string, action: string) => {
    console.log(`${action} transaction:`, transactionId)
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
            <h1 className="text-2xl font-bold">Transaction Management</h1>
            <p className="text-muted-foreground">Monitor and manage all user transactions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {transactionStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.changeType === "increase" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction Management */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Transaction Overview</CardTitle>
                  <CardDescription>Monitor all buy and sell transactions</CardDescription>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8 w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Bulk Actions */}
              {bulkSelected.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-4">
                  <span className="text-sm font-medium">{bulkSelected.length} transactions selected</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleBulkAction("approve")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("reject")}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setBulkSelected([])}>
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkSelected(filteredTransactions.map((t) => t.id))
                            } else {
                              setBulkSelected([])
                            }
                          }}
                          checked={
                            bulkSelected.length === filteredTransactions.length && filteredTransactions.length > 0
                          }
                        />
                      </TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Value (NGN)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={bulkSelected.includes(transaction.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelected([...bulkSelected, transaction.id])
                              } else {
                                setBulkSelected(bulkSelected.filter((id) => id !== transaction.id))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={transaction.user.avatar || "/placeholder.svg"}
                                alt={transaction.user.name}
                              />
                              <AvatarFallback className="text-xs">
                                {transaction.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{transaction.user.name}</p>
                              <p className="text-xs text-muted-foreground">{transaction.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "buy" ? "default" : "secondary"}>
                            {transaction.type === "buy" ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {transaction.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.asset}</TableCell>
                        <TableCell className="font-mono text-sm">{transaction.amount}</TableCell>
                        <TableCell className="font-mono text-sm">₦{transaction.ngnValue}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : transaction.status === "pending"
                                  ? "secondary"
                                  : transaction.status === "processing"
                                    ? "outline"
                                    : "destructive"
                            }
                            className={
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : transaction.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedTransaction(transaction)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {transaction.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleTransactionAction(transaction.id, "approve")}
                                    className="text-green-600"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleTransactionAction(transaction.id, "reject")}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Proof
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

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>Transactions awaiting admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Pending transactions will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Transactions</CardTitle>
              <CardDescription>Transactions currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Processing transactions will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Transactions</CardTitle>
              <CardDescription>Successfully completed transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Completed transactions will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.id} - {selectedTransaction?.type.toUpperCase()} {selectedTransaction?.asset}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">User Information</Label>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedTransaction.user.avatar || "/placeholder.svg"}
                          alt={selectedTransaction.user.name}
                        />
                        <AvatarFallback>
                          {selectedTransaction.user.name
                            .split(" ")
                            .map((n: string) => n[0] ?? "")
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedTransaction.user.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedTransaction.user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Transaction Status</Label>
                  <div className="p-3 border rounded-lg">
                    <Badge
                      variant={
                        selectedTransaction.status === "completed"
                          ? "default"
                          : selectedTransaction.status === "pending"
                            ? "secondary"
                            : selectedTransaction.status === "processing"
                              ? "outline"
                              : "destructive"
                      }
                      className={
                        selectedTransaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : selectedTransaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedTransaction.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }
                    >
                      {selectedTransaction.status.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTransaction.timestamp}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Transaction Details</Label>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Asset</p>
                      <p className="font-medium">{selectedTransaction.asset}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">{selectedTransaction.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">USD Value</p>
                      <p className="font-medium">${selectedTransaction.usdValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">NGN Value</p>
                      <p className="font-medium">₦{selectedTransaction.ngnValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fee</p>
                      <p className="font-medium">${selectedTransaction.fee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Network</p>
                      <p className="font-medium">{selectedTransaction.network}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTransaction.type === "buy" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Wallet Address</Label>
                  <div className="p-3 border rounded-lg">
                    <p className="font-mono text-sm break-all">{selectedTransaction.walletAddress}</p>
                  </div>
                </div>
              )}

              {selectedTransaction.type === "sell" && selectedTransaction.bankDetails && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bank Details</Label>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Account Name</p>
                        <p className="font-medium">{selectedTransaction.bankDetails.accountName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Name</p>
                        <p className="font-medium">{selectedTransaction.bankDetails.bankName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium font-mono">{selectedTransaction.bankDetails.accountNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Proof</Label>
                <div className="p-3 border rounded-lg">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download {selectedTransaction.paymentProof}
                  </Button>
                </div>
              </div>

              {selectedTransaction.adminNotes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm">{selectedTransaction.adminNotes}</p>
                  </div>
                </div>
              )}

              {selectedTransaction.status === "pending" && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleTransactionAction(selectedTransaction.id, "reject")}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleTransactionAction(selectedTransaction.id, "approve")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
