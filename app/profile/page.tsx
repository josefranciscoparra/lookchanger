'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ProfilePage() {
  const { user } = useAppStore()

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Debes iniciar sesión para ver tu perfil.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user.user_metadata?.full_name || user.email
  const initials = getInitials(displayName)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-ink-500 text-white text-2xl font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mb-1">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Datos de Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Edición de datos personales y preferencias.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Historial de actividad y estadísticas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente: Gestión de contraseña y seguridad de la cuenta.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}