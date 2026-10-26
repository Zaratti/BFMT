"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle forgot password logic here
    console.log("Reset password for:", email)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="text-2xl font-serif font-bold text-foreground">
                ProApp
              </Link>
            </Button>
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-card-foreground">Check your email</CardTitle>
          <CardDescription className="text-muted-foreground">
            We've sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)} className="border-border bg-transparent">
              Try again
            </Button>
          </div>
          <div className="text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="text-2xl font-serif font-bold text-foreground">
              ProApp
            </Link>
          </Button>
        </div>
        <CardTitle className="text-2xl font-serif font-bold text-card-foreground">Reset your password</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
