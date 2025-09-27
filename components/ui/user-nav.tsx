'use client'

import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User } from 'lucide-react'

export function UserNav() {
  const { user, signOut } = useAppStore()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (!user) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user.user_metadata?.full_name || user.email
  const initials = getInitials(displayName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-ring">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-medium truncate max-w-32">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-32">
            {user.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
