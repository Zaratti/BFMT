import "server-only"

import { createIdentityAuthentication } from "../application/authentication-use-cases"
import { createSupabaseServerClient } from "../infrastructure/supabase/server-client"
import { SupabaseIdentityAuthenticationAdapter } from "../infrastructure/supabase/identity-authentication-adapter"

export async function getServerIdentityAuthentication() {
  const supabase = await createSupabaseServerClient()
  return createIdentityAuthentication(new SupabaseIdentityAuthenticationAdapter(supabase))
}
