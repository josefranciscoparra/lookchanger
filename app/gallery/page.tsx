'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ImagePreview } from '@/components/ui/ImagePreview'
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

  // Preview states
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewSubtitle, setPreviewSubtitle] = useState('')
  const [previewShowDownload, setPreviewShowDownload] = useState(false)

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

  const downloadAllImages = async (outputs: Output[], groupIndex: number) => {
    try {
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i]
        const response = await fetch(output.image_url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `generacion-${groupIndex + 1}-variante-${i + 1}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        // Pequeño delay entre descargas para no saturar el navegador
        if (i < outputs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      // toast.success(`${outputs.length} imágenes descargadas exitosamente`)
    } catch (error) {
      console.error('Error downloading all images:', error)
      // toast.error('Error al descargar las imágenes')
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

  const openPreview = (url: string, title: string, subtitle = '', showDownload = true) => {
    setPreviewUrl(url)
    setPreviewTitle(title)
    setPreviewSubtitle(subtitle)
    setPreviewShowDownload(showDownload)
    setPreviewOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Image className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Mis Imágenes Generadas</h1>
        </div>

        <LoadingSpinner size="lg" text="Cargando tus imágenes generadas..." />
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
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(imageGroup.job.created_at)}</span>
                  </div>

                  {imageGroup.job.style_json && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(imageGroup.job.style_json).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadAllImages(imageGroup.outputs, groupIndex)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                  title={`Descargar todas las imágenes (${imageGroup.outputs.length})`}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {imageGroup.outputs.map((output, outputIndex) => (
                  <div key={output.id} className="group relative">
                    <div
                      className="aspect-square overflow-hidden rounded-lg border bg-muted cursor-pointer"
                      onClick={() => openPreview(
                        output.image_url,
                        'Outfit Generado',
                        formatDate(imageGroup.job.created_at),
                        true
                      )}
                    >
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Preview Modal */}
      <ImagePreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        imageUrl={previewUrl}
        title={previewTitle}
        subtitle={previewSubtitle}
        showDownload={previewShowDownload}
      />
    </div>
  )
}