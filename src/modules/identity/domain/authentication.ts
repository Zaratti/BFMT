export const socialProviders = ["x", "google"] as const

export type SocialProvider = (typeof socialProviders)[number]

export interface RegistrationDetails {
  email: string
  password: string
  fullName: string
  username: string
  privacyPolicyAcceptedAt: string
  termsAcceptedAt: string
  emailRedirectTo: string
}

export interface IdentityResult {
  error: string | null
}

export interface RegistrationResult extends IdentityResult {
  emailConfirmationRequired: boolean
}

export interface AuthenticatedIdentity {
  id: string
  role: "user" | "admin"
  email: string | null
  emailVerified: boolean
  username: string | null
}

export interface PhoneMfaFactor {
  id: string
  phone: string
  verified: boolean
}

export interface MfaChallengeResult extends IdentityResult {
  challengeId: string | null
}

export type AdminTransactionPasswordStatus = "not_admin" | "not_set" | "configured" | "reset_required"

/** Domain port: identity use cases depend on this contract, not Supabase. */
export interface IdentityAuthenticationPort {
  signInWithPassword(email: string, password: string): Promise<IdentityResult>
  signUpWithPassword(details: RegistrationDetails): Promise<RegistrationResult>
  signInWithSocialProvider(provider: SocialProvider, redirectTo: string): Promise<IdentityResult>
  getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null>
  recordDashboardVisit(): Promise<boolean>
  getAdminTransactionPasswordStatus(): Promise<AdminTransactionPasswordStatus>
  setAdminTransactionPassword(password: string, currentPassword?: string): Promise<IdentityResult>
  updateUsername(username: string): Promise<IdentityResult>
  listPhoneMfaFactors(): Promise<{ factors: PhoneMfaFactor[]; error: string | null }>
  enrollPhoneMfa(phone: string): Promise<{ factorId: string | null; error: string | null }>
  challengePhoneMfa(factorId: string): Promise<MfaChallengeResult>
  verifyPhoneMfa(factorId: string, challengeId: string, code: string, phone?: string): Promise<IdentityResult>
  unenrollPhoneMfa(factorId: string): Promise<IdentityResult>
  changePassword(password: string): Promise<IdentityResult>
}
