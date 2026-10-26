"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Menu,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Search,
  MoreHorizontal,
  Plus,
  DollarSign,
  TrendingUp,
  Bell,
  Filter,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSelector } from "@/components/language-selector"

interface AdminMainContentProps {
  onMenuClick: () => void
}

const adminStats = [
  {
    name: "Total Users",
    value: "12,847",
    change: "+12.5%",
    changeType: "increase" as const,
    icon: Users,
  },
  {
    name: "Daily Volume",
    value: "$2.4M",
    change: "+18.2%",
    changeType: "increase" as const,
    icon: DollarSign,
  },
  {
    name: "Active Trades",
    value: "1,234",
    change: "+8.7%",
    changeType: "increase" as const,
    icon: TrendingUp,
  },
  {
    name: "System Status",
    value: "99.9%",
    change: "Operational",
    changeType: "increase" as const,
    icon: CheckCircle,
  },
]

const userData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Trader",
    status: "Active",
    balance: "$12,450.32",
    lastLogin: "2 hours ago",
    kycStatus: "Verified",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "VIP Trader",
    status: "Active",
    balance: "$89,234.56",
    lastLogin: "1 day ago",
    kycStatus: "Verified",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Trader",
    status: "Inactive",
    balance: "$1,234.00",
    lastLogin: "1 week ago",
    kycStatus: "Pending",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Pro Trader",
    status: "Active",
    balance: "$45,678.90",
    lastLogin: "3 hours ago",
    kycStatus: "Verified",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Trader",
    status: "Suspended",
    balance: "$567.89",
    lastLogin: "2 weeks ago",
    kycStatus: "Rejected",
  },
]

export function AdminMainContent({ onMenuClick }: AdminMainContentProps) {
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
              <span className="hidden sm:inline text-sm text-muted-foreground">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">AD</AvatarFallback>
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
                <h2 className="text-2xl font-bold text-foreground mb-2">Exchange Overview</h2>
                <p className="text-muted-foreground">Monitor platform performance and user activity</p>
              </div>
              <div className="hidden sm:block">
                <Activity className="h-12 w-12 text-accent/60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {adminStats.map((stat) => (
            <Card key={stat.name} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.changeType === "increase" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>
                  {stat.name !== "System Status" && <span className="ml-1">from last month</span>}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Asset Control Panel</CardTitle>
              <CardDescription className="text-muted-foreground">Manage trading pairs and assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                    <DialogDescription>Configure a new trading asset with wallet addresses</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Asset Symbol</Label>
                      <Input placeholder="e.g., BTC, ETH, SOL" />
                    </div>
                    <div className="space-y-2">
                      <Label>Asset Name</Label>
                      <Input placeholder="e.g., Bitcoin, Ethereum, Solana" />
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
                    <div className="space-y-2">
                      <Label>Admin Receiving Wallet Address</Label>
                      <Textarea placeholder="Enter admin wallet address for receiving this asset" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Admin Email (for fiat rails)</Label>
                      <Input type="email" placeholder="admin@bifimoto.com" />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Add Asset</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Manage Trading Pairs
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Manage Trading Pairs</DialogTitle>
                    <DialogDescription>Configure available trading pairs and their parameters</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base Asset</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select base" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                            <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                            <SelectItem value="usdt">Tether (USDT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quote Asset</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quote" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ngn">Nigerian Naira</SelectItem>
                            <SelectItem value="usd">US Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Trade Amount</Label>
                      <Input type="number" placeholder="0.001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Trade Amount</Label>
                      <Input type="number" placeholder="100" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Enable Trading Pair</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save Trading Pair</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    System Maintenance
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>System Maintenance</DialogTitle>
                    <DialogDescription>Configure system maintenance and emergency controls</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Enable Maintenance Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label className="text-red-600">Emergency Stop (Disable All Trading)</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Maintenance Message</Label>
                      <Textarea placeholder="System is under maintenance. Please try again later." />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive">Apply Maintenance</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">Administrative controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Approve Pending</Button>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent">
                  Reject Selected
                </Button>
                <Button variant="outline">Export Reports</Button>
                <Button variant="outline">System Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-card-foreground">User Management</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage trader accounts and KYC verification
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-8 w-full sm:w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-card-foreground">User</TableHead>
                    <TableHead className="text-card-foreground">Role</TableHead>
                    <TableHead className="text-card-foreground">Balance</TableHead>
                    <TableHead className="text-card-foreground">Status</TableHead>
                    <TableHead className="text-card-foreground">KYC</TableHead>
                    <TableHead className="text-card-foreground">Last Login</TableHead>
                    <TableHead className="text-card-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder-32px.png?height=32&width=32`} alt={user.name} />
                            <AvatarFallback className="text-xs">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-card-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "VIP Trader"
                              ? "default"
                              : user.role === "Pro Trader"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{user.balance}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "Active"
                              ? "default"
                              : user.status === "Inactive"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            user.status === "Active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : user.status === "Inactive"
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                : ""
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.kycStatus === "Verified"
                              ? "default"
                              : user.kycStatus === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            user.kycStatus === "Verified"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : user.kycStatus === "Pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {user.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.lastLogin}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Transaction History</DropdownMenuItem>
                            <DropdownMenuItem>KYC Documents</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuItem className="text-green-600">
                              {user.kycStatus === "Pending" ? "Approve KYC" : "Verified"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              {user.status === "Suspended" ? "Unsuspend" : "Suspend"} User
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
      </main>
    </div>
  )
}
