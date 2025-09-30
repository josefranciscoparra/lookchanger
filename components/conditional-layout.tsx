'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileHeader } from '@/components/mobile-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Rutas donde no queremos mostrar el sidebar
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(pathname)

  // Wrapper animado para el contenido
  const AnimatedContent = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 2,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )

  if (isAuthRoute) {
    // Para rutas de autenticación, solo renderizar el contenido sin sidebar
    return <AnimatedContent>{children}</AnimatedContent>
  }

  // Para el resto de rutas, mostrar el layout completo con sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MobileHeader />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <AnimatedContent>{children}</AnimatedContent>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}