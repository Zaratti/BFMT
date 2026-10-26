"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, BarChart3, Shield, Database, LogOut, X, Coins, Settings, CreditCard } from "lucide-react"

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { name: "User Management", href: "/admin", icon: Users, current: true },
  { name: "Asset Management", href: "/admin/asset-management", icon: Coins, current: false },
  { name: "Transactions", href: "/admin/transactions", icon: Database, current: false },
  { name: "Reports", href: "/admin/reports", icon: BarChart3, current: false },
  { name: "System Accounts", href: "/admin/system-accounts", icon: CreditCard, current: false },
  { name: "Rate Management", href: "/admin/rate-management", icon: Settings, current: false },
]

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-sidebar-primary mr-2" />
                <div>
                  <h1 className="text-xl font-serif font-bold text-sidebar-foreground">Bifimoto</h1>
                  <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
                </div>
              </div>
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
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Admin" />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">AD</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
                  <p className="text-xs text-sidebar-foreground/60">admin@bifimoto.com</p>
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
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-sidebar-primary mr-2" />
              <div>
                <h1 className="text-xl font-serif font-bold text-sidebar-foreground">Bifimoto</h1>
                <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
              </div>
            </div>
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
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Admin" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">AD</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
                <p className="text-xs text-sidebar-foreground/60">admin@bifimoto.com</p>
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
