"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff } from "lucide-react"
import type { SocialProvider } from "@/src/modules/identity/domain/authentication"
import { getBrowserIdentityAuthentication } from "@/src/modules/identity/composition/browser"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("error")) {
      setErrorMessage("We couldn’t complete social sign in. Please try again.")
    }
  }, [])

  const getNextPath = () => {
    const next = new URLSearchParams(window.location.search).get("next")
    if (!next?.startsWith("/")) return "/dashboard"
    const destination = new URL(next, window.location.origin)
    return destination.origin === window.location.origin
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : "/dashboard"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const result = await getBrowserIdentityAuthentication().signIn(email, password)
      if (result.error) {
        setErrorMessage(result.error)
        setIsSubmitting(false)
        return
      }
      window.location.assign(getNextPath())
    } catch {
      setErrorMessage("Sign in is unavailable. Check the Supabase configuration and try again.")
      setIsSubmitting(false)
    }
  }

  const handleSocialSignIn = async (provider: SocialProvider) => {
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      const redirectUrl = new URL("/auth/callback", window.location.origin)
      redirectUrl.searchParams.set("next", getNextPath())
      const result = await getBrowserIdentityAuthentication().signInWithProvider(provider, redirectUrl.toString())
      if (result.error) {
        setErrorMessage(result.error)
        setIsSubmitting(false)
      }
    } catch {
      setErrorMessage("Social sign in is unavailable. Check the Supabase configuration and try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="text-2xl font-serif font-bold text-foreground">
              Bifimoto
            </Link>
          </Button>
        </div>
        <CardTitle className="text-2xl font-serif font-bold text-card-foreground">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground">Sign in to continue trading</CardDescription>
      </CardHeader>
      <CardContent>
        <SocialAuthButtons onSelect={handleSocialSignIn} disabled={isSubmitting} />

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with credentials</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-card-foreground font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border focus:ring-accent focus:border-accent pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-accent hover:text-accent/80 transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSubmitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/sign-up" className="text-accent hover:text-accent/80 transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
