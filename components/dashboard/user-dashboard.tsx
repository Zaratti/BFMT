"use client"

import { useState, type ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MainContent } from "@/components/dashboard/main-content"

interface UserDashboardProps {
  children?: ReactNode
}

export function UserDashboard({ children }: UserDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children ? (
          <div className="flex-1 overflow-auto">{children}</div>
        ) : (
          <MainContent onMenuClick={() => setSidebarOpen(true)} />
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
