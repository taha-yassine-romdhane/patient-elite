"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminPageHeader } from "@/components/admin/AdminPageHeader"
import TabSwitcher from "@/components/admin/dashboard/TabSwitcher"





interface AdminDashboardLayoutProps {
  children: React.ReactNode
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

// Dashboard content component
export function DashboardContent() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <AdminPageHeader 
        title="Tableau de bord" 
        description="Gérez vos activités quotidiennes"
      />

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Data Tables Section */}
        <TabSwitcher />
      </main>
    </div>
  )
}