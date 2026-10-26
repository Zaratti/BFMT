import { createIdentityAuthentication } from "../application/authentication-use-cases"
import { createSupabaseBrowserClient } from "../infrastructure/supabase/browser-client"
import { SupabaseIdentityAuthenticationAdapter } from "../infrastructure/supabase/identity-authentication-adapter"

export function getBrowserIdentityAuthentication() {
  const supabase = createSupabaseBrowserClient()
  return createIdentityAuthentication(new SupabaseIdentityAuthenticationAdapter(supabase))
}
