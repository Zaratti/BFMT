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
}

/** Domain port: identity use cases depend on this contract, not Supabase. */
export interface IdentityAuthenticationPort {
  signInWithPassword(email: string, password: string): Promise<IdentityResult>
  signUpWithPassword(details: RegistrationDetails): Promise<RegistrationResult>
  signInWithSocialProvider(provider: SocialProvider, redirectTo: string): Promise<IdentityResult>
  getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null>
}
