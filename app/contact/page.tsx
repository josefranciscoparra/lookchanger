'use client'

import { Mail, Clock, Calendar, HelpCircle } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContactPage() {
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Contacto</h1>
      </div>

      <p className="text-muted-foreground mb-8 max-w-2xl">
        ¿Tienes alguna pregunta, sugerencia o necesitas ayuda? Envíanos un mensaje y te responderemos lo antes posible.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
        {/* Formulario - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        {/* Información lateral - Ocupa 1 columna */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Tiempo de Respuesta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Normalmente respondemos en un plazo de <strong>24-48 horas hábiles</strong>.
                Para consultas urgentes, indícalo en el asunto.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Horario de Atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lunes - Viernes:</span>
                  <span className="font-medium">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fin de semana:</span>
                  <span className="font-medium">Cerrado</span>
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Zona horaria: CET (Central European Time)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5" />
                Consejos Útiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Incluye capturas de pantalla si reportas un error</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Menciona tu navegador y sistema operativo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Describe los pasos para reproducir el problema</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}