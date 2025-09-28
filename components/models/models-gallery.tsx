'use client'
import { useAppStore } from '@/lib/store'
import { User, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ModelsGalleryProps {
  onAddClick: () => void
}

export function ModelsGallery({ onAddClick }: ModelsGalleryProps) {
  const { models, removeModel } = useAppStore()

  const removeImage = (index: number) => {
    removeModel(index)
  }

  if (models.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No hay modelos aún</h3>
              <p className="text-muted-foreground max-w-md">
                Sube tus primeros modelos para comenzar a crear looks únicos con inteligencia artificial.
              </p>
            </div>
            <Button variant="default" size="lg" onClick={onAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Subir Primer Modelo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Galería de Modelos
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onAddClick} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Más
          </Button>
        </div>
        <CardDescription>
          {models.length} modelo{models.length !== 1 ? 's' : ''} disponible{models.length !== 1 ? 's' : ''} para crear outfits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {models.map((model, index) => (
            <div 
              key={model.url} 
              className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-muted hover:scale-[1.02] transition-transform duration-200"
            >
              <img 
                src={model.url} 
                alt={`Modelo ${index + 1}`}
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                  className="h-8 w-8 p-0"
                  title="Eliminar modelo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">
                  Modelo {index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}