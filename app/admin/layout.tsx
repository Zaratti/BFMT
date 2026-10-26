import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerIdentityAuthentication } from "@/src/modules/identity/composition/server"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authentication = await getServerIdentityAuthentication()
  const identity = await authentication.getCurrentIdentity()

  if (!identity) redirect("/sign-in")
  if (identity.role !== "admin") redirect("/dashboard")

  return children
}
