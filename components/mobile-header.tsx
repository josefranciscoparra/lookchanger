'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"

const pageNames: Record<string, string> = {
  '/': 'Inicio',
  '/models': 'Modelos',
  '/garments': 'Prendas',
  '/outfits': 'Crear Outfit',
  '/gallery': 'Mis Imágenes',
  '/help': 'Ayuda',
  '/settings': 'Configuración'
}

export function MobileHeader() {
  const pathname = usePathname()
  const currentPageName = pageNames[pathname] || 'Lookah'

  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8" />
        <Link href="/" className="flex items-center">
          <Image 
            src="/logotransparente.png" 
            alt="Lookah Logo" 
            width={80}
            height={40}
            className="object-contain"
            priority
          />
        </Link>
      </div>
      
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-ink-500">{currentPageName}</h1>
      </div>
    </header>
  )
}