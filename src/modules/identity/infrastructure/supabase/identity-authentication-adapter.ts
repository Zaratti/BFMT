import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import type {
  AuthenticatedIdentity,
  IdentityAuthenticationPort,
  IdentityResult,
  RegistrationDetails,
  RegistrationResult,
  SocialProvider,
  PhoneMfaFactor,
  AdminTransactionPasswordStatus,
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
      .select("role, username")
      .eq("id", data.user.id)
      .maybeSingle()

    if (profileError) throw profileError

    const metadataUsername =
      typeof data.user.user_metadata?.username === "string" ? data.user.user_metadata.username : null

    return {
      id: data.user.id,
      role: profile?.role ?? "user",
      email: data.user.email ?? null,
      emailVerified: Boolean(data.user.email_confirmed_at),
      username: profile?.username ?? metadataUsername,
    }
  }

  async recordDashboardVisit(): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("record_dashboard_visit")
    if (error) throw new Error(error.message)
    return data
  }

  async getAdminTransactionPasswordStatus(): Promise<AdminTransactionPasswordStatus> {
    const { data, error } = await this.supabase.rpc("get_admin_transaction_password_status")
    if (error) throw new Error(error.message)
    if (data === "not_admin" || data === "not_set" || data === "configured" || data === "reset_required") {
      return data
    }
    throw new Error("The transaction password status returned an invalid response.")
  }

  async setAdminTransactionPassword(password: string, currentPassword?: string): Promise<IdentityResult> {
    const { error } = await this.supabase.rpc("set_admin_transaction_password", {
      p_password: password,
      p_current_password: currentPassword ?? null,
    })
    return { error: error?.message ?? null }
  }

  async updateUsername(username: string): Promise<IdentityResult> {
    const { data, error: userError } = await this.supabase.auth.getUser()
    if (userError || !data.user) return { error: userError?.message ?? "You must be signed in to update your username." }

    const { error } = await this.supabase
      .from("profiles")
      .upsert({ id: data.user.id, username }, { onConflict: "id" })

    return { error: error?.message ?? null }
  }

  async listPhoneMfaFactors(): Promise<{ factors: PhoneMfaFactor[]; error: string | null }> {
    const [{ data, error }, { data: userData, error: userError }] = await Promise.all([
      this.supabase.auth.mfa.listFactors(),
      this.supabase.auth.getUser(),
    ])
    if (error) return { factors: [], error: error.message }
    if (userError || !userData.user) {
      return { factors: [], error: userError?.message ?? "You must be signed in to view phone authentication." }
    }

    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("phone_number")
      .eq("id", userData.user.id)
      .maybeSingle()
    if (profileError) return { factors: [], error: profileError.message }

    return {
      factors: data.all.filter((factor) => factor.factor_type === "phone").map((factor) => ({
        id: factor.id,
        phone: profile?.phone_number ?? "",
        verified: factor.status === "verified",
      })),
      error: null,
    }
  }

  async enrollPhoneMfa(phone: string): Promise<{ factorId: string | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.mfa.enroll({
      factorType: "phone",
      phone,
      friendlyName: "Bifimoto phone",
    })

    return { factorId: data?.id ?? null, error: error?.message ?? null }
  }

  async challengePhoneMfa(factorId: string): Promise<{ challengeId: string | null; error: string | null }> {
    const { data, error } = await this.supabase.auth.mfa.challenge({ factorId })
    return { challengeId: data?.id ?? null, error: error?.message ?? null }
  }

  async verifyPhoneMfa(
    factorId: string,
    challengeId: string,
    code: string,
    phone?: string,
  ): Promise<IdentityResult> {
    const { error } = await this.supabase.auth.mfa.verify({ factorId, challengeId, code })
    if (error) return { error: error.message }
    if (!phone) return { error: null }

    const { data, error: userError } = await this.supabase.auth.getUser()
    if (userError || !data.user) {
      return { error: userError?.message ?? "The phone was verified, but your profile could not be updated." }
    }

    const { error: profileError } = await this.supabase
      .from("profiles")
      .upsert({ id: data.user.id, phone_number: phone }, { onConflict: "id" })
    return { error: profileError?.message ?? null }
  }

  async unenrollPhoneMfa(factorId: string): Promise<IdentityResult> {
    const { error } = await this.supabase.auth.mfa.unenroll({ factorId })
    if (error) return { error: error.message }

    const { data: userData, error: userError } = await this.supabase.auth.getUser()
    if (userError || !userData.user) {
      return { error: userError?.message ?? "Two-factor authentication was disabled, but the profile could not be updated." }
    }

    const { error: profileError } = await this.supabase
      .from("profiles")
      .update({ phone_number: null })
      .eq("id", userData.user.id)
    return { error: profileError?.message ?? null }
  }

  async changePassword(password: string): Promise<IdentityResult> {
    const { data: assurance, error: assuranceError } =
      await this.supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (assuranceError) return { error: assuranceError.message }
    if (assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
      return { error: "Verify your phone authentication code before changing your password." }
    }

    const { error } = await this.supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }
}
