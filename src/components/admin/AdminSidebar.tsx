"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  Calendar,
  Users,
  Stethoscope,
  ShoppingCart,
  Home,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
  Bell,
  User,
  Clock,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Navigation items with their data
const navigationItems = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        title: "Tableau de bord",
        url: "/admin/dashboard",
        icon: Home,
        badge: null,
      },
      {
        title: "Statistiques",
        url: "/admin/analytics",
        icon: BarChart3,
        badge: null,
      },
    ],
  },
  {
    title: "Gestion des patients",
    items: [
      {
        title: "Patients",
        url: "/admin/patients",
        icon: Users,
        badge: null,
      },
      {
        title: "Rendez-vous",
        url: "/admin/appointments",
        icon: Clock,
        badge: null,
      },
      {
        title: "Diagnostics",
        url: "/admin/diagnostics",
        icon: Stethoscope,
        badge: null,
      },
    ],
  },
  {
    title: "Commerce",
    items: [
      {
        title: "Ventes",
        url: "/admin/sales",
        icon: ShoppingCart,
        badge: null,
      },
      {
        title: "Locations",
        url: "/admin/rentals",
        icon: FileText,
        badge: null,
      },
    ],
  },
  {
    title: "Organisation",
    items: [
      {
        title: "Calendrier",
        url: "/admin/calendar",
        icon: Calendar,
        badge: null,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Utilisateurs",
        url: "/admin/users",
        icon: User,
        badge: null,
      },
    ],
  },
]

export function AdminSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { state } = useSidebar()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      <SidebarHeader className="h-16 border-b border-border">
        <div className="flex items-center gap-2 px-2 h-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white flex-shrink-0">
            <Stethoscope className="h-4 w-4" />
          </div>
          {state !== "collapsed" && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Patients Elite</span>
              <span className="truncate text-xs text-muted-foreground">CRM Médical</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="w-full"
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge className="ml-auto bg-blue-500 text-white">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        {session && (
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src="" alt={session.user?.name || ""} />
              <AvatarFallback className="bg-black text-white text-xs">
                {session.user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {state !== "collapsed" && (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{session.user?.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {session.user?.role === 'ADMIN' ? 'Administrateur' : 'Employé'}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={`h-8 w-8 p-0 text-muted-foreground hover:text-foreground ${state === "collapsed" ? "ml-auto" : ""}`}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Se déconnecter</span>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}