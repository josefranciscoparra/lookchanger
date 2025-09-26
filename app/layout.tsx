import './globals.css'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const metadata = { 
  title: 'LookChanger', 
  description: 'Transforma tu estilo con inteligencia artificial - Pruébate ropa virtualmente' 
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 space-y-4 p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}