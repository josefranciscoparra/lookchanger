import './globals.css'
import { Inter } from 'next/font/google'
import { ConditionalLayout } from '@/components/conditional-layout'
import { AuthProvider } from '@/components/auth/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = { 
  title: 'Lookah', 
  description: 'Transforma tu estilo con inteligencia artificial - Pruébate ropa virtualmente' 
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-surface text-text-primary antialiased`}>
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}