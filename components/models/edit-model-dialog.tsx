'use client'
import { useState, useEffect } from 'react'
import { Edit, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import type { Model } from '@/lib/store'

interface EditModelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  model: Model
  onSave: () => void
}

export function EditModelDialog({ open, onOpenChange, model, onSave }: EditModelDialogProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')

  // Form state
  const [usePhysicalInfo, setUsePhysicalInfo] = useState(model.use_physical_info || false)
  const [weight, setWeight] = useState<string>(model.weight?.toString() || '')
  const [height, setHeight] = useState<string>(model.height?.toString() || '')
  const [bodyType, setBodyType] = useState<string>(model.body_type || '')

  // Reset form when model changes
  useEffect(() => {
    setUsePhysicalInfo(model.use_physical_info || false)
    setWeight(model.weight?.toString() || '')
    setHeight(model.height?.toString() || '')
    setBodyType(model.body_type || '')
  }, [model])

  const handleSave = async () => {
    if (!model.id) {
      setError('Error: modelo sin ID')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/models/${model.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: usePhysicalInfo && weight ? parseFloat(weight) : null,
          height: usePhysicalInfo && height ? parseFloat(height) : null,
          body_type: usePhysicalInfo && bodyType ? bodyType : null,
          use_physical_info: usePhysicalInfo
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar cambios')
      }

      toast({
        title: 'Cambios guardados',
        description: 'La información del modelo se ha actualizado correctamente',
      })

      onSave()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Modelo
          </DialogTitle>
          <DialogDescription>
            Añade o actualiza información física del modelo para mejorar la generación de outfits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Image */}
          <div className="aspect-[3/4] w-full max-w-[200px] mx-auto rounded-lg overflow-hidden bg-muted">
            <img
              src={model.url}
              alt="Modelo"
              className="w-full h-full object-cover"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Physical Info Toggle */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-ink-500">
                Usar medidas en generación de outfits
              </label>
              <p className="text-xs text-muted-foreground">
                Las medidas se incluirán en el prompt de IA
              </p>
            </div>
            <Switch
              checked={usePhysicalInfo}
              onCheckedChange={setUsePhysicalInfo}
            />
          </div>

          {/* Physical Measurements Form */}
          {usePhysicalInfo && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Peso (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Altura (cm)
                  </label>
                  <Input
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Complexión
                </label>
                <Select value={bodyType} onValueChange={setBodyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona complexión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Delgado</SelectItem>
                    <SelectItem value="athletic">Atlético</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="robust">Robusto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}