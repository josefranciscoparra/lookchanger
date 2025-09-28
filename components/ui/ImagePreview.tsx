'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

interface ImagePreviewProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
  subtitle?: string
  showDownload?: boolean
}

export function ImagePreview({ isOpen, onClose, imageUrl, title, subtitle, showDownload = false }: ImagePreviewProps) {
  const [downloading, setDownloading] = useState(false)
  
  const handleDownload = async () => {
    if (!imageUrl) return
    
    try {
      setDownloading(true)
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('No se pudo descargar la imagen')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Extract extension from URL or default to jpg
      const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.${extension}`
      link.download = filename
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando la imagen:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-white border-border">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-ink-500">{title}</DialogTitle>
          {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className="relative rounded-xl overflow-hidden bg-surface">
            <img
              src={imageUrl}
              alt={title}
              className="w-full max-h-[70vh] object-contain"
            />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-text-secondary">
              Haz clic fuera o presiona ESC para cerrar
            </div>
            {showDownload && (
              <Button
                variant="accent"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2"
              >
                {downloading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Descargar imagen
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}