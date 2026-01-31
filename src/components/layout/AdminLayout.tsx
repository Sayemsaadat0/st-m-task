"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { AdminSidebar } from "./AdminSidebar"
import { AdminNavbar } from "./AdminNavbar"
import { Toaster } from "sonner"
import { TooltipProvider } from "@radix-ui/react-tooltip"
// import { AdminSidebar } from "./admin-sidebar"
// import { AdminNavbar } from "./admin-navbar"
// import { Sidebar } from "../Sidebar"
// import { Navbar } from "../Navbar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen ">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="">
            <AdminSidebar
              isCollapsed={isCollapsed}
              onToggleCollapse={handleToggleCollapse}
              isMobile={false}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Navbar */}
            <AdminNavbar isCollapsed={isCollapsed} />

            {/* Page Content */}
            <main className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300",
            )}>
              <div className="mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
      <Toaster />

    </TooltipProvider>
  )
}
