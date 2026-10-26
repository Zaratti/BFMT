"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Menu, Send, MessageCircle, Bell, ArrowLeft, Home, Activity } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface SupportPageProps {
  onMenuClick?: () => void
}

export function SupportPage({ onMenuClick }: SupportPageProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [requestType, setRequestType] = useState("")

  const handleSubmitRequest = () => {
    if (subject.trim() && message.trim() && requestType) {
      // Handle submitting request
      console.log("Submitting request:", { subject, message, requestType })
      setSubject("")
      setMessage("")
      setRequestType("")
    }
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
              <h1 className="text-xl font-serif font-bold text-foreground">Support</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User Profile" />
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-2 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Support</span>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Send us your messages, suggestions, or complaints. Our team will respond as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Request Type</label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">General Message</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="account">Account Issue</SelectItem>
                  <SelectItem value="trading">Trading Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subject</label>
              <Input
                placeholder="Brief description of your request"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message</label>
              <Textarea
                placeholder="Please provide detailed information about your request..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
              <Button
                onClick={handleSubmitRequest}
                disabled={!subject.trim() || !message.trim() || !requestType}
                className="bg-accent hover:bg-accent/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4 mt-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              View Transactions
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
