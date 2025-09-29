import './globals.css'
import { Inter } from 'next/font/google'
import { ConditionalLayout } from '@/components/conditional-layout'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = { 
  title: 'Lookah', 
  description: 'Transforma tu estilo con inteligencia artificial - Pruébate ropa virtualmente',
  icons: {
    icon: '/favicon.png',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen`}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}