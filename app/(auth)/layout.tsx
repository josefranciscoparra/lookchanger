import '../globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'

export const metadata = { 
  title: 'LookChanger - Autenticación', 
  description: 'Accede a tu cuenta de LookChanger' 
}

export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}