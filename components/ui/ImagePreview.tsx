'use client'
import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-white p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg overflow-auto"
          )}
        >
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-surface z-10">
            <X className="h-5 w-5 text-ink-500" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
          <div className="px-6 pt-6 pb-4">
            <DialogPrimitive.Title className="text-xl font-semibold text-ink-500">
              {title}
            </DialogPrimitive.Title>
            {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
          </div>

          <div className="px-6 pb-6">
            <div className="relative rounded-xl overflow-hidden bg-surface">
              <img
                src={imageUrl}
                alt={title}
                className="w-full max-h-[50vh] sm:max-h-[70vh] object-contain"
              />
            </div>

            <div className="flex items-center justify-end mt-4">
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}