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
      <main className="mx-auto max-w-6xl px-6 pb-28 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-500">Galería</h1>
          <p className="mt-1 text-text-secondary">Cargando tus outfits generados...</p>
        </div>
        <LoadingSpinner size="lg" text="Cargando galería..." />
      </main>
    )
  }

  if (generatedImages.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 pb-28 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-500">Galería</h1>
          <p className="mt-1 text-text-secondary">Tus outfits generados aparecerán aquí</p>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
            <Image className="h-8 w-8 text-ink-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-ink-500">
            Aún no has generado ningún outfit
          </h3>
          <p className="mb-6 text-sm text-text-secondary">
            Crea tu primer outfit para empezar a construir tu galería.
          </p>
          <Button variant="accent" asChild>
            <a href="/outfits">
              <Zap className="h-4 w-4 mr-2" />
              Crear outfit
            </a>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pb-28 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-500">Galería</h1>
        <p className="mt-1 text-text-secondary">
          {generatedImages.reduce((total, group) => total + group.outputs.length, 0)} {generatedImages.reduce((total, group) => total + group.outputs.length, 0) === 1 ? 'outfit generado' : 'outfits generados'}
        </p>
      </div>

      <div className="space-y-10">
        {generatedImages.map((imageGroup, groupIndex) => (
          <div key={imageGroup.job.id} className="space-y-3">
            {/* Header con fecha y badges */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(imageGroup.job.created_at)}</span>
                {imageGroup.job.style_json && (
                  <>
                    {Object.entries(imageGroup.job.style_json).slice(0, 2).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {String(value)}
                      </Badge>
                    ))}
                  </>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadAllImages(imageGroup.outputs, groupIndex)}
                className="h-8 w-8 p-0"
                title="Descargar todas las imágenes"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Grid de imágenes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {imageGroup.outputs.map((output, outputIndex) => (
                <div
                  key={output.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  onClick={() => openPreview(
                    output.image_url,
                    'Outfit generado',
                    formatDate(imageGroup.job.created_at),
                    true
                  )}
                >
                  <img
                    src={output.image_url}
                    alt={`Outfit generado ${outputIndex + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
              ))}
            </div>
          </div>
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
    </main>
  )
}