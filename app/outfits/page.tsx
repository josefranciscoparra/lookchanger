
'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Wand2, Info, AlertTriangle, User, Shirt,
  ArrowRight, ArrowLeft, CheckCircle, Upload, Users, Palette,
  Zap, Star, Camera, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import JSZip from 'jszip'

type WizardStep = 'model' | 'garments' | 'style' | 'generate' | 'results'
type ModelType = 'existing' | 'generated'

interface ModelCharacteristics {
  skinTone: string
  bodyType: string
  gender: string
  age: string
}

type VariantType = 'pose' | 'fit' | 'lighting' | 'angle' | 'accessories'

interface VariantConfig {
  id: number
  type: VariantType
  description?: string
}

const VARIANT_OPTIONS = {
  pose: {
    label: 'Cambio de pose',
    description: 'Poses diferentes: lateral, caminando, sentada',
    icon: '🕺'
  },
  fit: {
    label: 'Ajuste diferente',
    description: 'Variación en el ajuste: más ceñido/suelto, diferentes pliegues',
    icon: '👔'
  },
  lighting: {
    label: 'Cambio de iluminación',
    description: 'Iluminación diferente: estudio, natural, dramática',
    icon: '💡'
  },
  angle: {
    label: 'Ángulo de cámara',
    description: 'Vista diferente: 3/4, perfil, vista trasera',
    icon: '📷'
  },
  accessories: {
    label: 'Accesorios complementarios',
    description: 'Añadir complementos sutiles que combinen',
    icon: '👜'
  }
} as const

