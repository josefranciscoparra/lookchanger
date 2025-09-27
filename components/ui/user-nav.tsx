'use client'

import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

export function UserNav() {
  const { user, signOut } = useAppStore()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">
        Hola, {user.user_metadata?.full_name || user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
      >
        Cerrar Sesión
      </button>
    </div>
  )
}