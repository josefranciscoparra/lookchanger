'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        toast({
          title: '¡Mensaje enviado!',
          description: 'Hemos recibido tu mensaje. Te responderemos pronto.',
        })
      } else {
        throw new Error(data.message || 'Error al enviar el mensaje')
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Por favor, intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Formulario de Contacto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">¡Mensaje enviado!</h3>
            <p className="text-muted-foreground mb-6">
              Hemos recibido tu mensaje. Te responderemos lo antes posible.
            </p>
            <Button onClick={() => setSuccess(false)} variant="outline">
              Enviar otro mensaje
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Asunto *
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder="¿En qué podemos ayudarte?"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Mensaje *
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="Escribe tu mensaje aquí..."
                value={formData.message}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={10}
                rows={9}
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}