"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, CreditCard, Settings, LogOut, X, HelpCircle } from "lucide-react"
import { getBrowserIdentityAuthentication } from "@/src/modules/identity/composition/browser"
import type { AuthenticatedIdentity } from "@/src/modules/identity/domain/authentication"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home, current: true },
  { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard, current: false },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, current: false },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle, current: false },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [identity, setIdentity] = useState<AuthenticatedIdentity | null>(null)

  useEffect(() => {
    getBrowserIdentityAuthentication()
      .getCurrentIdentity()
      .then(setIdentity)
      .catch((error: unknown) => console.error("Could not load sidebar identity.", error))
  }, [])

  const displayName = identity?.username ?? identity?.email?.split("@")[0] ?? "Account"
  const avatarInitials = displayName.slice(0, 2).toUpperCase()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-serif font-bold text-sidebar-foreground">Bifimoto</h1>
            </div>
            <nav className="mt-8 flex-1 flex flex-col divide-y divide-sidebar-border overflow-y-auto">
              <div className="px-2 space-y-1">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      item.current
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    )}
                  >
                    <item.icon
                      className={cn(
                        item.current ? "text-sidebar-accent-foreground" : "text-sidebar-foreground",
                        "mr-3 flex-shrink-0 h-5 w-5",
                      )}
                    />
                    {item.name}
                  </a>
                ))}
              </div>
            </nav>
            <div className="flex-shrink-0 flex border-t border-sidebar-border p-4">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">{avatarInitials}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-sidebar-foreground">{displayName}</p>
                  <p className="text-xs text-sidebar-foreground/60">{identity?.email ?? ""}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <h1 className="text-2xl font-serif font-bold text-sidebar-foreground">Bifimoto</h1>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-sidebar-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-8 flex-1 flex flex-col divide-y divide-sidebar-border overflow-y-auto">
            <div className="px-2 space-y-1">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      item.current ? "text-sidebar-accent-foreground" : "text-sidebar-foreground",
                      "mr-3 flex-shrink-0 h-5 w-5",
                    )}
                  />
                  {item.name}
                </a>
              ))}
            </div>
          </nav>
          <div className="flex-shrink-0 flex border-t border-sidebar-border p-4">
            <div className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">{avatarInitials}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">{displayName}</p>
                <p className="text-xs text-sidebar-foreground/60">{identity?.email ?? ""}</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
