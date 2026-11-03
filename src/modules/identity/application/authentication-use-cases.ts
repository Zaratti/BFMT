import type {
  AuthenticatedIdentity,
  IdentityAuthenticationPort,
  RegistrationDetails,
  RegistrationResult,
  SocialProvider,
  PhoneMfaFactor,
  MfaChallengeResult,
  AdminTransactionPasswordStatus,
} from "../domain/authentication"

export function createIdentityAuthentication(port: IdentityAuthenticationPort) {
  return {
    signIn: (email: string, password: string) => port.signInWithPassword(email, password),
    signUp: (details: RegistrationDetails): Promise<RegistrationResult> => port.signUpWithPassword(details),
    signInWithProvider: (provider: SocialProvider, redirectTo: string) =>
      port.signInWithSocialProvider(provider, redirectTo),
    getCurrentIdentity: (): Promise<AuthenticatedIdentity | null> => port.getAuthenticatedIdentity(),
    recordDashboardVisit: (): Promise<boolean> => port.recordDashboardVisit(),
    getAdminTransactionPasswordStatus: (): Promise<AdminTransactionPasswordStatus> =>
      port.getAdminTransactionPasswordStatus(),
    setAdminTransactionPassword: (password: string, currentPassword?: string) =>
      port.setAdminTransactionPassword(password, currentPassword),
    updateUsername: (username: string) => port.updateUsername(username),
    listPhoneMfaFactors: (): Promise<{ factors: PhoneMfaFactor[]; error: string | null }> =>
      port.listPhoneMfaFactors(),
    enrollPhoneMfa: (phone: string) => port.enrollPhoneMfa(phone),
    challengePhoneMfa: (factorId: string): Promise<MfaChallengeResult> => port.challengePhoneMfa(factorId),
    verifyPhoneMfa: (factorId: string, challengeId: string, code: string, phone?: string) =>
      port.verifyPhoneMfa(factorId, challengeId, code, phone),
    unenrollPhoneMfa: (factorId: string) => port.unenrollPhoneMfa(factorId),
    changePassword: (password: string) => port.changePassword(password),
  }
}
