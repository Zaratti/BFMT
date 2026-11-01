"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import type { SocialProvider } from "@/src/modules/identity/domain/authentication"
import { getBrowserIdentityAuthentication } from "@/src/modules/identity/composition/browser"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [privacyPolicyChecked, setPrivacyPolicyChecked] = useState(false)
  const [termsChecked, setTermsChecked] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    if (!privacyPolicyChecked || !termsChecked) {
      setErrorMessage("Please agree to the Privacy Policy and Terms & Conditions to continue.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Your passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      const acceptedAt = new Date().toISOString()
      const result = await getBrowserIdentityAuthentication().signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        username: formData.username,
        privacyPolicyAcceptedAt: acceptedAt,
        termsAcceptedAt: acceptedAt,
        emailRedirectTo: new URL("/auth/callback?next=/dashboard", window.location.origin).toString(),
      })

      if (result.error) {
        setErrorMessage(result.error)
        setIsSubmitting(false)
        return
      }

      window.location.assign(result.emailConfirmationRequired ? "/verification-pending" : "/dashboard")
    } catch {
      setErrorMessage("Sign up is unavailable. Check the Supabase configuration and try again.")
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialSignUp = async (provider: SocialProvider) => {
    setErrorMessage(null)
    if (!privacyPolicyChecked || !termsChecked) {
      setErrorMessage("Please agree to the Privacy Policy and Terms & Conditions to continue.")
      return
    }

    setIsSubmitting(true)
    try {
      const redirectUrl = new URL("/auth/callback", window.location.origin)
      redirectUrl.searchParams.set("next", "/dashboard")
      const result = await getBrowserIdentityAuthentication().signInWithProvider(provider, redirectUrl.toString())
      if (result.error) {
        setErrorMessage(result.error)
        setIsSubmitting(false)
      }
    } catch {
      setErrorMessage("Social sign up is unavailable. Check the Supabase configuration and try again.")
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
        <CardTitle className="text-2xl font-serif font-bold text-card-foreground">Join Bifimoto</CardTitle>
        <CardDescription className="text-muted-foreground">Start your crypto trading journey today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy-policy"
              checked={privacyPolicyChecked}
              onCheckedChange={(checked) => setPrivacyPolicyChecked(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="privacy-policy" className="text-sm text-card-foreground leading-relaxed cursor-pointer">
              <span className="text-destructive">*</span> I agree to the{" "}
              <Link href="/privacy-policy" className="text-accent hover:text-accent/80 underline">
                Privacy Policy
              </Link>{" "}
              and confirm all the information I have given is true.
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-conditions"
              checked={termsChecked}
              onCheckedChange={(checked) => setTermsChecked(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="terms-conditions" className="text-sm text-card-foreground leading-relaxed cursor-pointer">
              <span className="text-destructive">*</span> I agree to the{" "}
              <Link href="/terms-of-service" className="text-accent hover:text-accent/80 underline">
                Terms & Conditions
              </Link>{" "}
              and confirm that I am at least eighteen (18) or older.
            </label>
          </div>
        </div>

        <SocialAuthButtons onSelect={handleSocialSignUp} disabled={isSubmitting} />

        {errorMessage && <p role="alert" className="mb-4 text-sm text-destructive">{errorMessage}</p>}

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-card-foreground font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="bg-input border-border focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-card-foreground font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="bg-input border-border focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-card-foreground font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="bg-input border-border focus:ring-accent focus:border-accent pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isSubmitting ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-accent hover:text-accent/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
