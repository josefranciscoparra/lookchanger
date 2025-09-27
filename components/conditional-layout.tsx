'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Rutas donde no queremos mostrar el sidebar
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(pathname)

  if (isAuthRoute) {
    // Para rutas de autenticación, solo renderizar el contenido sin sidebar
    return <>{children}</>
  }

  // Para el resto de rutas, mostrar el layout completo con sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 space-y-4 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}