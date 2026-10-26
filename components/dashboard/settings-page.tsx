"use client"

import type React from "react"

import { useState } from "react"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Check, X, Mail, Phone, User, Shield, Home, Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function SettingsPage() {
  const [username, setUsername] = useState("johndoe")
  const [email, setEmail] = useState("john@example.com")
  const [phone, setPhone] = useState("+1 (555) 123-4567")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

  const handleUsernameUpdate = () => {
    console.log("Updating username to:", username)
    // Handle username update logic
  }

  const handleEmailUpdate = () => {
    console.log("Updating email to:", email)
    // Handle email update logic
  }

  const handleEmailVerification = () => {
    console.log("Sending verification email")
    // Handle email verification logic
    setIsEmailVerified(true)
  }

  const handlePhoneUpdate = () => {
    console.log("Updating phone to:", phone)
    // Handle phone update logic
  }

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      console.log("Profile picture selected:", file.name)
      // Handle file upload logic
    }
  }

  return (
    <UserDashboard>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Settings</span>
        </div>

        <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Account Settings</h1>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Profile Picture</CardTitle>
              <CardDescription className="text-muted-foreground">
                Upload and manage your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
                  <AvatarFallback className="bg-accent text-accent-foreground text-lg">JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <label htmlFor="profile-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Picture
                      </span>
                    </Button>
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <User className="h-5 w-5 mr-2" />
                Username
              </CardTitle>
              <CardDescription className="text-muted-foreground">Change your username</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex space-x-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter new username"
                  />
                  <Button variant="outline" size="sm" onClick={handleUsernameUpdate}>
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Address
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your email and verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                  {isEmailVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <X className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleEmailUpdate}>
                  Update Email
                </Button>
                {!isEmailVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 hover:bg-green-100"
                    onClick={handleEmailVerification}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Email
                  </Button>
                )}
              </div>
              {!isEmailVerified && (
                <p className="text-sm text-amber-600">
                  Please verify your email to avoid account restrictions and ensure security.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Phone Number
              </CardTitle>
              <CardDescription className="text-muted-foreground">Update your phone number for security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                  <Button variant="outline" size="sm" onClick={handlePhoneUpdate}>
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Security</CardTitle>
              <CardDescription className="text-muted-foreground">Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-card-foreground">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-card-foreground">Change Password</Label>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-card border-border border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription className="text-muted-foreground">Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-card-foreground">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
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
        </div>
      </div>
    </UserDashboard>
  )
}
