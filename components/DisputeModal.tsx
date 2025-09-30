'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle, Loader2 } from 'lucide-react'

interface DisputeModalProps {
  isOpen: boolean
  onClose: () => void
  outputId: string
  onSuccess?: () => void
}

const DISPUTE_REASONS = [
  { value: 'face_different', label: 'El rostro es diferente al modelo original' },
  { value: 'garment_wrong', label: 'La prenda no coincide con la seleccionada' },
  { value: 'low_quality', label: 'La calidad de la imagen es muy baja' },
  { value: 'distortion', label: 'Hay distorsiones o artefactos visuales' },
  { value: 'other', label: 'Otro motivo' },
]

export function DisputeModal({ isOpen, onClose, outputId, onSuccess }: DisputeModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!reason) {
      setError('Por favor, selecciona un motivo')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/credits/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          output_id: outputId,
          reason,
          description
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la disputa')
      }

      // Éxito
      onSuccess?.()
      onClose()

      // Resetear formulario
      setReason('')
      setDescription('')
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setReason('')
      setDescription('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reportar Problema con la Imagen</DialogTitle>
          <DialogDescription>
            Si esta imagen tiene algún problema, por favor indícanos qué sucedió.
            Revisaremos tu reporte y procesaremos un reembolso si procede.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selección de motivo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Motivo del reporte *</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {DISPUTE_REASONS.map((item) => (
                <div key={item.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={item.value} id={item.value} className="mt-0.5" />
                  <Label
                    htmlFor={item.value}
                    className="text-sm font-normal cursor-pointer leading-relaxed"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Descripción opcional */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción adicional (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe con más detalle el problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Información adicional */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
            <p className="font-medium mb-1">¿Qué pasa después de reportar?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Tu reporte será revisado por nuestro equipo</li>
              <li>Si procede, recibirás un reembolso automático</li>
              <li>El reembolso puede tardar hasta 24-48 horas</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !reason}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Reporte'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}