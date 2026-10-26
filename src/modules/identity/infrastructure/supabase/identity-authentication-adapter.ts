import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import type {
  AuthenticatedIdentity,
  IdentityAuthenticationPort,
  IdentityResult,
  RegistrationDetails,
  RegistrationResult,
  SocialProvider,
} from "../../domain/authentication"

export class SupabaseIdentityAuthenticationAdapter implements IdentityAuthenticationPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async signInWithPassword(email: string, password: string): Promise<IdentityResult> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async signUpWithPassword(details: RegistrationDetails): Promise<RegistrationResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email: details.email,
      password: details.password,
      options: {
        emailRedirectTo: details.emailRedirectTo,
        data: {
          full_name: details.fullName,
          username: details.username,
          privacy_policy_accepted_at: details.privacyPolicyAcceptedAt,
          terms_accepted_at: details.termsAcceptedAt,
        },
      },
    })

    return {
      error: error?.message ?? null,
      emailConfirmationRequired: !error && !data.session,
    }
  }

  async signInWithSocialProvider(provider: SocialProvider, redirectTo: string): Promise<IdentityResult> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })

    return { error: error?.message ?? null }
  }

  async getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null> {
    const { data, error } = await this.supabase.auth.getUser()
    if (error || !data.user) return null

    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle()

    if (profileError || !profile) return null
    return { id: data.user.id, role: profile.role }
  }
}
