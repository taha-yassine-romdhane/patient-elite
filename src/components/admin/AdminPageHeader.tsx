"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

interface AdminPageHeaderProps {
  title: string
  description?: string
  showHomeButton?: boolean
  children?: React.ReactNode
}

export function AdminPageHeader({ 
  title, 
  description, 
  showHomeButton = true, 
  children 
}: AdminPageHeaderProps) {
  const { data: session } = useSession()
  
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {showHomeButton && (
            <>
              <Separator orientation="vertical" className="h-8" />
              <Button variant="ghost" size="sm" asChild className="flex items-center gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Accueil
                </Link>
              </Button>
            </>
          )}
          {children && (
            <>
              <Separator orientation="vertical" className="h-8" />
              {children}
            </>
          )}
        </div>
      </div>

      {/* User Profile */}
      {session && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={session.user?.name || ""} />
                <AvatarFallback className="bg-black text-white text-xs">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user?.role === 'ADMIN' ? 'Administrateur' : 'Employé'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}
