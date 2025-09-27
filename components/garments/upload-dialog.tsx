'use client'
import { useState, useCallback } from 'react'
import { type GarmentCategory } from '@/lib/store'
import { Upload, X, Package, Info, Palette, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface FileWithCategory {
  file: File
  category: GarmentCategory | null
}

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: (urls: string[], categories: GarmentCategory[]) => void
}

const categoryInfo = {
  tops: { name: 'Tops', icon: '👕', color: 'bg-red-100 text-red-700', description: 'Camisetas, camisas, blusas' },
  bottoms: { name: 'Pantalones', icon: '👖', color: 'bg-blue-100 text-blue-700', description: 'Pantalones, faldas, shorts' },
  vestidos: { name: 'Vestidos', icon: '👗', color: 'bg-purple-100 text-purple-700', description: 'Vestidos y monos' },
  calzado: { name: 'Calzado', icon: '👞', color: 'bg-green-100 text-green-700', description: 'Zapatos, botas, sandalias' },
  abrigos: { name: 'Abrigos', icon: '🧥', color: 'bg-indigo-100 text-indigo-700', description: 'Chaquetas, abrigos, blazers' },
  accesorios: { name: 'Accesorios', icon: '👜', color: 'bg-orange-100 text-orange-700', description: 'Bolsos, cinturones, joyas' },
}

export function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [fileCategories, setFileCategories] = useState<{ [key: string]: GarmentCategory | null }>({})
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const validateCategories = () => {
    return files.every(file => {
      const category = fileCategories[file.name]
      return category !== null && category !== undefined
    })
  }

  const onUpload = useCallback(async () => {
    if (!files.length) {
      setError('Selecciona al menos un archivo')
      return
    }

    if (!validateCategories()) {
      setError('Asigna una categoría a cada prenda antes de subir')
      setShowCategoryDialog(true)
      return
    }

    setUploadLoading(true)
    setError('')
    setSuccess('')
    setUploadProgress(0)
    
    try {
      const body = new FormData()
      files.forEach(f => body.append('files', f))
      
      files.forEach(file => {
        const category = fileCategories[file.name]
        if (category) {
          body.append('categories', category)
        }
      })
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev < 90 ? prev + 10 : prev)
      }, 200)
      
      const res = await fetch('/api/upload?type=garment', { method: 'POST', body })
      const json = await res.json()
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!res.ok) {
        throw new Error(json.error || 'Error al subir archivos')
      }
      
      if (json.urls && json.urls.length > 0) {
        const categories = files.map(file => fileCategories[file.name] as GarmentCategory)
        onUploadComplete(json.urls, categories)
      }
      
      setFiles([])
      setFileCategories({})
      setSuccess(`${json.urls?.length || 0} prenda(s) añadida(s) a tu colección`)
      
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
  }, [files, fileCategories, onUploadComplete, onOpenChange])

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
      if (droppedFiles.length > 0) {
        setShowCategoryDialog(true)
      }
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(newFiles)
      if (newFiles.length > 0) {
        setShowCategoryDialog(true)
      }
    }
  }, [])

  const setCategoryForFile = (fileName: string, category: GarmentCategory) => {
    setFileCategories(prev => ({
      ...prev,
      [fileName]: category
    }))
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Añadir Prendas a tu Armario
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
                      <Package className={`h-8 w-8 ${
                        dragActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {dragActive ? '¡Suelta aquí tus prendas!' : 'Selecciona tus prendas'}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md text-sm">
                      Arrastra y suelta archivos aquí o haz clic para seleccionar imágenes de tu dispositivo
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
                    <h4 className="font-semibold text-sm">Tips para mejores resultados</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Fondo blanco o neutro para mejor detección</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Prenda bien extendida y visible completamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Evita sombras pronunciadas o reflejos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Resolución mínima de 1024px para mejor calidad</span>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-blue-900">Categorías disponibles</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-blue-700">👕 Tops</span>
                    <span className="text-blue-700">👖 Pantalones</span>
                    <span className="text-blue-700">👗 Vestidos</span>
                    <span className="text-blue-700">👞 Calzado</span>
                    <span className="text-blue-700">🧥 Abrigos</span>
                    <span className="text-blue-700">👜 Accesorios</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Files Selected */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Prendas Seleccionadas</h4>
                  <Badge variant="secondary">{files.length}</Badge>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {files.map((file, i) => {
                    const category = fileCategories[file.name]
                    const categoryData = category ? categoryInfo[category] : null
                    
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="p-2 bg-green-100 rounded">
                          {categoryData ? (
                            <span className="text-lg">{categoryData.icon}</span>
                          ) : (
                            <Package className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                            {categoryData && (
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${categoryData.color}`}>
                                {categoryData.name}
                              </span>
                            )}
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
                    )
                  })}
                </div>
                
                {!validateCategories() && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Asigna una categoría a cada prenda para continuar</span>
                      <Button variant="outline" size="sm" onClick={() => setShowCategoryDialog(true)}>
                        <Palette className="mr-2 h-4 w-4" />
                        Categorizar
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                {uploadLoading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Añadiendo a tu colección...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={onUpload}
                    disabled={uploadLoading || !validateCategories()}
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
                        Añadir {files.length} Prenda{files.length !== 1 ? 's' : ''}
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

          {/* Category Dialog */}
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Categorizar Prendas
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {files.map((file, i) => {
                  const currentCategory = fileCategories[file.name]
                  
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <Select 
                        value={currentCategory || ''} 
                        onValueChange={(value) => setCategoryForFile(file.name, value as GarmentCategory)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryInfo).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <span>{info.icon}</span>
                                <span>{info.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCategoryDialog(false)}
                >
                  Cerrar
                </Button>
                {validateCategories() && (
                  <Button onClick={() => setShowCategoryDialog(false)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Continuar
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}