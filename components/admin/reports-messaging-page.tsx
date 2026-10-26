"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Search,
  MoreHorizontal,
  Send,
  MessageSquare,
  Users,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Download,
  Calendar,
  Reply,
  Eye,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const monthlyData = [
  { month: "Jan", transactions: 1200, volume: 2400000, users: 450 },
  { month: "Feb", transactions: 1400, volume: 2800000, users: 520 },
  { month: "Mar", transactions: 1600, volume: 3200000, users: 680 },
  { month: "Apr", transactions: 1800, volume: 3600000, users: 750 },
  { month: "May", transactions: 2000, volume: 4000000, users: 890 },
  { month: "Jun", transactions: 2200, volume: 4400000, users: 1020 },
]

const assetDistribution = [
  { name: "BTC", value: 35, color: "#f7931a" },
  { name: "ETH", value: 25, color: "#627eea" },
  { name: "USDC", value: 20, color: "#2775ca" },
  { name: "SOL", value: 10, color: "#9945ff" },
  { name: "Others", value: 10, color: "#64748b" },
]

const supportTickets = [
  {
    id: "TICKET-001",
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/placeholder-32px.png",
    },
    subject: "Transaction not reflecting",
    category: "Transaction Issue",
    status: "open",
    priority: "high",
    lastMessage: "I sent BTC 2 hours ago but it's not showing in my account",
    timestamp: "2024-01-15 14:30:00",
    replies: 2,
  },
  {
    id: "TICKET-002",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/placeholder-32px.png",
    },
    subject: "KYC verification delay",
    category: "Account Verification",
    status: "in-progress",
    priority: "medium",
    lastMessage: "How long does KYC verification usually take?",
    timestamp: "2024-01-15 13:15:00",
    replies: 1,
  },
  {
    id: "TICKET-003",
    user: {
      name: "Bob Johnson",
      email: "bob@example.com",
      avatar: "/placeholder-32px.png",
    },
    subject: "Unable to withdraw funds",
    category: "Withdrawal Issue",
    status: "resolved",
    priority: "high",
    lastMessage: "Thank you for resolving the issue!",
    timestamp: "2024-01-15 12:00:00",
    replies: 4,
  },
]

const registeredUsers = [
  {
    id: "USER-001",
    name: "Alice Brown",
    email: "alice@example.com",
    avatar: "/placeholder-32px.png",
    joinDate: "2024-01-10",
    status: "active",
    kycStatus: "verified",
    totalTransactions: 15,
    totalVolume: "$45,230",
    lastActive: "2 hours ago",
  },
  {
    id: "USER-002",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    avatar: "/placeholder-32px.png",
    joinDate: "2024-01-12",
    status: "active",
    kycStatus: "pending",
    totalTransactions: 8,
    totalVolume: "$12,450",
    lastActive: "1 day ago",
  },
  {
    id: "USER-003",
    name: "Diana Prince",
    email: "diana@example.com",
    avatar: "/placeholder-32px.png",
    joinDate: "2024-01-08",
    status: "inactive",
    kycStatus: "verified",
    totalTransactions: 23,
    totalVolume: "$78,900",
    lastActive: "1 week ago",
  },
]

export function ReportsAndMessagingPage() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSendReply = () => {
    if (replyMessage.trim()) {
      console.log("Sending reply:", replyMessage)
      setReplyMessage("")
      setSelectedTicket(null)
    }
  }

  const handleSendBroadcast = () => {
    if (broadcastMessage.trim()) {
      console.log("Sending broadcast:", broadcastMessage)
      setBroadcastMessage("")
    }
  }

  const handleSendDirectMessage = () => {
    if (replyMessage.trim() && selectedUser) {
      console.log("Sending direct message to:", selectedUser.name, replyMessage)
      setReplyMessage("")
      setSelectedUser(null)
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
            <h1 className="text-2xl font-bold">Reports & Messaging</h1>
            <p className="text-muted-foreground">Analytics dashboard and user communication center</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Reports and Messaging Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="support-tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="user-messaging">User Messaging</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4.4M</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18.2%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,200</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8.7%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Support</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-yellow-600">+5</span> new tickets
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Transaction Volume</CardTitle>
                <CardDescription>Transaction volume and count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="transactions" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution</CardTitle>
                <CardDescription>Trading volume by asset type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support-tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Manage user support requests and replies</CardDescription>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
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
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
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
                      <TableHead>Ticket</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Replies</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={ticket.user.avatar || "/placeholder.svg"} alt={ticket.user.name} />
                              <AvatarFallback className="text-xs">
                                {ticket.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{ticket.user.name}</p>
                              <p className="text-xs text-muted-foreground">{ticket.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ticket.priority === "high"
                                ? "destructive"
                                : ticket.priority === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ticket.status === "resolved"
                                ? "default"
                                : ticket.status === "in-progress"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              ticket.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : ticket.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.replies}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ticket.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedTicket(ticket)}>
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View History
                              </DropdownMenuItem>
                              {ticket.status !== "resolved" && (
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Resolved
                                </DropdownMenuItem>
                              )}
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

        <TabsContent value="user-messaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Direct User Messaging</CardTitle>
              <CardDescription>Send direct messages to registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registeredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback className="text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.joinDate}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.kycStatus === "verified" ? "default" : "secondary"}
                            className={
                              user.kycStatus === "verified"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {user.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.totalTransactions}</TableCell>
                        <TableCell className="font-mono text-sm">{user.totalVolume}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.lastActive}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
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

        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Messages</CardTitle>
              <CardDescription>Send announcements to all registered users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Message Subject</Label>
                <Input placeholder="Enter message subject..." />
              </div>
              <div className="space-y-2">
                <Label>Message Content</Label>
                <Textarea
                  placeholder="Enter your broadcast message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified Users Only</SelectItem>
                    <SelectItem value="active">Active Users Only</SelectItem>
                    <SelectItem value="vip">VIP Users Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSendBroadcast} disabled={!broadcastMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Broadcast
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Support Ticket Reply Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Support Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.id} - {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={selectedTicket.user.avatar || "/placeholder.svg"}
                      alt={selectedTicket.user.name}
                    />
                    <AvatarFallback className="text-xs">
                      {selectedTicket.user.name
                        .split(" ")
                        .map((n: string) => n[0] ?? "")
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedTicket.user.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTicket.user.email}</p>
                  </div>
                </div>
                <p className="text-sm">{selectedTicket.lastMessage}</p>
              </div>
              <div className="space-y-2">
                <Label>Your Reply</Label>
                <Textarea
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Direct Message Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Direct Message</DialogTitle>
            <DialogDescription>Send a message to {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                  <AvatarFallback>
                    {selectedUser.name
                      .split(" ")
                      .map((n: string) => n[0] ?? "")
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSendDirectMessage} disabled={!replyMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
