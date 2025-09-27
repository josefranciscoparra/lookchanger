'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lookah-background to-lookah-accent-blue">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lookah-purple"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lookah-background to-lookah-accent-blue py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-lookah-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-lookah-purple-light/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image 
                src="/logoLookah3.png" 
                alt="Lookah Logo" 
                width={160} 
                height={100} 
                className="object-contain"
              />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 bg-gradient-to-r from-lookah-purple to-lookah-purple-dark bg-clip-text text-transparent">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="mt-2 text-gray-600">
              Inicia sesión en tu cuenta
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
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
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lookah-purple focus:border-lookah-purple transition-colors text-gray-900 placeholder-gray-400"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lookah-purple focus:border-lookah-purple transition-colors text-gray-900 placeholder-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-lookah-purple to-lookah-purple-dark hover:from-lookah-purple-dark hover:to-lookah-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lookah-purple disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
          
          {process.env.NEXT_PUBLIC_DISABLE_SIGNUP !== 'true' && (
            <p className="mt-6 text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/signup" className="font-medium text-lookah-purple hover:text-lookah-purple-dark transition-colors">
                Regístrate aquí
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
