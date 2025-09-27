'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
  Sparkles, 
  Users, 
  Shirt, 
  Wand2, 
  Home,
  Settings,
  HelpCircle,
  Image as ImageIcon
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { UserNav } from "@/components/ui/user-nav"

const menuItems = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Modelos",
    url: "/models",
    icon: Users,
  },
  {
    title: "Prendas",
    url: "/garments", 
    icon: Shirt,
  },
  {
    title: "Crear Outfit",
    url: "/outfits",
    icon: Wand2,
  },
  {
    title: "Mis Imágenes",
    url: "/gallery",
    icon: ImageIcon,
  },
]

const secondaryItems = [
  {
    title: "Ayuda",
    url: "/help",
    icon: HelpCircle,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-start justify-start pl-4 pr-1 pt-1 pb-0">
          <Link href="/" className="flex items-center justify-center w-28 h-28 overflow-hidden cursor-pointer">
            <Image 
              src="/logoLookah3.png" 
              alt="Lookah Logo" 
              width={144}
              height={144}
              className="w-full h-full object-cover scale-105"
              priority
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="-mt-4">
        <SidebarGroup>
          <SidebarGroupLabel>Aplicación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Herramientas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 space-y-2">
          <UserNav />
          <Separator />
          <div className="text-xs text-muted-foreground text-center">
            © 2025 Lookah
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Powered by AI
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}