'use client'
import { useState, useCallback, useEffect } from 'react'
import { useAppStore, type GarmentCategory } from '@/lib/store'
import { Upload, X, Shirt, Plus, Package, Sparkles, Info, Tag, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FileWithCategory {
  file: File
  category: GarmentCategory | null
}

export default function GarmentsPage() {
  const [files, setFiles] = useState<File[]>([])
  const [fileCategories, setFileCategories] = useState<{ [key: string]: GarmentCategory | null }>({})
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  
  // Usar Zustand store
  const { 
    garments, 
    isLoading, 
    addGarments, 
    removeGarment, 
    getGarmentsByCategory,
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
      
      // Añadir categorías
      files.forEach(file => {
        const category = fileCategories[file.name]
        if (category) {
          body.append('categories', category)
        }
      })
      
      // Simular progreso
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
      
      // Añadir prendas al store con categorías
      if (json.urls && json.urls.length > 0) {
        const newGarments = json.urls.map((url: string, index: number) => ({
          url,
          category: fileCategories[files[index].name] as GarmentCategory
        }))
        addGarments(newGarments)
      }
      setFiles([])
      setFileCategories({})
      setSuccess(`${json.urls?.length || 0} prenda(s) añadida(s) a tu colección`)
      
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
  }, [files, fileCategories, addGarments])

  const removeImage = useCallback((index: number) => {
    removeGarment(index)
  }, [removeGarment])

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
      // Si solo hay un archivo, mostrar el diálogo de categoría
      if (newFiles.length === 1) {
        setShowCategoryDialog(true)
      } else if (newFiles.length > 1) {
        // Para múltiples archivos, mostrar el diálogo
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

  const categoryInfo = {
    tops: { name: 'Tops', icon: '👕', color: 'bg-red-100 text-red-700', description: 'Camisetas, camisas, blusas' },
    bottoms: { name: 'Pantalones', icon: '👖', color: 'bg-blue-100 text-blue-700', description: 'Pantalones, faldas, shorts' },
    vestidos: { name: 'Vestidos', icon: '👗', color: 'bg-purple-100 text-purple-700', description: 'Vestidos y monos' },
    calzado: { name: 'Calzado', icon: '👞', color: 'bg-green-100 text-green-700', description: 'Zapatos, botas, sandalias' },
    abrigos: { name: 'Abrigos', icon: '🧥', color: 'bg-indigo-100 text-indigo-700', description: 'Chaquetas, abrigos, blazers' },
    accesorios: { name: 'Accesorios', icon: '👜', color: 'bg-orange-100 text-orange-700', description: 'Bolsos, cinturones, joyas' },
  }

  const garmentsByCategory = getGarmentsByCategory()
  const garmentCategories = Object.entries(categoryInfo).map(([key, info]) => ({
    key: key as GarmentCategory,
    name: info.name,
    icon: info.icon,
    count: garmentsByCategory[key as GarmentCategory]?.length || 0,
    color: info.color,
    description: info.description
  }))

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Shirt className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Colección de Prendas</h1>
              <p className="text-muted-foreground">Organiza tu armario virtual para crear looks únicos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {garments.length} prenda{garments.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Tag className="h-3 w-3 mr-1" />
              {garmentCategories.length} categorías
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {garmentCategories.map((category) => (
            <Card key={category.key} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mb-2 ${category.color}`}>
                  {category.name}
                </div>
                <p className="text-2xl font-bold">{category.count}</p>
                <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
              </CardContent>
            </Card>
          ))}
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
                  <Package className={`h-8 w-8 ${
                    dragActive ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {dragActive ? '¡Suelta aquí tus prendas!' : 'Añade a tu colección'}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Arrastra y suelta archivos aquí o haz clic para seleccionar. 
                  Ropa, zapatos, bolsos y complementos bienvenidos.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="default" size="lg" asChild>
                    <label className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Seleccionar Prendas
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
                        <p className="font-semibold mb-1">Tips para mejores resultados:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Fondo blanco o neutro</li>
                          <li>• Prenda bien extendida</li>
                          <li>• Sin sombras pronunciadas</li>
                          <li>• Alta resolución (1024px+)</li>
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
                <CardTitle className="text-lg">Prendas Seleccionadas</CardTitle>
                <Badge variant="secondary">{files.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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
              
              <Button 
                onClick={onUpload}
                disabled={uploadLoading || isLoading || !validateCategories()}
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
                    Añadir {files.length} Prenda{files.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

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

        {/* Gallery */}
        {garments.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  Tu Armario Virtual
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Más
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
              <CardDescription>
                {garments.length} prenda{garments.length !== 1 ? 's' : ''} lista{garments.length !== 1 ? 's' : ''} para crear outfits increíbles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todas" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="todas" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Todas
                  </TabsTrigger>
                  {garmentCategories.map((category) => (
                    <TabsTrigger 
                      key={category.key} 
                      value={category.key}
                      className="flex items-center gap-1"
                      disabled={category.count === 0}
                    >
                      <span className="text-xs">{category.icon}</span>
                      {category.name}
                      {category.count > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {category.count}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="todas" className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {garments.map((garment, index) => {
                      const categoryData = garment.category ? categoryInfo[garment.category] : null
                      return (
                        <div 
                          key={garment.url} 
                          className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover:scale-[1.02] transition-transform duration-200"
                        >
                          <img 
                            src={garment.url} 
                            alt={`Prenda ${index + 1}`}
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(index)}
                              className="h-8 w-8 p-0"
                              title="Eliminar prenda"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <div className="flex items-center justify-between">
                              <p className="text-white text-xs font-medium">
                                #{index + 1}
                              </p>
                              {categoryData && (
                                <span className="text-white text-xs">
                                  {categoryData.icon}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
                
                {garmentCategories.map((category) => (
                  <TabsContent key={category.key} value={category.key} className="mt-4">
                    {garmentsByCategory[category.key]?.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {garmentsByCategory[category.key].map((garment, index) => (
                          <div 
                            key={garment.url} 
                            className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover:scale-[1.02] transition-transform duration-200"
                          >
                            <img 
                              src={garment.url} 
                              alt={`${category.name} ${index + 1}`}
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const globalIndex = garments.findIndex(g => g.url === garment.url)
                                  if (globalIndex !== -1) removeImage(globalIndex)
                                }}
                                className="h-8 w-8 p-0"
                                title="Eliminar prenda"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                              <div className="flex items-center justify-between">
                                <p className="text-white text-xs font-medium">
                                  {category.name} #{index + 1}
                                </p>
                                <span className="text-white text-sm">
                                  {category.icon}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="text-4xl mb-4">{category.icon}</div>
                        <h3 className="text-lg font-semibold mb-2">Sin {category.name}</h3>
                        <p className="text-muted-foreground mb-4">
                          No tienes {category.description.toLowerCase()} en tu armario
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir {category.name}
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
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-muted rounded-full">
                  <Shirt className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Tu armario está vacío</h3>
                  <p className="text-muted-foreground max-w-md">
                    Comienza a construir tu colección de prendas virtuales. 
                    ¡Cada pieza es una nueva posibilidad de crear looks únicos!
                  </p>
                </div>
                <Button variant="outline" size="lg" asChild>
                  <label className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Primera Prenda
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