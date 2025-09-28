'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { SoftGradient } from '@/components/ui/SoftGradient'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const redirectTo = searchParams.get('redirectTo') || '/'
  const message = searchParams.get('message')

  useEffect(() => {
    setMounted(true)
    
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.replace('/')
      }
    }
    checkUser()
  }, [supabase, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        window.location.href = redirectTo
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <main className="relative min-h-screen text-text-primary bg-gradient-to-br from-white via-blush-50 to-blush-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink-500"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen text-text-primary bg-gradient-to-br from-white via-blush-50 to-blush-200">
      {/* Logo top-left */}
      <div className="absolute left-8 top-8 flex items-center gap-2">
        <Image 
          src="/logotransparente.png" 
          alt="Lookah Logo" 
          width={120} 
          height={75} 
          className="object-contain"
        />
      </div>

      {/* Card alineada a la derecha */}
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-end px-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-white/90 shadow-card backdrop-blur">
          {/* Header visual */}
          <div className="space-y-1 px-7 pt-8">
            <h1 className="text-3xl font-bold leading-tight text-ink-500">¡Ya estás aquí!<br/>Empecemos</h1>
            <p className="text-sm text-text-secondary">Inicia sesión para unirte a tu equipo</p>
          </div>
          
          {/* Formulario */}
          <div className="space-y-5 px-7 pb-8 pt-5">
            <form className="space-y-5" onSubmit={handleLogin}>
              {message && (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full h-11 rounded-xl border-border focus-visible:ring-1 focus-visible:ring-ink-500 px-4 text-sm transition-colors"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 rounded-xl border-border focus-visible:ring-1 focus-visible:ring-ink-500 px-4 text-sm transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* CTA principal */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex h-11 items-center justify-center rounded-2xl bg-blush-400 text-white hover:bg-blush-500 transition focus:outline-none focus:ring-2 focus:ring-blush-100 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Siguiente'
                )}
              </button>

            </form>
            
            {process.env.NEXT_PUBLIC_DISABLE_SIGNUP !== 'true' && (
              <p className="text-center text-sm text-text-secondary">
                ¿No tienes cuenta?{' '}
                <Link href="/signup" className="text-sm text-ink-500 hover:underline underline-offset-2">
                  Crear empresa
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen text-text-primary bg-gradient-to-br from-white via-blush-50 to-blush-200">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink-500"></div>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}