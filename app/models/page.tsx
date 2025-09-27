'use client'
import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { User, Sparkles, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'

// Importar los nuevos componentes
import { UploadDialog } from '@/components/models/upload-dialog'
import { ModelsGallery } from '@/components/models/models-gallery'
import { FloatingAddButton } from '@/components/models/floating-add-button'

export default function ModelsPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [success, setSuccess] = useState<string>('')
  
  // Usar Zustand store
  const { models, addModels, initialize } = useAppStore()

  // Inicializar store al montar componente
  useEffect(() => {
    initialize()
  }, [initialize])

  const handleUploadComplete = useCallback((urls: string[]) => {
    const newModels = urls.map((url) => ({ url }))
    addModels(newModels)
    setSuccess(`${urls.length} modelo(s) subido(s) correctamente`)
    setTimeout(() => setSuccess(''), 3000)
  }, [addModels])

  const clearMessages = useCallback(() => {
    setSuccess('')
  }, [])

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header simplificado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Modelos</h1>
              <p className="text-muted-foreground">Sube y organiza tus modelos para crear looks únicos</p>
            </div>
          </div>
          {models.length > 0 && (
            <Badge variant="outline" className="text-sm">
              {models.length} modelo{models.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-700 animate-in slide-in-from-top-2">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{success}</span>
              <Button variant="ghost" size="sm" onClick={clearMessages}>
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Models Gallery - Contenido principal */}
        <ModelsGallery onAddClick={() => setShowUploadDialog(true)} />

        {/* Upload Dialog */}
        <UploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onUploadComplete={handleUploadComplete}
        />

        {/* Floating Add Button */}
        <FloatingAddButton onClick={() => setShowUploadDialog(true)} />
      </div>
    </TooltipProvider>
  )
}