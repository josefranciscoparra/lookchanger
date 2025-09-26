'use client'
import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Upload, X, User, Plus, Camera, Sparkles, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function ModelsPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploadLoading, setUploadLoading] = useState(false)
  
  // Usar Zustand store
  const { 
    models, 
    isLoading, 
    addModels, 
    removeModel, 
    initialize 
  } = useAppStore()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  // Inicializar store al montar componente
  useEffect(() => {
    initialize()
  }, [])

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
      
      // Simular progreso
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
      
      // Añadir modelos al store
      if (json.urls && json.urls.length > 0) {
        const newModels = json.urls.map((url: string) => ({ url }))
        addModels(newModels)
      }
      setFiles([])
      setSuccess(`${json.urls?.length || 0} modelo(s) subido(s) correctamente`)
      
      // Limpiar el input
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      if (input) input.value = ''
      
      setTimeout(() => {
        setUploadProgress(0)
        setSuccess('')
      }, 3000)
      
    } catch (err) {
      setUploadProgress(0)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setUploadLoading(false)
    }
  }, [files])

  const removeImage = useCallback((index: number) => {
    removeModel(index)
  }, [removeModel])

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
      setFiles(Array.from(e.target.files))
    }
  }, [])

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
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
          <Badge variant="outline" className="text-sm">
            {models.length} modelo{models.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Mensajes */}
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearMessages}>
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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

        {/* Upload Zone */}
        <Card className="border-2 border-dashed transition-colors duration-200">
          <CardContent className="pt-6">
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
                <p className="text-muted-foreground mb-4 max-w-md">
                  Arrastra y suelta archivos aquí o haz clic para seleccionar. 
                  Formatos: JPG, PNG, WebP (máx. 10MB)
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="lg">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm max-w-xs">
                        <p className="font-semibold mb-1">Consejos:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Buena iluminación natural</li>
                          <li>• Fondo simple y neutro</li>
                          <li>• Persona visible de cuerpo completo</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Selected */}
        {files.length > 0 && (
          <Card className="animate-in slide-in-from-bottom-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Archivos Seleccionados</CardTitle>
                <Badge variant="secondary">{files.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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
              
              {uploadLoading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subiendo modelos...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              <Button 
                onClick={onUpload}
                disabled={uploadLoading || isLoading}
                className="w-full"
                size="lg"
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
            </CardContent>
          </Card>
        )}

        {/* Gallery */}
        {models.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Galería de Modelos
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Más
                </Button>
              </div>
              <CardDescription>
                {models.length} modelo{models.length !== 1 ? 's' : ''} disponible{models.length !== 1 ? 's' : ''} para crear outfits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
        ) : (
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
                <Button variant="outline" size="lg" asChild>
                  <label className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Subir Primer Modelo
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
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}