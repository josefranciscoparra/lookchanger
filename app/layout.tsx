import './globals.css'
import { ConditionalLayout } from '@/components/conditional-layout'
import { AuthProvider } from '@/components/auth/auth-provider'

export const metadata = { 
  title: 'Lookah', 
  description: 'Transforma tu estilo con inteligencia artificial - Pruébate ropa virtualmente' 
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}