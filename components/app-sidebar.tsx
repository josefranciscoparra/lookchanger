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
  HelpCircle,
  Image as ImageIcon,
  User
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
  useSidebar,
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
    title: "Mi Perfil",
    url: "/profile",
    icon: User,
  },
  {
    title: "Ayuda",
    url: "/help",
    icon: HelpCircle,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center px-4 py-4">
          <Link href="/" className="flex items-center justify-center cursor-pointer" onClick={handleLinkClick}>
            <Image 
              src="/logotransparente.png" 
              alt="Lookah Logo" 
              width={160}
              height={80}
              className="object-contain"
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
                    <Link href={item.url} onClick={handleLinkClick}>
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
                    <Link href={item.url} onClick={handleLinkClick}>
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