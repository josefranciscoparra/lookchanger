'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Image, Download, Calendar, Zap } from 'lucide-react'
// import { toast } from 'sonner' // Toast no disponible

type Output = {
  id: string
  job_id: string
  image_url: string
  meta?: any
  created_at: string
}

type OutfitJob = {
  id: string
  user_id?: string
  model_ids: string[]
  garment_ids: string[]
  style_json?: any
  status: 'queued' | 'running' | 'completed' | 'failed'
  cost_cents: number
  created_at: string
}

type GeneratedImageGroup = {
  job: OutfitJob
  outputs: Output[]
}

export default function GalleryPage() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGeneratedImages()
  }, [])

  const loadGeneratedImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gallery')
      const data = await response.json()
      
      if (data.success) {
        setGeneratedImages(data.images)
      } else {
        console.error('Error from API:', data.error)
      }
    } catch (error) {
      console.error('Error loading generated images:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `outfit-generado-${index + 1}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // toast.success('Imagen descargada exitosamente')
    } catch (error) {
      console.error('Error downloading image:', error)
      // toast.error('Error al descargar la imagen')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCost = (costCents: number) => {
    return `${(costCents / 100).toFixed(2)}€`
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Image className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Mis Imágenes Generadas</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (generatedImages.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Image className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Mis Imágenes Generadas</h1>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              No hay imágenes generadas aún
            </h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer outfit para ver las imágenes generadas aquí.
            </p>
            <Button asChild>
              <a href="/outfits">
                <Zap className="h-4 w-4 mr-2" />
                Crear Outfit
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Image className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Mis Imágenes Generadas</h1>
        </div>
        <Badge variant="secondary">
          {generatedImages.reduce((total, group) => total + group.outputs.length, 0)} imágenes
        </Badge>
      </div>

      <div className="space-y-8">
        {generatedImages.map((imageGroup, groupIndex) => (
          <Card key={imageGroup.job.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Generación {groupIndex + 1}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {formatCost(imageGroup.job.cost_cents)}
                  </Badge>
                  <span>{formatDate(imageGroup.job.created_at)}</span>
                </div>
              </div>
              
              {imageGroup.job.style_json && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(imageGroup.job.style_json).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {imageGroup.outputs.map((output, outputIndex) => (
                  <div key={output.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={output.image_url}
                        alt={`Outfit generado ${outputIndex + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          img.src = 'data:image/svg+xml;base64,' + btoa(`
                            <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                              <rect width="100%" height="100%" fill="#f3f4f6"/>
                              <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">
                                Error cargando imagen
                              </text>
                            </svg>
                          `)
                        }}
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(output.image_url, outputIndex)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-center">
                      <p className="text-xs text-muted-foreground">
                        Variante {outputIndex + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}