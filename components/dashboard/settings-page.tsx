"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Check, X, Mail, Phone, User, Shield, Home, Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getBrowserIdentityAuthentication } from "@/src/modules/identity/composition/browser"
import type {
  AdminTransactionPasswordStatus,
  AuthenticatedIdentity,
  PhoneMfaFactor,
} from "@/src/modules/identity/domain/authentication"

export function SettingsPage() {
  const [identity, setIdentity] = useState<AuthenticatedIdentity | null>(null)
  const [factors, setFactors] = useState<PhoneMfaFactor[]>([])
  const [username, setUsername] = useState("")
  const [phone, setPhone] = useState("")
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null)
  const [pendingChallengeId, setPendingChallengeId] = useState<string | null>(null)
  const [enrollmentCode, setEnrollmentCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordCode, setPasswordCode] = useState("")
  const [passwordChallengeId, setPasswordChallengeId] = useState<string | null>(null)
  const [disableCode, setDisableCode] = useState("")
  const [disableChallengeId, setDisableChallengeId] = useState<string | null>(null)
  const [transactionPasswordStatus, setTransactionPasswordStatus] =
    useState<AdminTransactionPasswordStatus | null>(null)
  const [currentTransactionPassword, setCurrentTransactionPassword] = useState("")
  const [transactionPassword, setTransactionPassword] = useState("")
  const [confirmTransactionPassword, setConfirmTransactionPassword] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const authentication = useMemo(() => getBrowserIdentityAuthentication(), [])
  const verifiedPhoneFactor = factors.find((factor) => factor.verified) ?? null

  useEffect(() => {
    let active = true

    async function loadAccount() {
      try {
        const [currentIdentity, factorResult] = await Promise.all([
          authentication.getCurrentIdentity(),
          authentication.listPhoneMfaFactors(),
        ])

        if (!active) return
        if (!currentIdentity) {
          setErrorMessage("Your account session could not be verified. Please sign in again.")
          return
        }

        setIdentity(currentIdentity)
        setUsername(currentIdentity.username ?? "")
        setFactors(factorResult.factors)
        if (currentIdentity.role === "admin") {
          const status = await authentication.getAdminTransactionPasswordStatus()
          if (active) setTransactionPasswordStatus(status)
        }
        if (factorResult.error) setErrorMessage(factorResult.error)
        const unverified = factorResult.factors.find((factor) => !factor.verified)
        if (unverified) {
          setPendingFactorId(unverified.id)
          setPhone(unverified.phone)
        } else if (factorResult.factors.find((factor) => factor.verified)) {
          setPhone(factorResult.factors.find((factor) => factor.verified)?.phone ?? "")
        }
      } catch (error) {
        if (active) {
          console.error("Could not load account settings.", error)
          setErrorMessage("Account settings could not be loaded. Please try again.")
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadAccount()
    return () => {
      active = false
    }
  }, [authentication])

  const clearMessages = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const updateUsername = async () => {
    clearMessages()
    const normalizedUsername = username.trim()
    if (!normalizedUsername) {
      setErrorMessage("Enter a username.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authentication.updateUsername(normalizedUsername)
      if (result.error) {
        setErrorMessage(result.error)
        return
      }
      setUsername(normalizedUsername)
      setIdentity((current) => current ? { ...current, username: normalizedUsername } : current)
      setSuccessMessage("Username updated.")
    } catch (error) {
      console.error("Could not update username.", error)
      setErrorMessage("Username could not be updated. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendPhoneChallenge = async (factorId: string) => {
    clearMessages()
    setIsSubmitting(true)
    try {
      const result = await authentication.challengePhoneMfa(factorId)
      if (result.error || !result.challengeId) {
        setErrorMessage(result.error ?? "Could not send a verification code.")
        return null
      }
      return result.challengeId
    } catch (error) {
      console.error("Could not send phone verification code.", error)
      setErrorMessage("Could not send a verification code. Check your SMS authentication setup.")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const beginPhoneEnrollment = async () => {
    clearMessages()
    const normalizedPhone = phone.trim()
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setErrorMessage("Enter a valid phone number in international format, for example +14155552671.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authentication.enrollPhoneMfa(normalizedPhone)
      if (result.error || !result.factorId) {
        setErrorMessage(result.error ?? "Phone-based two-factor authentication could not be started.")
        return
      }

      const factorId = result.factorId
      setPendingFactorId(factorId)
      setPhone(normalizedPhone)
      setFactors((current) => [...current.filter((factor) => factor.verified), {
        id: factorId,
        phone: normalizedPhone,
        verified: false,
      }])
    } catch (error) {
      console.error("Could not enroll phone-based MFA.", error)
      setErrorMessage("Phone-based two-factor authentication could not be started.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const requestEnrollmentCode = async () => {
    if (!pendingFactorId) return
    const challengeId = await sendPhoneChallenge(pendingFactorId)
    if (challengeId) {
      setPendingChallengeId(challengeId)
      setSuccessMessage("A verification code was sent by SMS.")
    }
  }

  const cancelPhoneEnrollment = async () => {
    if (!pendingFactorId) return
    clearMessages()
    setIsSubmitting(true)
    try {
      const result = await authentication.unenrollPhoneMfa(pendingFactorId)
      if (result.error) {
        setErrorMessage(result.error)
        return
      }
      setFactors((current) => current.filter((factor) => factor.id !== pendingFactorId))
      setPendingFactorId(null)
      setPendingChallengeId(null)
      setEnrollmentCode("")
      setSuccessMessage("Phone setup canceled. You can enter a different number.")
    } catch (error) {
      console.error("Could not cancel phone MFA enrollment.", error)
      setErrorMessage("Phone setup could not be canceled.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyPhoneEnrollment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()
    if (!pendingFactorId || !pendingChallengeId) {
      setErrorMessage("Request a verification code first.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authentication.verifyPhoneMfa(
        pendingFactorId,
        pendingChallengeId,
        enrollmentCode.trim(),
        phone,
      )
      if (result.error) {
        setErrorMessage(result.error)
        return
      }
      const factorResult = await authentication.listPhoneMfaFactors()
      if (factorResult.error) {
        setErrorMessage(factorResult.error)
        return
      }
      setFactors(factorResult.factors)
      setPendingFactorId(null)
      setPendingChallengeId(null)
      setEnrollmentCode("")
      setSuccessMessage("Phone two-factor authentication is enabled.")
    } catch (error) {
      console.error("Could not verify phone factor.", error)
      setErrorMessage("The phone verification code could not be verified.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const requestPasswordCode = async () => {
    if (!verifiedPhoneFactor) return
    const challengeId = await sendPhoneChallenge(verifiedPhoneFactor.id)
    if (challengeId) {
      setPasswordChallengeId(challengeId)
      setSuccessMessage("A password-change verification code was sent by SMS.")
    }
  }

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()
    if (password !== confirmPassword) {
      setErrorMessage("The new passwords do not match.")
      return
    }

    if (verifiedPhoneFactor && !passwordChallengeId) {
      setErrorMessage("Request and verify a phone code before changing your password.")
      return
    }

    setIsSubmitting(true)
    try {
      if (verifiedPhoneFactor && passwordChallengeId) {
        const verification = await authentication.verifyPhoneMfa(
          verifiedPhoneFactor.id,
          passwordChallengeId,
          passwordCode.trim(),
        )
        if (verification.error) {
          setErrorMessage(verification.error)
          return
        }
        setPasswordChallengeId(null)
      }

      const result = await authentication.changePassword(password)
      if (result.error) {
        setErrorMessage(result.error)
        return
      }
      setPassword("")
      setConfirmPassword("")
      setPasswordCode("")
      setPasswordChallengeId(null)
      setSuccessMessage("Password changed successfully.")
    } catch (error) {
      console.error("Could not change password.", error)
      setErrorMessage("Password could not be changed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveTransactionPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()
    if (transactionPassword !== confirmTransactionPassword) {
      setErrorMessage("The transaction passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authentication.setAdminTransactionPassword(
        transactionPassword,
        transactionPasswordStatus === "configured" ? currentTransactionPassword : undefined,
      )
      if (result.error) {
        setErrorMessage(result.error)
        return
      }
      setTransactionPasswordStatus("configured")
      setCurrentTransactionPassword("")
      setTransactionPassword("")
      setConfirmTransactionPassword("")
      setSuccessMessage("Admin transaction password saved.")
    } catch (error) {
      console.error("Could not save admin transaction password.", error)
      setErrorMessage("Admin transaction password could not be saved.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const requestDisableCode = async () => {
    if (!verifiedPhoneFactor) return
    const challengeId = await sendPhoneChallenge(verifiedPhoneFactor.id)
    if (challengeId) {
      setDisableChallengeId(challengeId)
      setSuccessMessage("A code was sent to your current phone to confirm disabling two-factor authentication.")
    }
  }

  const disablePhoneMfa = async () => {
    if (!verifiedPhoneFactor || !disableChallengeId) return
    clearMessages()
    setIsSubmitting(true)
    try {
      const verification = await authentication.verifyPhoneMfa(
        verifiedPhoneFactor.id,
        disableChallengeId,
        disableCode.trim(),
      )
      if (verification.error) {
        setErrorMessage(verification.error)
        return
      }
      setDisableChallengeId(null)
      const result = await authentication.unenrollPhoneMfa(verifiedPhoneFactor.id)
      if (result.error) {
        setErrorMessage(result.error)
        return
      }
      setFactors((current) => current.filter((factor) => factor.id !== verifiedPhoneFactor.id))
      setDisableChallengeId(null)
      setDisableCode("")
      setSuccessMessage("Phone two-factor authentication is disabled.")
    } catch (error) {
      console.error("Could not disable phone-based MFA.", error)
      setErrorMessage("Two-factor authentication could not be disabled.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfilePictureUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setProfilePicture(file)
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
        {errorMessage && <p role="alert" className="mb-4 text-sm text-destructive">{errorMessage}</p>}
        {successMessage && <p role="status" className="mb-4 text-sm text-green-700">{successMessage}</p>}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading account settings…</p>
        ) : (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Profile Picture</CardTitle>
                <CardDescription className="text-muted-foreground">Upload and manage your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src="/placeholder.svg?height=80&width=80"
                      alt="Profile"
                    />
                    <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                      {(username.slice(0, 2) || "BF").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <label htmlFor="profile-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span className="cursor-pointer"><Upload className="h-4 w-4 mr-2" />Upload New Picture</span>
                      </Button>
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      {profilePicture ? `${profilePicture.name} selected. ` : ""}JPG, PNG or WebP. Max size 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center"><User className="h-5 w-5 mr-2" />Username</CardTitle>
                <CardDescription className="text-muted-foreground">Change your username</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex space-x-2">
                    <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
                    <Button variant="outline" size="sm" onClick={updateUsername} disabled={isSubmitting}>
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center"><Mail className="h-5 w-5 mr-2" />Email Address</CardTitle>
                <CardDescription className="text-muted-foreground">Email address used to authenticate your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="account-email">Account email</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Input id="account-email" type="email" value={identity?.email ?? ""} readOnly />
                  {identity?.emailVerified ? (
                    <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Verified</Badge>
                  ) : (
                    <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Unverified</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center"><Phone className="h-5 w-5 mr-2" />Phone two-factor authentication</CardTitle>
                <CardDescription className="text-muted-foreground">
                  A phone number is optional. Verify it by SMS to enable two-factor authentication and use it to authorize password changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verifiedPhoneFactor ? (
                  <>
                    <p className="text-sm text-green-700">
                      <Shield className="inline h-4 w-4 mr-1" />Enabled for {verifiedPhoneFactor.phone}
                    </p>
                    <Button variant="outline" size="sm" onClick={requestDisableCode} disabled={isSubmitting || !!disableChallengeId}>
                      Verify to disable
                    </Button>
                    {disableChallengeId && (
                      <div className="flex flex-wrap gap-2">
                        <Input
                          aria-label="Code to disable two-factor authentication"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={disableCode}
                          onChange={(event) => setDisableCode(event.target.value)}
                          placeholder="SMS verification code"
                        />
                        <Button variant="destructive" onClick={disablePhoneMfa} disabled={isSubmitting || !disableCode.trim()}>
                          Confirm disable
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mfa-phone">Phone number (optional)</Label>
                      <div className="flex flex-wrap gap-2">
                        <Input
                          id="mfa-phone"
                          type="tel"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="+14155552671"
                          disabled={!!pendingFactorId}
                        />
                        {!pendingFactorId ? (
                          <Button variant="outline" onClick={beginPhoneEnrollment} disabled={isSubmitting}>
                            Enable with this number
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={requestEnrollmentCode} disabled={isSubmitting}>
                            {pendingChallengeId ? "Resend code" : "Send verification code"}
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Use international format, e.g. +14155552671.</p>
                    </div>
                    {pendingFactorId && (
                      <>
                        <form onSubmit={verifyPhoneEnrollment} className="flex flex-wrap gap-2">
                          <Input
                            aria-label="Phone enrollment verification code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={enrollmentCode}
                            onChange={(event) => setEnrollmentCode(event.target.value)}
                            placeholder="SMS verification code"
                            required
                          />
                          <Button type="submit" disabled={isSubmitting || !pendingChallengeId}>
                            Verify and enable
                          </Button>
                        </form>
                        <Button type="button" variant="ghost" size="sm" onClick={cancelPhoneEnrollment} disabled={isSubmitting}>
                          Cancel phone setup
                        </Button>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Change Password</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {verifiedPhoneFactor
                    ? "A code sent to your verified phone is required to change your password."
                    : "Set a new password for your account."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={changePassword} className="space-y-4">
                  {verifiedPhoneFactor && (
                    <div className="space-y-2">
                      <Button type="button" variant="outline" onClick={requestPasswordCode} disabled={isSubmitting}>
                        {passwordChallengeId ? "Resend SMS code" : "Send SMS verification code"}
                      </Button>
                      {passwordChallengeId && (
                        <Input
                          aria-label="Password change verification code"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={passwordCode}
                          onChange={(event) => setPasswordCode(event.target.value)}
                          placeholder="SMS verification code"
                          required
                        />
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting || (verifiedPhoneFactor !== null && !passwordChallengeId)}>
                    Change password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {identity?.role === "admin" && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Admin Transaction Password</CardTitle>
                  <CardDescription>
                    A separate password is required to manually confirm approved orders. Use at least 8 characters,
                    including uppercase and lowercase letters, a number, and a symbol.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionPasswordStatus === "reset_required" ? (
                    <div className="space-y-2" role="alert">
                      <p className="text-sm text-destructive">
                        This transaction password requires a reset after repeated failed attempts. Contact the Supabase
                        project owner to clear the locked credential, then return here to set a new password.
                      </p>
                    </div>
                  ) : transactionPasswordStatus === null ? (
                    <p className="text-sm text-muted-foreground">Loading transaction-password status...</p>
                  ) : (
                    <form onSubmit={saveTransactionPassword} className="space-y-4">
                    {transactionPasswordStatus === "configured" && (
                      <div className="space-y-2">
                        <Label htmlFor="current-transaction-password">Current transaction password</Label>
                        <Input
                          id="current-transaction-password"
                          type="password"
                          autoComplete="current-password"
                          value={currentTransactionPassword}
                          onChange={(event) => setCurrentTransactionPassword(event.target.value)}
                          required
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="new-transaction-password">New transaction password</Label>
                      <Input
                        id="new-transaction-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={transactionPassword}
                        onChange={(event) => setTransactionPassword(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-transaction-password">Confirm transaction password</Label>
                      <Input
                        id="confirm-transaction-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={confirmTransactionPassword}
                        onChange={(event) => setConfirmTransactionPassword(event.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>Save transaction password</Button>
                  </form>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center space-x-4 mt-8">
              <Link href="/dashboard">
                <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
              </Link>
              <Link href="/dashboard/transactions">
                <Button variant="outline" size="sm"><Activity className="h-4 w-4 mr-2" />View Transactions</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </UserDashboard>
  )
}
