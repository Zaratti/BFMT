import type {
  AuthenticatedIdentity,
  IdentityAuthenticationPort,
  RegistrationDetails,
  RegistrationResult,
  SocialProvider,
} from "../domain/authentication"

export function createIdentityAuthentication(port: IdentityAuthenticationPort) {
  return {
    signIn: (email: string, password: string) => port.signInWithPassword(email, password),
    signUp: (details: RegistrationDetails): Promise<RegistrationResult> => port.signUpWithPassword(details),
    signInWithProvider: (provider: SocialProvider, redirectTo: string) =>
      port.signInWithSocialProvider(provider, redirectTo),
    getCurrentIdentity: (): Promise<AuthenticatedIdentity | null> => port.getAuthenticatedIdentity(),
  }
}
