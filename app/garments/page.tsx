'use client'
import { useState, useCallback, useEffect } from 'react'
import { useAppStore, type GarmentCategory } from '@/lib/store'
import { Shirt, Sparkles } from 'lucide-react'
import { Alert, AlertDescription, X } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

// Importar los nuevos componentes
import { UploadDialog } from '@/components/garments/upload-dialog'
import { WardrobeGallery } from '@/components/garments/wardrobe-gallery'
import { FloatingAddButton } from '@/components/garments/floating-add-button'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'

export default function GarmentsPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [success, setSuccess] = useState<string>('')
  
  // Usar Zustand store
  const { garments, addGarments, initialize, getGarmentsByCategory } = useAppStore()

  // Obtener número de categorías activas para el badge
  const garmentsByCategory = getGarmentsByCategory()
  const activeCategoriesCount = Object.values(garmentsByCategory).filter(category => category.length > 0).length

  // Inicializar store al montar componente
  useEffect(() => {
    initialize()
  }, [initialize])

  const handleUploadComplete = useCallback((urls: string[], categories: GarmentCategory[]) => {
    const newGarments = urls.map((url, index) => ({
      url,
      category: categories[index]
    }))
    addGarments(newGarments)
    setSuccess(`${urls.length} prenda(s) añadida(s) a tu colección`)
    setTimeout(() => setSuccess(''), 3000)
  }, [addGarments])

  const clearMessages = useCallback(() => {
    setSuccess('')
  }, [])

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header con estadísticas integradas */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Shirt className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Colección de Prendas</h1>
                <p className="text-muted-foreground">Organiza tu armario virtual para crear looks únicos</p>
              </div>
            </div>
            {garments.length > 0 && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm">
                  {garments.length} prenda{garments.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  <Tag className="h-3 w-3 mr-1" />
                  {activeCategoriesCount} categorías activas
                </Badge>
              </div>
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

        </div>

        {/* Wardrobe Gallery - This is now the main content */}
        <WardrobeGallery onAddClick={() => setShowUploadDialog(true)} />

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