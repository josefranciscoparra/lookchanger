'use client'
import { useState, useCallback } from 'react'
import { Upload, X, Camera, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: (urls: string[]) => void
}

export function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  // Physical measurements state
  const [showPhysicalInfo, setShowPhysicalInfo] = useState(false)
  const [usePhysicalInfo, setUsePhysicalInfo] = useState(false)
  const [weight, setWeight] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [bodyType, setBodyType] = useState<string>('')

  const onUpload = useCallback(async () => {
    if (!files.length) {
      setError('Selecciona al menos un archivo')
      return
    }

    setUploadLoading(true)
    setError('')
    setSuccess('')
    setUploadProgress(0)

    try {
      const body = new FormData()
      files.forEach(f => body.append('files', f))

      // Añadir información física si está activada
      if (usePhysicalInfo) {
        if (weight) body.append('weight', weight)
        if (height) body.append('height', height)
        if (bodyType) body.append('body_type', bodyType)
        body.append('use_physical_info', 'true')
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev < 90 ? prev + 10 : prev)
      }, 200)

      const res = await fetch('/api/upload?type=model', { method: 'POST', body })
      const json = await res.json()

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        throw new Error(json.error || 'Error al subir archivos')
      }

      if (json.urls && json.urls.length > 0) {
        onUploadComplete(json.urls)
      }

      setFiles([])
      setWeight('')
      setHeight('')
      setBodyType('')
      setUsePhysicalInfo(false)
      setShowPhysicalInfo(false)
      setSuccess(`${json.urls?.length || 0} modelo(s) subido(s) correctamente`)

      setTimeout(() => {
        setUploadProgress(0)
        setSuccess('')
        onOpenChange(false)
      }, 2000)

    } catch (err) {
      setUploadProgress(0)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setUploadLoading(false)
    }
  }, [files, usePhysicalInfo, weight, height, bodyType, onUploadComplete, onOpenChange])

  const clearMessages = useCallback(() => {
    setError('')
    setSuccess('')
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      )
      setFiles(prev => [...prev, ...droppedFiles])
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(newFiles)
    }
  }, [])

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Añadir Modelos a tu Galería
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Mensajes */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="ghost" size="sm" onClick={clearMessages}>
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-700">
                <Sparkles className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{success}</span>
                  <Button variant="ghost" size="sm" onClick={clearMessages}>
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Zone */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Drag & Drop Area */}
              <div className="md:col-span-2">
                <div
                  className={`relative rounded-lg border-2 border-dashed transition-all duration-200 ${
                    dragActive 
                      ? 'border-primary bg-primary/5 scale-[1.02]' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className={`p-4 rounded-full mb-4 transition-colors ${
                      dragActive ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Camera className={`h-8 w-8 ${
                        dragActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {dragActive ? '¡Suelta aquí tus imágenes!' : 'Sube tus modelos'}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md text-sm">
                      Arrastra y suelta archivos aquí o haz clic para seleccionar fotos de modelos
                    </p>
                    
                    <Button variant="default" size="lg" asChild>
                      <label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Seleccionar Archivos
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tips Panel */}
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Consejos para mejores resultados</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Buena iluminación natural o estudio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Fondo simple y neutro (blanco ideal)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Persona visible de cuerpo completo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Postura natural y brazos separados</span>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-blue-900">Formatos soportados</h4>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>📸 JPG, PNG, WebP</p>
                    <p>📏 Máximo 10MB por archivo</p>
                    <p>🎯 Resolución recomendada: 1024px+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Files Selected */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Archivos Seleccionados</h4>
                  <Badge variant="secondary">{files.length}</Badge>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded">
                        <Camera className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {uploadLoading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Subiendo modelos...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Physical Information Section */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowPhysicalInfo(!showPhysicalInfo)}
                    className="w-full flex items-center justify-between text-sm font-medium text-ink-500 hover:text-ink-600 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Información física del modelo (opcional)
                    </span>
                    {showPhysicalInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showPhysicalInfo && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium text-ink-500">
                            Usar medidas en generación de outfits
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Las medidas se incluirán en el prompt de IA para mejor ajuste
                          </p>
                        </div>
                        <Switch
                          checked={usePhysicalInfo}
                          onCheckedChange={setUsePhysicalInfo}
                        />
                      </div>

                      {usePhysicalInfo && (
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
                              className="h-9"
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
                              className="h-9"
                            />
                          </div>

                          <div className="col-span-2 space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                              Complexión
                            </label>
                            <Select value={bodyType} onValueChange={setBodyType}>
                              <SelectTrigger className="h-9">
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
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={onUpload}
                    disabled={uploadLoading}
                    className="flex-1"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Subir {files.length} Modelo{files.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}