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
import { AlertCircle, Loader2, Sparkles, Coins } from 'lucide-react'
import { LoadingAnimation } from '@/components/ui/loading-animation'
import { useAppStore } from '@/lib/store'

interface EditImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  outputId?: string
  onSuccess?: (editedImageUrl: string) => void
}

export function EditImageModal({
  isOpen,
  onClose,
  imageUrl,
  outputId,
  onSuccess
}: EditImageModalProps) {
  const [editInstructions, setEditInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { credits, refreshCredits } = useAppStore()

  const EDIT_COST = 1 // 1 crédito por edición

  const handleSubmit = async () => {
    if (!editInstructions.trim()) {
      setError('Por favor, escribe las instrucciones de edición')
      return
    }

    // Verificar créditos suficientes
    if (credits < EDIT_COST) {
      setError(`Necesitas ${EDIT_COST} crédito para editar esta imagen`)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/outfits/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          editInstructions: editInstructions.trim(),
          outputId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          // Créditos insuficientes
          throw new Error(`Créditos insuficientes. Necesitas ${data.credits_needed} crédito(s) adicional(es)`)
        }
        throw new Error(data.error || 'Error al editar la imagen')
      }

      // Refrescar créditos
      await refreshCredits()

      // Llamar callback de éxito con la nueva imagen
      if (data.editedImageUrl) {
        onSuccess?.(data.editedImageUrl)
      }

      // Cerrar modal y resetear
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Error al procesar la edición')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setEditInstructions('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        {loading ? (
          // Pantalla de carga durante la edición
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Editando Imagen
              </DialogTitle>
              <DialogDescription>
                La IA está aplicando tus cambios...
              </DialogDescription>
            </DialogHeader>

            <div className="py-8">
              <LoadingAnimation />
            </div>
          </>
        ) : (
          // Formulario de edición
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Editar Imagen con IA
              </DialogTitle>
              <DialogDescription>
                Describe qué cambios quieres hacer en esta imagen. La IA mantendrá todo lo demás exactamente igual.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 overflow-y-auto flex-1">
          {/* Preview de la imagen original - Más compacta */}
          <div className="rounded-lg border border-border overflow-hidden bg-gray-50">
            <img
              src={imageUrl}
              alt="Imagen a editar"
              className="w-full h-auto max-h-[140px] object-contain"
            />
          </div>

          {/* Campo de instrucciones - Más compacto */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-instructions" className="text-xs font-medium">
              Instrucciones de edición *
            </Label>
            <Textarea
              id="edit-instructions"
              placeholder="Ej: 'Cambia el color de la camisa a azul'"
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              disabled={loading}
            />
          </div>

          {/* Aviso compacto */}
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            <p className="font-medium">⚠️ Sé muy específico. Los resultados son bajo tu responsabilidad.</p>
          </div>

          {/* Información de costo - Más compacta */}
          <div className="rounded-md bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-ink-500">Costo: <span className="text-purple-700">{EDIT_COST} crédito</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-text-secondary">Disponibles:</span>
                <span className={`font-semibold ${credits >= EDIT_COST ? 'text-green-600' : 'text-red-600'}`}>
                  {credits}
                </span>
              </div>
            </div>
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
                disabled={loading || !editInstructions.trim() || credits < EDIT_COST}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Editar Imagen ({EDIT_COST} crédito)
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
