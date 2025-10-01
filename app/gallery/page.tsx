'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ImagePreview } from '@/components/ui/ImagePreview'
import { DisputeModal } from '@/components/DisputeModal'
import { useAppStore } from '@/lib/store'
import { Image, Download, Calendar, Zap, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

type Output = {
  id: string
  job_id: string
  image_url: string
  meta?: any
  created_at: string
  can_dispute?: boolean
  days_since_creation?: number
  dispute_window_remaining?: number
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

type PaginationInfo = {
  total: number
  currentPage: number
  totalPages: number
}

export default function GalleryPage() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    currentPage: 1,
    totalPages: 0
  })
  const { refreshCredits } = useAppStore()

  // Preview states
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewSubtitle, setPreviewSubtitle] = useState('')
  const [previewShowDownload, setPreviewShowDownload] = useState(false)

  // Dispute modal states
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [selectedOutputId, setSelectedOutputId] = useState<string>('')

  useEffect(() => {
    loadGeneratedImages(1)
  }, [])

  const loadGeneratedImages = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gallery?page=${page}&limit=6`)
      const data = await response.json()

      if (data.success) {
        setGeneratedImages(data.images)
        setPagination({
          total: data.total,
          currentPage: data.currentPage,
          totalPages: data.totalPages
        })
      } else {
        console.error('Error from API:', data.error)
      }
    } catch (error) {
      console.error('Error loading generated images:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadGeneratedImages(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const openDisputeModal = (outputId: string) => {
    setSelectedOutputId(outputId)
    setDisputeModalOpen(true)
  }

  const handleDisputeSuccess = async () => {
    // Recargar galería y refrescar créditos
    await loadGeneratedImages(pagination.currentPage)
    await refreshCredits()
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

  if (generatedImages.length === 0 && pagination.total === 0) {
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
          {pagination.total} {pagination.total === 1 ? 'generación' : 'generaciones'} • Página {pagination.currentPage} de {pagination.totalPages}
        </p>
      </div>

      {/* Grid de generaciones - 3 por fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedImages.map((imageGroup, groupIndex) => (
          <div
            key={imageGroup.job.id}
            className="rounded-2xl border border-border bg-white p-4 shadow-card space-y-3"
          >
            {/* Header con fecha, badges y botón descarga */}
            <div className="flex flex-col gap-2 pb-2 border-b border-border">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(imageGroup.job.created_at)}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadAllImages(imageGroup.outputs, groupIndex)}
                  className="h-6 px-2 text-xs"
                  title="Descargar todas"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>

              {imageGroup.job.style_json && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Object.entries(imageGroup.job.style_json).slice(0, 2).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {String(value)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Grid de imágenes dentro de cada grupo */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {imageGroup.outputs.map((output, outputIndex) => (
                <div
                  key={output.id}
                  className="group relative w-64 h-64 overflow-hidden rounded-xl border border-border bg-gray-50 shadow-sm transition-all duration-300 hover:shadow-md flex items-center justify-center"
                >
                  <div
                    className="cursor-pointer h-full w-full flex items-center justify-center"
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
                      className="max-h-full max-w-full object-cover transition-transform duration-500 group-hover:scale-105"
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

                  {/* Botón de reportar problema */}
                  {output.can_dispute && (
                    <div className="absolute bottom-2 right-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-md h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDisputeModal(output.id)
                        }}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Controles de paginación */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar solo páginas cercanas a la actual
              const showPage =
                page === 1 ||
                page === pagination.totalPages ||
                Math.abs(page - pagination.currentPage) <= 1

              if (!showPage && page === 2 && pagination.currentPage > 3) {
                return <span key={page} className="px-2 text-text-secondary">...</span>
              }
              if (!showPage && page === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2) {
                return <span key={page} className="px-2 text-text-secondary">...</span>
              }
              if (!showPage) return null

              return (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Image Preview Modal */}
      <ImagePreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        imageUrl={previewUrl}
        title={previewTitle}
        subtitle={previewSubtitle}
        showDownload={previewShowDownload}
      />

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        outputId={selectedOutputId}
        onSuccess={handleDisputeSuccess}
      />
    </main>
  )
}