'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useAppStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return <>{children}</>
}