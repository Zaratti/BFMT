"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getBrowserIdentityAuthentication } from "@/src/modules/identity/composition/browser"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo = "/sign-in",
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      if (!requireAuth && !requireAdmin) {
        setIsLoading(false)
        return
      }

      try {
        const identity = await getBrowserIdentityAuthentication().getCurrentIdentity()

        if ((requireAuth || requireAdmin) && !identity) {
          const destination = new URLSearchParams({ next: pathname })
          router.replace(`${redirectTo}?${destination.toString()}`)
          return
        }

        if (requireAdmin && identity?.role !== "admin") {
          router.replace("/dashboard")
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Auth check failed:", error)
        if (requireAuth || requireAdmin) {
          router.replace(redirectTo)
        } else {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
  }, [requireAuth, requireAdmin, redirectTo, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
