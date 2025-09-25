import './globals.css'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export const metadata = { 
  title: 'AI Look Try-On', 
  description: 'Genera looks fotorrealistas con inteligencia artificial' 
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans antialiased">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="flex h-14 items-center gap-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <Sparkles className="h-6 w-6" />
                LookTryOn
              </Link>
              <div className="flex gap-6">
                <Link href="/models" className="text-sm font-medium transition-colors hover:text-primary">
                  Modelos
                </Link>
                <Link href="/garments" className="text-sm font-medium transition-colors hover:text-primary">
                  Prendas
                </Link>
                <Link href="/outfits" className="text-sm font-medium transition-colors hover:text-primary">
                  Outfits
                </Link>
              </div>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <footer className="border-t mt-16">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 AI Look Try-On - Generado con inteligencia artificial
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}