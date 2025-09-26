
'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { 
  Wand2, Sparkles, Image, Info, AlertTriangle, User, Shirt, 
  ArrowRight, ArrowLeft, CheckCircle, Upload, Users, Palette,
  Settings, Zap, Star, Camera, Plus, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

type WizardStep = 'model' | 'garments' | 'style' | 'generate' | 'results'
type ModelType = 'existing' | 'generated'

interface ModelCharacteristics {
  skinTone: string
  bodyType: string
  gender: string
  age: string
}

export default function OutfitsPage() {
  // Usar Zustand store para modelos y prendas
  const { models, garments, initialize } = useAppStore()
  
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
  const [variants, setVariants] = useState(2)
  const [stylePreferences, setStylePreferences] = useState({
    style: 'casual',
    season: 'any'
  })
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [generationProgress, setGenerationProgress] = useState(0)

  useEffect(() => {
    initialize()
  }, [initialize])

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
    setOutputs([])
    setGenerationProgress(0)
    setCurrentStep('generate')
    
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
          style: stylePreferences,
          modelCharacteristics: selectedModelType === 'generated' ? modelCharacteristics : undefined
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
    setOutputs([])
    setError('')
    setGenerationProgress(0)
  }, [])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'model':
        return (
          <div className="space-y-6">
            <Tabs value={selectedModelType} onValueChange={(value) => setSelectedModelType(value as ModelType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usar Modelo Existente
                </TabsTrigger>
                <TabsTrigger value="generated" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Generar Modelo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-4">
                {models.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {models.map((model, index) => (
                      <div
                        key={model.url}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedModel === model.url
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent hover:border-muted-foreground/20'
                        }`}
                        onClick={() => setSelectedModel(model.url)}
                      >
                        <img
                          src={model.url}
                          alt={`Modelo ${index + 1}`}
                          className="w-full aspect-[3/4] object-cover"
                        />
                        {selectedModel === model.url && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-6 w-6 text-primary bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay modelos disponibles</h3>
                    <p className="text-muted-foreground mb-4">
                      Necesitas subir modelos primero para usar esta opción
                    </p>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Ir a Modelos
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="generated" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tono de piel</label>
                    <Select value={modelCharacteristics.skinTone} onValueChange={(value) => 
                      setModelCharacteristics(prev => ({...prev, skinTone: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tono de piel" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <div>
                      <label className="text-sm font-medium mb-2 block">Género</label>
                      <Select value={modelCharacteristics.gender} onValueChange={(value) => 
                        setModelCharacteristics(prev => ({...prev, gender: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Femenino</SelectItem>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="non-binary">No binario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Edad aproximada</label>
                      <Select value={modelCharacteristics.age} onValueChange={(value) => 
                        setModelCharacteristics(prev => ({...prev, age: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Edad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="young-adult">Joven adulto (20-30)</SelectItem>
                          <SelectItem value="adult">Adulto (30-45)</SelectItem>
                          <SelectItem value="middle-aged">Mediana edad (45-60)</SelectItem>
                          <SelectItem value="senior">Mayor (60+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de cuerpo</label>
                    <Select value={modelCharacteristics.bodyType} onValueChange={(value) => 
                      setModelCharacteristics(prev => ({...prev, bodyType: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de cuerpo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slim">Delgado</SelectItem>
                        <SelectItem value="athletic">Atlético</SelectItem>
                        <SelectItem value="average">Promedio</SelectItem>
                        <SelectItem value="curvy">Curvilíneo</SelectItem>
                        <SelectItem value="plus-size">Talla grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Alert className="border-amber-200 bg-amber-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-amber-800">
                    <strong>Próximamente:</strong> La generación de modelos personalizados estará disponible en una próxima actualización.
                    Por ahora, puedes usar los modelos existentes.
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {garments.map((garment, index) => (
                  <div
                    key={garment.url}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedGarments.includes(garment.url)
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-muted-foreground/20'
                    }`}
                    onClick={() => {
                      setSelectedGarments(prev => 
                        prev.includes(garment.url)
                          ? prev.filter(g => g !== garment.url)
                          : [...prev, garment.url]
                      )
                    }}
                  >
                    <img
                      src={garment.url}
                      alt={`Prenda ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    {selectedGarments.includes(garment.url) && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-6 w-6 text-primary bg-white rounded-full" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs">#{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shirt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay prendas disponibles</h3>
                <p className="text-muted-foreground mb-4">
                  Necesitas subir prendas primero para crear outfits
                </p>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Ir a Prendas
                </Button>
              </div>
            )}
            
            {selectedGarments.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {selectedGarments.length} prenda{selectedGarments.length !== 1 ? 's' : ''} seleccionada{selectedGarments.length !== 1 ? 's' : ''}. 
                  Puedes elegir múltiples prendas para crear outfits más completos.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )
        
      case 'style':
        return (
          <div className="space-y-6">
            <div className="grid gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Estilo de outfit</label>
                <Select value={stylePreferences.style} onValueChange={(value) => 
                  setStylePreferences(prev => ({...prev, style: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estilo" />
                  </SelectTrigger>
                  <SelectContent>
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
              
              <div>
                <label className="text-sm font-medium mb-2 block">Temporada</label>
                <Select value={stylePreferences.season} onValueChange={(value) => 
                  setStylePreferences(prev => ({...prev, season: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona temporada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Cualquier temporada</SelectItem>
                    <SelectItem value="spring">Primavera</SelectItem>
                    <SelectItem value="summer">Verano</SelectItem>
                    <SelectItem value="autumn">Otoño</SelectItem>
                    <SelectItem value="winter">Invierno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Número de variantes: {variants}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={variants}
                    onChange={(e) => setVariants(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline">{variants} variante{variants !== 1 ? 's' : ''}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Más variantes = más opciones pero mayor tiempo de procesamiento
                </p>
              </div>
            </div>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Palette className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">Resumen de tu outfit</h4>
                    <div className="text-sm text-purple-800 space-y-1">
                      <p>• Modelo: {selectedModelType === 'existing' ? 'Existente seleccionado' : 'Generado por IA'}</p>
                      <p>• Prendas: {selectedGarments.length} seleccionada{selectedGarments.length !== 1 ? 's' : ''}</p>
                      <p>• Estilo: {stylePreferences.style}</p>
                      <p>• Variantes: {variants}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'generate':
        return (
          <div className="space-y-6 text-center py-12">
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                <Wand2 className={`h-12 w-12 text-primary ${loading ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {loading ? 'Generando tu outfit...' : 'Todo listo para generar'}
                </h3>
                <p className="text-muted-foreground">
                  {loading 
                    ? 'La IA está trabajando en crear tu outfit perfecto'
                    : 'Haz clic en generar para crear tu outfit con inteligencia artificial'}
                </p>
              </div>
              
              {loading && (
                <div className="space-y-2 max-w-md mx-auto">
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(generationProgress)}% completado
                  </p>
                </div>
              )}
              
              {error && (
                <Alert variant="destructive" className="max-w-md mx-auto text-left">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )
        
      case 'results':
        return (
          <div className="space-y-6">
            {outputs.length > 0 ? (
              <>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">¡Outfits generados con éxito!</h3>
                  <p className="text-muted-foreground">
                    Aquí tienes {outputs.length} variante{outputs.length !== 1 ? 's' : ''} de tu outfit
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {outputs.map((url, index) => (
                    <Card key={url} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[3/4] relative">
                        <img 
                          src={url} 
                          alt={`Outfit ${index + 1}`}
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/50 text-white">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Variante {index + 1}</h4>
                            <p className="text-sm text-muted-foreground">
                              Estilo {stylePreferences.style}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetWizard}>
                    Crear Nuevo Outfit
                  </Button>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Descargar Todo
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se pudieron generar outfits</h3>
                <p className="text-muted-foreground mb-4">
                  Hubo un problema durante la generación
                </p>
                <Button variant="outline" onClick={() => setCurrentStep('style')}>
                  Intentar de nuevo
                </Button>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Wand2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Crear Outfit</h1>
              <p className="text-muted-foreground">Asistente paso a paso para generar looks únicos con IA</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetWizard}>
            Reiniciar
          </Button>
        </div>

        {/* Progress Stepper */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.step === currentStep
                const isCompleted = completedSteps.includes(step.step)
                const IconComponent = step.icon
                
                return (
                  <div key={step.step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`p-3 rounded-full border-2 transition-all ${
                        isActive 
                          ? 'border-primary bg-primary text-white' 
                          : isCompleted 
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <IconComponent className="h-5 w-5" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-medium ${
                          isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 h-px bg-muted-foreground/30 mx-4" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps.find(s => s.step === currentStep)?.icon || Wand2, { className: "h-5 w-5" })}
              {steps.find(s => s.step === currentStep)?.title}
            </CardTitle>
            <CardDescription>
              {steps.find(s => s.step === currentStep)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 'model' || loading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {currentStep === 'style' ? (
              <Button 
                onClick={generateOutfit}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2"
                size="lg"
              >
                <Wand2 className="h-4 w-4" />
                Generar Outfit
              </Button>
            ) : currentStep === 'generate' ? (
              <Button 
                onClick={generateOutfit}
                disabled={loading}
                className="flex items-center gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
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
                className="flex items-center gap-2"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
