'use client'

import { useAppStore } from '@/lib/store'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function CreditBadge() {
  const { credits, isLoadingCredits, user } = useAppStore()
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Esperar a que termine de cargar y añadir delay para evitar parpadeo
  useEffect(() => {
    if (!isLoadingCredits && !hasLoaded) {
      // Esperar un pequeño delay antes de mostrar
      const timer = setTimeout(() => {
        setHasLoaded(true)
        // Añadir otro pequeño delay para la animación de entrada
        setTimeout(() => setIsVisible(true), 50)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isLoadingCredits, hasLoaded])

  // No mostrar si no hay usuario
  if (!user) return null

  // Determinar color según el balance
  const getColorClass = () => {
    if (credits === 0) return 'bg-gray-100 text-gray-600 border-gray-200'
    if (credits < 5) return 'bg-red-50 text-red-700 border-red-200'
    if (credits < 10) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return 'bg-green-50 text-green-700 border-green-200'
  }

  // Mostrar skeleton mientras carga
  if (isLoadingCredits || !hasLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm">
        <div className="h-4 w-4 animate-pulse rounded-full bg-gray-300" />
        <div className="h-4 w-6 animate-pulse rounded bg-gray-300" />
        <div className="hidden h-4 w-12 animate-pulse rounded bg-gray-300 sm:block" />
      </div>
    )
  }

  return (
    <Link
      href="/credits"
      className={cn(
        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md',
        getColorClass(),
        // Animación de entrada
        isVisible
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95'
      )}
      title="Ver historial de créditos"
    >
      <Zap className="h-4 w-4" fill="currentColor" />
      <span>{credits}</span>
      <span className="hidden sm:inline">
        {credits === 1 ? 'crédito' : 'créditos'}
      </span>
    </Link>
  )
}