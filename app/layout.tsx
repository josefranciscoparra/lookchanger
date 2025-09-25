import './globals.css'
import Link from 'next/link'

export const metadata = { title: 'AI Look Try-On', description: 'Model + Garments = Looks' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <nav className="mx-auto max-w-5xl px-4 py-3 flex gap-4">
            <Link href="/" className="font-semibold">LookTryOn</Link>
            <Link href="/models">Modelos</Link>
            <Link href="/garments">Prendas</Link>
            <Link href="/outfits">Outfits</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-4">{children}</main>
      </body>
    </html>
  )
}