export default function OutfitsPage() {
  // Usar Zustand store para modelos y prendas
  const { models, garments, initialize, user } = useAppStore()
  
  // Data states
  const [outputs, setOutputs] = useState<string[]>([])
  
  // Wizard states
  const [currentStep, setCurrentStep] = useState<WizardStep>('model')
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([])
  
  // Selection states
  const [selectedModelType, setSelectedModelType] = useState<ModelType>('existing')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [modelCharacteristics, setModelCharacteristics] = useState<ModelCharacteristics>({
    skinTone: '',
    bodyType: '',
    gender: '',
    age: ''
  })
  const [selectedGarments, setSelectedGarments] = useState<string[]>([])
  const [variants, setVariants] = useState(1)
  const [variantConfigs, setVariantConfigs] = useState<VariantConfig[]>([])
  const [useAdvancedStyle, setUseAdvancedStyle] = useState(false)
  const [stylePreferences, setStylePreferences] = useState({
    style: 'casual',
    season: 'any'
  })
  const [outfitOptions, setOutfitOptions] = useState({
    fullBodyVisible: true,
    showShoes: true,
    hideHatsAndCaps: true,
    adaptShoesToLook: true,
    removeSunglasses: false,
    onlySelectedGarments: false,
    photoStyle: 'original' as 'original' | 'studio' | 'outdoor' | 'casual' | 'professional'
  })
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [downloadingSingle, setDownloadingSingle] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [previewContext, setPreviewContext] = useState<'outfit' | 'garment' | 'model' | null>(null)
  const [previewTitle, setPreviewTitle] = useState('Vista previa')
  const [previewSubtitle, setPreviewSubtitle] = useState('')

  useEffect(() => {
    initialize()
  }, [initialize])

  // Helper functions para manejar variantes
  const updateVariantCount = useCallback((newCount: number) => {
    setVariants(newCount)
    
    // Ajustar configuraciones de variantes
    if (newCount > 1) {
      const currentConfigsCount = variantConfigs.length
      const neededConfigs = newCount - 1 // -1 porque la primera variante siempre es la original
      
      if (neededConfigs > currentConfigsCount) {
        // Añadir configuraciones por defecto
        const newConfigs = [...variantConfigs]
        const defaultTypes: VariantType[] = ['pose', 'fit', 'lighting', 'angle', 'accessories']
        
        for (let i = currentConfigsCount; i < neededConfigs; i++) {
          newConfigs.push({
            id: i + 2, // +2 porque la variante 1 es la original
            type: defaultTypes[i % defaultTypes.length]
          })
        }
        setVariantConfigs(newConfigs)
      } else if (neededConfigs < currentConfigsCount) {
        // Remover configuraciones sobrantes
        setVariantConfigs(variantConfigs.slice(0, neededConfigs))
      }
    } else {
      // Solo 1 variante, limpiar configuraciones
      setVariantConfigs([])
    }
  }, [variantConfigs])

  const updateVariantConfig = useCallback((variantId: number, type: VariantType) => {
    setVariantConfigs(configs => 
      configs.map(config => 
        config.id === variantId ? { ...config, type } : config
      )
    )
  }, [])

  const getFileExtension = (url: string) => {
    const cleanUrl = url.split('?')[0]
    const parts = cleanUrl.split('.')
    const rawExtension = parts.length > 1 ? parts.pop() ?? '' : ''
    const extension = rawExtension.trim().slice(0, 8)
    return extension || 'jpg'
  }

  const downloadFile = useCallback(async (url: string, filename: string) => {
    if (typeof window === 'undefined') return
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`No se pudo descargar ${filename}`)
    }
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }, [])

  const handleOpenPreview = useCallback(
    (
      url: string,
      options?: {
        index?: number | null
        title?: string
        subtitle?: string
        context?: 'outfit' | 'garment' | 'model' | null
      }
    ) => {
      setPreviewUrl(url)
      setPreviewIndex(options?.index ?? null)
      setPreviewContext(options?.context ?? null)
      setPreviewTitle(options?.title ?? 'Vista previa')
      setPreviewSubtitle(options?.subtitle ?? '')
      setIsPreviewOpen(true)
    },
    []
  )

  const handlePreviewChange = useCallback((open: boolean) => {
    setIsPreviewOpen(open)
    if (!open) {
      setPreviewUrl(null)
      setPreviewIndex(null)
      setPreviewContext(null)
      setPreviewTitle('Vista previa')
      setPreviewSubtitle('')
    }
  }, [])

  const handleDownloadSingle = useCallback(async () => {
    if (!previewUrl || previewContext !== 'outfit') return
    try {
      setDownloadError('')
      setDownloadingSingle(true)
      const extension = getFileExtension(previewUrl)
      const filename = `outfit-${(previewIndex ?? 0) + 1}.${extension}`
      await downloadFile(previewUrl, filename)
    } catch (err) {
      console.error('Error descargando la imagen individual:', err)
      setDownloadError('No se pudo descargar esta imagen. Intenta nuevamente.')
    } finally {
      setDownloadingSingle(false)
    }
  }, [downloadFile, previewIndex, previewUrl])

  const handleOpenImageInNewTab = useCallback(() => {
    if (!previewUrl) return
    window.open(previewUrl, '_blank', 'noopener')
  }, [previewUrl])

  const handleDownloadAll = useCallback(async () => {
    if (!outputs.length || downloadingAll) return
    try {
      setDownloadError('')
      setDownloadingAll(true)
      const zip = new JSZip()

      await Promise.all(
        outputs.map(async (url, index) => {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`No se pudo descargar la imagen ${index + 1}`)
          }
          const blob = await response.blob()
          const extension = getFileExtension(url)
          zip.file(`outfit-${index + 1}.${extension}`, blob)
        })
      )

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      if (typeof window !== 'undefined') {
        const downloadUrl = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `lookchanger-outfits-${new Date().toISOString().split('T')[0]}.zip`
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(downloadUrl)
      }
    } catch (err) {
      console.error('Error preparando la descarga de outfits:', err)
      setDownloadError('No pudimos preparar la descarga. Intenta de nuevo en unos segundos.')
    } finally {
      setDownloadingAll(false)
    }
  }, [downloadingAll, outputs])

  const steps: Array<{step: WizardStep, title: string, description: string, icon: any}> = [
    { step: 'model', title: 'Seleccionar Modelo', description: 'Elige o genera un modelo', icon: User },
    { step: 'garments', title: 'Elegir Prendas', description: 'Selecciona la ropa', icon: Shirt },
    { step: 'style', title: 'Configurar Estilo', description: 'Ajusta las preferencias', icon: Palette },
    { step: 'generate', title: 'Generar Outfit', description: 'Crear con IA', icon: Wand2 },
    { step: 'results', title: 'Ver Resultados', description: 'Tus outfits generados', icon: Star }
  ]

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 'model':
        return selectedModelType === 'existing' 
          ? selectedModel !== '' 
          : Object.values(modelCharacteristics).every(val => val !== '')
      case 'garments':
        return selectedGarments.length > 0
      case 'style':
        return true
      case 'generate':
        return true
      default:
        return false
    }
  }, [currentStep, selectedModel, selectedModelType, modelCharacteristics, selectedGarments])

  const nextStep = useCallback(() => {
    if (!canProceed()) return
    
    const stepIndex = steps.findIndex(s => s.step === currentStep)
    if (stepIndex < steps.length - 1) {
      const nextStepName = steps[stepIndex + 1].step
      setCurrentStep(nextStepName)
      
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep])
      }
    }
  }, [currentStep, canProceed, completedSteps, steps])

  const prevStep = useCallback(() => {
    const stepIndex = steps.findIndex(s => s.step === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].step)
    }
  }, [currentStep, steps])

  const generateOutfit = async () => {
    setLoading(true)
    setError('')
    setDownloadError('')
    setOutputs([])
    setGenerationProgress(0)
    setCurrentStep('generate')
    setIsPreviewOpen(false)
    setPreviewUrl(null)
    setPreviewIndex(null)
    
    try {
      // Simular progreso de generación
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) return prev
          return prev + Math.random() * 15
        })
      }, 500)
      
      const modelUrls = selectedModelType === 'existing' 
        ? [selectedModel]
        : [] // En el futuro aquí generaríamos el modelo basado en características
      
      const res = await fetch('/api/outfits/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelUrls,
          garmentUrls: selectedGarments,
          variants,
          variantConfigs,
          style: useAdvancedStyle ? stylePreferences : undefined,
          useAdvancedStyle,
          modelCharacteristics: selectedModelType === 'generated' ? modelCharacteristics : undefined,
          outfitOptions
        })
      })
      const json = await res.json()
      
      clearInterval(progressInterval)
      setGenerationProgress(100)
      
      if (!res.ok) {
        throw new Error(json.error || 'Error al generar el outfit')
      }
      
      setTimeout(() => {
        setOutputs(json.outputs || [])
        setCurrentStep('results')
        if (!completedSteps.includes('generate')) {
          setCompletedSteps(prev => [...prev, 'generate'])
        }
      }, 1000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setCurrentStep('style')
    } finally {
      setLoading(false)
    }
  }

  const resetWizard = useCallback(() => {
    setCurrentStep('model')
    setCompletedSteps([])
    setSelectedModel('')
    setSelectedGarments([])
    setModelCharacteristics({ skinTone: '', bodyType: '', gender: '', age: '' })
    setUseAdvancedStyle(false)
    setStylePreferences({ style: 'casual', season: 'any' })
    setOutfitOptions({
      fullBodyVisible: true,
      showShoes: true,
      hideHatsAndCaps: true,
      adaptShoesToLook: true,
      removeSunglasses: false,
      onlySelectedGarments: false,
      photoStyle: 'original' as 'original' | 'studio' | 'outdoor' | 'casual' | 'professional'
    })
    setOutputs([])
    setError('')
    setDownloadError('')
    setGenerationProgress(0)
    setIsPreviewOpen(false)
    setPreviewUrl(null)
    setPreviewIndex(null)
    setPreviewContext(null)
    setPreviewTitle('Vista previa')
    setPreviewSubtitle('')
    setDownloadingAll(false)
    setDownloadingSingle(false)
  }, [])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'model':
        return (
          <div className="space-y-6">
            <Tabs value={selectedModelType} onValueChange={(value) => setSelectedModelType(value as ModelType)}>
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-secondary/70 p-1 backdrop-blur">
                <TabsTrigger
                  value="existing"
                  className="flex items-center gap-2 rounded-xl text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  Usar Modelo Existente
                </TabsTrigger>
                <TabsTrigger
                  value="generated"
                  className="flex items-center gap-2 rounded-xl text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <Camera className="h-4 w-4" />
                  Generar Modelo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-4">
                {models.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {models.map((model, index) => {
                      const isSelected = selectedModel === model.url

                      return (
                        <button
                          type="button"
                          key={model.url}
                          onClick={() => setSelectedModel(model.url)}
                          className={`group relative overflow-hidden rounded-2xl border border-transparent bg-white/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                            isSelected ? 'border-primary/30 ring-2 ring-primary/30 shadow-lg' : ''
                          }`}
                        >
                          <img
                            src={model.url}
                            alt={`Modelo ${index + 1}`}
                            className="aspect-[3/4] w-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent p-2 text-left">
                            <p className="text-xs font-medium text-white/90">Modelo #{index + 1}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                              <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-primary/20 bg-white/60 p-12 text-center shadow-inner">
                    <User className="mb-4 h-12 w-12 mx-auto text-primary/60" />
                    <h3 className="mb-2 text-lg font-semibold text-foreground/90">No hay modelos disponibles</h3>
                    <p className="mb-5 text-sm text-muted-foreground">
                      Sube tus modelos para poder seleccionarlos rápidamente desde aquí.
                    </p>
                    <Button variant="outline" className="rounded-full border-primary/20 bg-white/80 text-primary hover:bg-primary/10">
                      <Upload className="mr-2 h-4 w-4" />
                      Ir a Modelos
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="generated" className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Tono de piel</label>
                    <Select value={modelCharacteristics.skinTone} onValueChange={(value) => 
                      setModelCharacteristics(prev => ({...prev, skinTone: value}))}>
                      <SelectTrigger className="rounded-xl border-primary/20 bg-white/80 text-sm">
                        <SelectValue placeholder="Selecciona tono de piel" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-primary/20 bg-white/95 shadow-lg">
                        <SelectItem value="very-light">Muy claro</SelectItem>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="tan">Bronceado</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="very-dark">Muy oscuro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Género</label>
                      <Select value={modelCharacteristics.gender} onValueChange={(value) => 
                        setModelCharacteristics(prev => ({...prev, gender: value}))}>
                        <SelectTrigger className="rounded-xl border-primary/20 bg-white/80 text-sm">
                          <SelectValue placeholder="Género" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-primary/20 bg-white/95 shadow-lg">
                          <SelectItem value="female">Femenino</SelectItem>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="non-binary">No binario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Edad aproximada</label>
                      <Select value={modelCharacteristics.age} onValueChange={(value) => 
                        setModelCharacteristics(prev => ({...prev, age: value}))}>
                        <SelectTrigger className="rounded-xl border-primary/20 bg-white/80 text-sm">
                          <SelectValue placeholder="Edad" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-primary/20 bg-white/95 shadow-lg">
                          <SelectItem value="young-adult">Joven adulto (20-30)</SelectItem>
                          <SelectItem value="adult">Adulto (30-45)</SelectItem>
                          <SelectItem value="middle-aged">Mediana edad (45-60)</SelectItem>
                          <SelectItem value="senior">Mayor (60+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Tipo de cuerpo</label>
                    <Select value={modelCharacteristics.bodyType} onValueChange={(value) => 
                      setModelCharacteristics(prev => ({...prev, bodyType: value}))}>
                      <SelectTrigger className="rounded-xl border-primary/20 bg-white/80 text-sm">
                        <SelectValue placeholder="Selecciona tipo de cuerpo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-primary/20 bg-white/95 shadow-lg">
                        <SelectItem value="slim">Delgado</SelectItem>
                        <SelectItem value="athletic">Atlético</SelectItem>
                        <SelectItem value="average">Promedio</SelectItem>
                        <SelectItem value="curvy">Curvilíneo</SelectItem>
                        <SelectItem value="plus-size">Talla grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Alert className="border-primary/20 bg-primary/5 text-sm">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-muted-foreground">
                    <span className="font-semibold text-primary/80">Próximamente:</span> La generación de modelos personalizados estará disponible muy pronto.
                    Mientras tanto, selecciona un modelo existente para continuar.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
        )
        
      case 'garments':
        return (
          <div className="space-y-6">
            {garments.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {garments.map((garment, index) => {
                  const isSelected = selectedGarments.includes(garment.url)

                  const toggleGarmentSelection = () => {
                    setSelectedGarments(prev =>
                      prev.includes(garment.url)
                        ? prev.filter(g => g !== garment.url)
                        : [...prev, garment.url]
                    )
                  }

                  return (
                    <div
                      key={garment.url}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={toggleGarmentSelection}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          toggleGarmentSelection()
                        }
                      }}
                      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-transparent bg-white/85 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        isSelected ? 'border-primary/40 ring-2 ring-primary/30 shadow-xl' : ''
                      }`}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        <img
                          src={garment.url}
                          alt={`Prenda ${index + 1}`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-sm font-medium text-primary">
                            <CheckCircle className="h-4 w-4" />
                            Seleccionada
                          </div>
                        )}
                        <div className="absolute bottom-4 right-4">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-full border-primary/30 bg-white/90 text-primary shadow-sm transition hover:bg-primary/20"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleOpenPreview(garment.url, {
                                index: null,
                                title: `Prenda ${index + 1}`,
                                subtitle: 'Vista ampliada de la prenda seleccionada.',
                                context: 'garment'
                              })
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-primary/10 bg-white/95 px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground/90">Prenda #{index + 1}</p>
                          <p className="text-xs text-muted-foreground">Haz clic o presiona Enter para alternar la selección.</p>
                        </div>
                        <CheckCircle
                          className={`h-5 w-5 transition-colors ${
                            isSelected ? 'text-primary' : 'text-muted-foreground/40'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-primary/20 bg-white/60 p-12 text-center shadow-inner">
                <Shirt className="mb-4 h-12 w-12 mx-auto text-primary/60" />
                <h3 className="mb-2 text-lg font-semibold text-foreground/90">No hay prendas disponibles</h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  Sube tus prendas para combinarlas en tus próximos looks.
                </p>
                <Button variant="outline" className="rounded-full border-primary/20 bg-white/80 text-primary hover:bg-primary/10">
                  <Upload className="mr-2 h-4 w-4" />
                  Ir a Prendas
                </Button>
              </div>
            )}
            
            {selectedGarments.length > 0 && (
              <Alert className="border-primary/20 bg-primary/5 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-muted-foreground">
                  {selectedGarments.length} prenda{selectedGarments.length !== 1 ? 's' : ''} seleccionada{selectedGarments.length !== 1 ? 's' : ''}. Añade varias piezas para crear outfits más completos.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )
        
      case 'style':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-white/70 px-5 py-4 shadow-inner">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground/90">Configuración avanzada de estilo</label>
                <p className="text-xs text-muted-foreground">
                  Personaliza el estilo, temporada y los matices del outfit.
                </p>
              </div>
              <Switch
                checked={useAdvancedStyle}
                onCheckedChange={setUseAdvancedStyle}
              />
            </div>
            
            {useAdvancedStyle && (
              <div className="grid gap-6 rounded-2xl border border-primary/20 bg-white/70 p-6 shadow-inner">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Estilo de outfit</label>
                  <Select value={stylePreferences.style} onValueChange={(value) =>
                    setStylePreferences(prev => ({...prev, style: value}))}>
                    <SelectTrigger className="rounded-xl border-primary/20 bg-white/80 text-sm">
                      <SelectValue placeholder="Selecciona un estilo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-primary/20 bg-white/95 shadow-lg">
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="business">Empresarial</SelectItem>
                      <SelectItem value="street">Urbano</SelectItem>
                      <SelectItem value="bohemian">Bohemio</SelectItem>
                      <SelectItem value="minimalist">Minimalista</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="sporty">Deportivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Temporada</label>
                  <Select value={stylePreferences.season} onValueChange={(value) =>
                    setStylePreferences(prev => ({...prev, season: value}))}>
                    <SelectTrigger className="rounded-xl border-primary/20 bg-white/80 text-sm">
                      <SelectValue placeholder="Selecciona temporada" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-primary/20 bg-white/95 shadow-lg">
                      <SelectItem value="any">Cualquier temporada</SelectItem>
                      <SelectItem value="spring">Primavera</SelectItem>
                      <SelectItem value="summer">Verano</SelectItem>
                      <SelectItem value="autumn">Otoño</SelectItem>
                      <SelectItem value="winter">Invierno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Opciones adicionales del outfit - siempre visibles */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Shirt className="h-4 w-4 text-primary" />
                </div>
                Opciones de generación
              </h4>
              
              <div className="grid gap-4 rounded-2xl border border-primary/20 bg-white/70 p-5 shadow-inner">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white/80 px-4 py-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground/90">Cuerpo completo</label>
                      <p className="text-xs text-muted-foreground">Mostrar figura completa del modelo</p>
                    </div>
                    <Switch
                      checked={outfitOptions.fullBodyVisible}
                      onCheckedChange={(checked) => 
                        setOutfitOptions(prev => ({...prev, fullBodyVisible: checked}))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white/80 px-4 py-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground/90">Mostrar zapatos</label>
                      <p className="text-xs text-muted-foreground">Incluir calzado en la imagen</p>
                    </div>
                    <Switch
                      checked={outfitOptions.showShoes}
                      onCheckedChange={(checked) => 
                        setOutfitOptions(prev => ({...prev, showShoes: checked}))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white/80 px-4 py-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground/90">Ocultar gorros</label>
                      <p className="text-xs text-muted-foreground">Evitar sombreros y gorras</p>
                    </div>
                    <Switch
                      checked={outfitOptions.hideHatsAndCaps}
                      onCheckedChange={(checked) => 
                        setOutfitOptions(prev => ({...prev, hideHatsAndCaps: checked}))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white/80 px-4 py-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground/90">Adaptar zapatos</label>
                      <p className="text-xs text-muted-foreground">Coordinar calzado con el look</p>
                    </div>
                    <Switch
                      checked={outfitOptions.adaptShoesToLook}
                      onCheckedChange={(checked) => 
                        setOutfitOptions(prev => ({...prev, adaptShoesToLook: checked}))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white/80 px-4 py-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground/90">Quitar gafas de sol</label>
                      <p className="text-xs text-muted-foreground">Eliminar gafas de sol del modelo</p>
                    </div>
                    <Switch
                      checked={outfitOptions.removeSunglasses}
                      onCheckedChange={(checked) => 
                        setOutfitOptions(prev => ({...prev, removeSunglasses: checked}))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white/80 px-4 py-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground/90">Solo prendas seleccionadas</label>
                      <p className="text-xs text-muted-foreground">Quitar toda la ropa original del modelo</p>
                    </div>
                    <Switch
                      checked={outfitOptions.onlySelectedGarments}
                      onCheckedChange={(checked) => 
                        setOutfitOptions(prev => ({...prev, onlySelectedGarments: checked}))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2 rounded-xl border border-primary/15 bg-white/80 px-4 py-3">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium text-foreground/90">Estilo fotográfico</label>
                      <p className="text-xs text-muted-foreground">Fondo e iluminación de la imagen</p>
                    </div>
                    <Select
                      value={outfitOptions.photoStyle}
                      onValueChange={(value: 'original' | 'studio' | 'outdoor' | 'casual' | 'professional') => 
                        setOutfitOptions(prev => ({...prev, photoStyle: value}))
                      }
                    >
                      <SelectTrigger className="w-full bg-white/90">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original (mantener fondo)</SelectItem>
                        <SelectItem value="studio">Estudio profesional</SelectItem>
                        <SelectItem value="outdoor">Exterior/aire libre</SelectItem>
                        <SelectItem value="casual">Ambiente casual/interior</SelectItem>
                        <SelectItem value="professional">Entorno profesional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="border-none bg-gradient-to-br from-primary/10 via-white to-accent/20 shadow-sm">
              <CardContent className="flex flex-col gap-4 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white/80 p-2.5 shadow-inner">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground/90">Resumen de tu outfit</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Modelo: {selectedModelType === 'existing' ? 'Existente seleccionado' : 'Generado por IA'}</p>
                      <p>• Prendas: {selectedGarments.length} seleccionada{selectedGarments.length !== 1 ? 's' : ''}</p>
                      {useAdvancedStyle && <p>• Estilo: {stylePreferences.style}</p>}
                      {useAdvancedStyle && <p>• Temporada: {stylePreferences.season}</p>}
                      <p>• Imágenes: {variants === 1 ? '1 imagen original' : `${variants} variantes`}</p>
                      <p>• Vista: {outfitOptions.fullBodyVisible ? 'Cuerpo completo' : 'Vista parcial'}</p>
                      <p>• Calzado: {outfitOptions.showShoes ? 'Incluido' : 'Oculto'}{outfitOptions.adaptShoesToLook ? ' y adaptado' : ''}</p>
                      <p>• Accesorios: {outfitOptions.hideHatsAndCaps ? 'Sin gorros/gorras' : 'Todos permitidos'}</p>
                      <p>• Gafas de sol: {outfitOptions.removeSunglasses ? 'Eliminadas' : 'Solo si las lleva el modelo'}</p>
                      <p>• Reemplazo de ropa: {outfitOptions.onlySelectedGarments ? 'Solo prendas seleccionadas' : 'Coordinación inteligente'}</p>
                      <p>• Estilo fotográfico: {
                        outfitOptions.photoStyle === 'original' ? 'Original (mantener fondo)' :
                        outfitOptions.photoStyle === 'studio' ? 'Estudio profesional' :
                        outfitOptions.photoStyle === 'outdoor' ? 'Exterior/aire libre' :
                        outfitOptions.photoStyle === 'casual' ? 'Ambiente casual/interior' :
                        outfitOptions.photoStyle === 'professional' ? 'Entorno profesional' : 'Original'
                      }</p>
                      {variants > 1 && variantConfigs.length > 0 && (
                        <div className="ml-4 space-y-0.5 text-xs">
                          {variantConfigs.map(config => (
                            <p key={config.id}>
                              - Imagen {config.id}: {VARIANT_OPTIONS[config.type].label}
                            </p>
                          ))}
                        </div>
                      )}
                      {!useAdvancedStyle && <p>• Configuración: Básica (automática)</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'generate':
        return (
          <div className="space-y-8 rounded-3xl border border-primary/10 bg-white/70 p-10 text-center shadow-inner">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5">
              <Wand2 className={`h-12 w-12 text-primary ${loading ? 'animate-pulse' : ''}`} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-foreground/90">
                {loading ? 'Generando tu outfit...' : 'Todo listo para generar'}
              </h3>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                {loading
                  ? 'La inteligencia artificial está creando combinaciones pulidas para tu outfit.'
                  : 'Haz clic en generar para obtener un conjunto a medida con detalles cuidados.'}
              </p>
            </div>

            {loading && (
              <div className="mx-auto flex max-w-md flex-col gap-2 text-left">
                <Progress value={generationProgress} className="h-2 rounded-full bg-primary/10" />
                <p className="text-xs font-medium text-muted-foreground">
                  {Math.round(generationProgress)}% completado
                </p>
              </div>
            )}

            {error && (
              <Alert className="mx-auto max-w-md border-destructive/30 bg-destructive/5 text-left text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )
        
      case 'results':
        return (
          <div className="space-y-6">
            {outputs.length > 0 ? (
              <>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-semibold text-foreground/90">¡Outfits generados con éxito!</h3>
                  <p className="text-sm text-muted-foreground">
                    Aquí tienes {outputs.length} variante{outputs.length !== 1 ? 's' : ''} perfectamente curada{outputs.length !== 1 ? 's' : ''} para tu look.
                  </p>
                </div>

                {downloadError && (
                  <Alert variant="destructive" className="mx-auto max-w-2xl text-left text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{downloadError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {outputs.map((url, index) => (
                    <Card
                      key={url}
                      onClick={() =>
                        handleOpenPreview(url, {
                          index,
                          title: `Variante ${index + 1}`,
                          subtitle: `Estilo ${stylePreferences.style}`,
                          context: 'outfit'
                        })
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleOpenPreview(url, {
                            index,
                            title: `Variante ${index + 1}`,
                            subtitle: `Estilo ${stylePreferences.style}`,
                            context: 'outfit'
                          })
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="group overflow-hidden rounded-3xl border border-transparent bg-white/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-zoom-in"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img 
                          src={url} 
                          alt={`Outfit ${index + 1}`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute right-3 top-3">
                          <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="space-y-1">
                          <h4 className="text-base font-medium text-foreground/90">Variante {index + 1}</h4>
                          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground/70">
                            Estilo {stylePreferences.style}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation()
                          }}
                          className="rounded-full border-primary/20 bg-white/80 text-primary transition hover:bg-primary/10"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    variant="outline"
                    onClick={resetWizard}
                    className="rounded-full border-primary/20 bg-white/80 px-6 text-primary hover:bg-primary/10"
                  >
                    Crear Nuevo Outfit
                  </Button>
                  <Button
                    onClick={handleDownloadAll}
                    disabled={downloadingAll}
                    className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {downloadingAll ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-[2px] border-primary-foreground border-t-transparent" />
                        Preparando descarga...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Descargar Todo
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-primary/20 bg-white/70 p-12 text-center shadow-inner">
                <AlertTriangle className="mb-4 h-12 w-12 mx-auto text-destructive" />
                <h3 className="mb-2 text-lg font-semibold text-foreground/90">No se pudieron generar outfits</h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  Hubo un problema durante la generación. Revisa las selecciones y vuelve a intentarlo.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('style')}
                  className="rounded-full border-primary/20 bg-white/80 text-primary hover:bg-primary/10"
                >
                  Intentar de nuevo
                </Button>
              </div>
            )}
          </div>
        )
    }
  }

  const showVariantSettings = currentStep === 'style' || currentStep === 'generate' || currentStep === 'results'

  return (
    <TooltipProvider>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_-32px_rgba(30,64,175,0.55)] backdrop-blur-2xl sm:p-10">
          <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-inner">
                  <Wand2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">Crear Outfit</h1>
                  <p className="text-sm text-muted-foreground">
                    Asistente guiado con IA para construir looks modernos y minimalistas
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetWizard}
                className="rounded-full border-primary/20 bg-white/80 px-5 text-primary shadow-sm transition hover:border-primary/30 hover:bg-primary/10"
              >
                Reiniciar
              </Button>
            </div>

            {/* Progress Stepper */}
            <Card className="border-none bg-white/80 shadow-none backdrop-blur">
              <CardContent className="flex flex-col gap-6 px-4 py-6 sm:px-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  {steps.map((step, index) => {
                    const isActive = step.step === currentStep
                    const isCompleted = completedSteps.includes(step.step)
                    const IconComponent = step.icon

                    return (
                      <div key={step.step} className="flex flex-1 flex-col items-center gap-4 text-center md:min-w-[160px] md:flex-row md:items-center md:gap-5 md:text-left">
                        <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-medium transition-all duration-300 ${
                              isActive
                                ? 'border-primary/20 bg-primary text-white shadow-lg'
                                : isCompleted
                                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700 shadow-inner'
                                  : 'border-border/70 bg-white text-muted-foreground shadow-inner'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <IconComponent className="h-5 w-5" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p
                              className={`text-sm font-medium ${
                                isActive
                                  ? 'text-primary'
                                  : isCompleted
                                    ? 'text-emerald-600'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="hidden flex-1 md:block">
                            <div className="h-px w-full rounded-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card className="order-1 border-none bg-white/90 shadow-xl  backdrop-blur">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground/90">
                    {React.createElement(steps.find(s => s.step === currentStep)?.icon || Wand2, { className: 'h-5 w-5 text-primary' })}
                    {steps.find(s => s.step === currentStep)?.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground/80">
                    {steps.find(s => s.step === currentStep)?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div key={currentStep} className="wizard-animate space-y-6">
                    {renderStepContent()}
                  </div>
                </CardContent>
              </Card>

              {showVariantSettings && (
                <Card className="order-2 border-none bg-gradient-to-br from-primary/10 via-white to-blue-50/70 shadow-md  backdrop-blur-sm">
                  <CardContent className="flex flex-col gap-5 px-5 py-6">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white/80 p-3 shadow-inner">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-primary/90">Configuración de Variantes</h3>
                        <p className="text-xs text-muted-foreground">
                          Controla cuántas imágenes generará la IA y cómo variará cada una.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-primary/20 bg-white/80 p-4 shadow-inner">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateVariantCount(Math.max(1, variants - 1))}
                            disabled={variants <= 1}
                            className="h-9 w-9 rounded-full border-primary/20 text-primary hover:bg-primary/10"
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium text-foreground/90">
                            {variants} imagen{variants !== 1 ? 'es' : ''}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateVariantCount(Math.min(4, variants + 1))}
                            disabled={variants >= 4}
                            className="h-9 w-9 rounded-full border-primary/20 text-primary hover:bg-primary/10"
                          >
                            +
                          </Button>
                        </div>
                        <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {variants === 1 ? 'Básico' : `${variants} variantes`}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {variants === 1
                          ? 'Una sola imagen cuidando la composición original.'
                          : `${variants} imágenes con variaciones delicadas y controladas.`}
                      </p>
                    </div>

                    {variants > 1 && (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-primary/20 bg-white/70 p-3 text-xs font-medium text-muted-foreground">
                          Imagen 1: <span className="text-foreground/80">Original (frontal, iluminación neutral)</span>
                        </div>
                        {variantConfigs.map((config) => (
                          <div key={config.id} className="grid gap-3 rounded-2xl border border-primary/20 bg-white/90 p-3 shadow-sm">
                            <div className="flex items-center justify-between text-sm font-medium text-foreground/80">
                              <span>Imagen {config.id}</span>
                              <Badge className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                {VARIANT_OPTIONS[config.type].icon}
                              </Badge>
                            </div>
                            <Select
                              value={config.type}
                              onValueChange={(value: VariantType) => updateVariantConfig(config.id, value)}
                            >
                              <SelectTrigger className="rounded-xl border-primary/20 bg-white/70 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border border-primary/20 bg-white/95 shadow-lg">
                                {Object.entries(VARIANT_OPTIONS).map(([key, option]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <span>{option.icon}</span>
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
                                <Info className="h-4 w-4" />
                                Detalles de la variación
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs rounded-xl border border-primary/10 bg-white/95 text-xs text-muted-foreground">
                                {VARIANT_OPTIONS[config.type].description}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-primary/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 'model' || loading}
                className="flex items-center gap-2 rounded-full border-primary/20 bg-white/80 px-5 text-primary shadow-sm transition hover:border-primary/30 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex flex-wrap justify-end gap-2">
                {currentStep === 'style' ? (
                  <Button
                    onClick={generateOutfit}
                    disabled={!canProceed() || loading}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl"
                    size="lg"
                  >
                    <Wand2 className="h-4 w-4" />
                    Generar Outfit
                  </Button>
                ) : currentStep === 'generate' ? (
                  <Button
                    onClick={generateOutfit}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-[2px] border-current border-t-transparent" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Comenzar Generación
                      </>
                    )}
                  </Button>
                ) : currentStep !== 'results' ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed() || loading}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isPreviewOpen} onOpenChange={handlePreviewChange}>
        <DialogContent className="max-w-4xl overflow-hidden border-none bg-white/90 p-0 shadow-2xl">
          {previewUrl && (
            <div className="flex flex-col">
              <DialogHeader className="space-y-1 px-6 pt-6">
                <DialogTitle className="text-xl font-semibold text-foreground/90">
                  {previewTitle}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {previewSubtitle || 'Observa la propuesta en grande y guárdala cuando quieras.'}
                </p>
              </DialogHeader>
              <div className="flex max-h-[70vh] items-center justify-center bg-gradient-to-br from-primary/5 via-white to-white px-4 py-6">
                <img
                  src={previewUrl}
                  alt={previewTitle}
                  className="max-h-[64vh] w-full rounded-2xl border border-white/70 object-contain shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-3 border-t border-primary/10 bg-white/95 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {previewContext === 'outfit'
                    ? `Estilo ${stylePreferences.style}`
                    : previewContext === 'garment'
                      ? 'Detalle de la prenda seleccionada'
                      : 'Vista general'}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={handleOpenImageInNewTab}
                    className="rounded-full border-primary/20 bg-white/80 text-primary hover:bg-primary/10"
                  >
                    Abrir en pestaña nueva
                  </Button>
                  {previewContext === 'outfit' && (
                    <Button
                      onClick={handleDownloadSingle}
                      disabled={downloadingSingle}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {downloadingSingle ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-[2px] border-primary-foreground border-t-transparent" />
                          Descargando...
                        </>
                      ) : (
                        'Descargar imagen'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
