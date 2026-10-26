import type { ReactNode } from "react"
import { AuthGuard } from "@/components/navigation/auth-guard"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthGuard requireAuth>{children}</AuthGuard>
}
