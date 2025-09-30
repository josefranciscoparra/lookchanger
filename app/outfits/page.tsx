'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Stepper } from '@/components/ui/Stepper'
import { Segmented } from '@/components/ui/Segmented'
import { Button } from '@/components/ui/button'
import { ModelCard } from '@/components/ModelCard'
import { GarmentCard } from '@/components/GarmentCard'
import { EmptyState } from '@/components/EmptyState'
import { StickyActions } from '@/components/ui/StickyActions'
import { ImagePreview } from '@/components/ui/ImagePreview'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingAnimation } from '@/components/ui/loading-animation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CostEstimator } from '@/components/CostEstimator'
import { InsufficientCreditsModal } from '@/components/InsufficientCreditsModal'
import { Palette, Wand2, AlertTriangle, Star, Upload, Shirt } from 'lucide-react'

const STEPS = ['Seleccionar Modelo','Elegir Prendas','Configurar Estilo','Generar Outfit','Ver Resultados']

export default function CrearOutfitPage() {
  const { models, garments, initialize, isLoading, isInitialized, credits, refreshCredits } = useAppStore()
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'existente'|'generar'>('existente')
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedGarments, setSelectedGarments] = useState<string[]>([])

  // Preview states
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewSubtitle, setPreviewSubtitle] = useState('')
  const [previewShowDownload, setPreviewShowDownload] = useState(false)

  // Style configuration states
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
    removeSunglasses: true,
    onlySelectedGarments: true,
    photoStyle: 'studio' as 'original' | 'studio' | 'outdoor' | 'casual' | 'professional'
  })

  // Generation states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [outputs, setOutputs] = useState<string[]>([])

  // Credits modal state
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false)
  const [insufficientCreditsData, setInsufficientCreditsData] = useState({
    current: 0,
    required: 0,
    needed: 0
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  // Detectar cambios en el step para debugging
  useEffect(() => {
    console.log(`📍 Step cambió a: ${step} (${STEPS[step]})`)
    if (step === 0) {
      console.log('⚠️  ¡ATENCIÓN! Volvió a step 0 (Seleccionar Modelo)', new Error().stack)
    }
  }, [step])

  // Mostrar spinner mientras carga por primera vez
  if (!isInitialized && isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 pb-28 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ink-500">Crear Outfit</h1>
          <p className="mt-1 text-text-secondary">Asistente guiado con IA para construir looks modernos y minimalistas.</p>
        </div>
        <LoadingSpinner size="lg" text="Cargando tus modelos y prendas..." />
      </main>
    )
  }

  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  function prev() { setStep(s => Math.max(s - 1, 0)) }
  
  const toggleGarmentSelection = (garmentUrl: string) => {
    setSelectedGarments(prev => 
      prev.includes(garmentUrl)
        ? prev.filter(url => url !== garmentUrl)
        : [...prev, garmentUrl]
    )
  }
  
  const openPreview = (url: string, title: string, subtitle = '', showDownload = false) => {
    setPreviewUrl(url)
    setPreviewTitle(title)
    setPreviewSubtitle(subtitle)
    setPreviewShowDownload(showDownload)
    setPreviewOpen(true)
  }
  
  const checkCreditsAndGenerate = async () => {
    console.log('💳 Verificando créditos antes de generar...')

    // Verificar que tenemos modelo y prendas
    if (!selectedModel || selectedGarments.length === 0) {
      console.error('❌ Validación fallida:', {
        hasModel: !!selectedModel,
        garmentsCount: selectedGarments.length
      })
      setError('Debes seleccionar un modelo y al menos una prenda')
      return
    }

    try {
      // **PRIMERO: Verificar créditos**
      const estimateRes = await fetch('/api/credits/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: 1 })
      })
      const estimateData = await estimateRes.json()

      if (!estimateData.has_sufficient_credits) {
        console.warn('⚠️ Créditos insuficientes detectados ANTES de generar')
        setInsufficientCreditsData({
          current: estimateData.current_credits || 0,
          required: estimateData.cost || 0,
          needed: estimateData.credits_needed || 0
        })
        setShowInsufficientCreditsModal(true)
        return // NO avanzar al paso de generación
      }

      console.log('✅ Créditos suficientes, iniciando generación')
      generateOutfit()
    } catch (err) {
      console.error('❌ Error al verificar créditos:', err)
      setError('Error al verificar créditos. Intenta de nuevo.')
    }
  }

  const generateOutfit = async () => {
    console.log('🎬 generateOutfit llamado - Estado actual:', {
      step,
      selectedModel,
      selectedGarmentsCount: selectedGarments.length,
      modelsAvailable: models.length,
      garmentsAvailable: garments.length
    })

    console.log('✅ Validación exitosa, iniciando generación')
    setLoading(true)
    setError('')
    setOutputs([])
    setGenerationProgress(0)
    setStep(3) // Go to generate step

    try {
      // Simular progreso de generación
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) return prev
          return prev + Math.random() * 15
        })
      }, 500)

      // Encontrar el modelo seleccionado para obtener su ID
      const selectedModelObj = models.find(m => m.url === selectedModel)

      console.log('Generando outfit con modelo:', {
        modelUrl: selectedModel,
        modelId: selectedModelObj?.id,
        hasPhysicalInfo: selectedModelObj?.use_physical_info,
        weight: selectedModelObj?.weight,
        height: selectedModelObj?.height,
        bodyType: selectedModelObj?.body_type
      })

      const res = await fetch('/api/outfits/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelUrls: [selectedModel],
          garmentUrls: selectedGarments,
          style: useAdvancedStyle ? stylePreferences : undefined,
          useAdvancedStyle,
          outfitOptions,
          modelId: selectedModelObj?.id || null
        })
      })
      const json = await res.json()

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (!res.ok) {
        throw new Error(json.error || 'Error al generar el outfit')
      }

      // **NUEVO: Refrescar créditos después de generar**
      await refreshCredits()

      setTimeout(() => {
        setOutputs(json.outputs || [])
        setStep(4) // Go to results step
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStep(2) // Back to style step
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pb-28 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink-500">Crear Outfit</h1>
          <p className="mt-1 text-text-secondary">Asistente guiado con IA para construir looks modernos y minimalistas.</p>
        </div>
        <Button variant="secondary" onClick={()=>{
          console.log('🔄 Botón REINICIAR clickeado explícitamente')
          setStep(0);
          setSelectedModel(null);
        }}>Reiniciar</Button>
      </div>

      {/* Stepper */}
      <div className="mb-6 sm:mb-8">
        <Stepper steps={STEPS} current={step} />
      </div>

      {/* Paso 0: Seleccionar modelo */}
      {step === 0 && (
        <section className={`space-y-6 ${mode === 'generar' ? 'lg:max-h-[400px]' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink-500 hidden sm:block">Seleccionar Modelo</h2>
            <Segmented
              value={mode}
              onChange={(v)=>setMode(v as any)}
              options={[
                { value: 'existente', label: 'Usar modelo existente', icon: <span>👤</span> },
                { value: 'generar', label: 'Generar modelo', icon: <span>📷</span> },
              ]}
            />
          </div>

          {mode === 'existente' ? (
            models.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {models.map((m, index) => (
                  <div key={m.url} className="relative">
                    <ModelCard
                      img={m.url}
                      title={`Modelo #${index + 1}`}
                      selected={selectedModel === m.url}
                      onSelect={()=>setSelectedModel(m.url)}
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-white/90 border-border hover:bg-white"
                      onClick={() => openPreview(m.url, `Modelo #${index + 1}`, 'Vista previa del modelo')}
                    >
                      <span className="text-ink-500">👁</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aún no tienes modelos"
                desc="Sube tus modelos o genera uno con IA para empezar."
                action={<Button variant="accent" onClick={()=>window.location.assign('/models')}>Subir modelo</Button>}
              />
            )
          ) : (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="font-semibold text-ink-500 mb-2">Generar modelo con IA</h3>
              <p className="text-sm text-text-secondary mb-4">Sube 3–5 fotos con fondo neutro y diferentes poses.</p>
              <Button variant="accent" disabled>Próximamente</Button>
            </div>
          )}
        </section>
      )}

      {/* Paso 1: Elegir prendas */}
      {step === 1 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-500">Elegir Prendas</h2>
            {selectedGarments.length > 0 && (
              <div className="text-sm text-text-secondary">
                {selectedGarments.length} prenda{selectedGarments.length !== 1 ? 's' : ''} seleccionada{selectedGarments.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          {garments.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {garments.map((g, index) => (
                <GarmentCard
                  key={g.url}
                  img={g.url}
                  title={`Prenda #${index + 1}`}
                  category={g.category}
                  selected={selectedGarments.includes(g.url)}
                  onSelect={() => toggleGarmentSelection(g.url)}
                  onPreview={() => openPreview(g.url, `Prenda #${index + 1}`, `Categoría: ${g.category}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aún no tienes prendas"
              desc="Sube tus prendas para combinarlas en outfits."
              action={<Button variant="accent" onClick={()=>window.location.assign('/garments')}>Subir prendas</Button>}
            />
          )}
        </section>
      )}

      {/* Paso 2: Configurar Estilo */}
      {step === 2 && (
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-ink-500">Configurar Estilo</h2>

          {/* Aviso de créditos - ARRIBA DEL TODO */}
          <CostEstimator variants={1} />

          <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-4 shadow-card">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ink-500">Configuración avanzada de estilo</label>
              <p className="text-xs text-text-secondary">
                Personaliza el estilo, temporada y los matices del outfit.
              </p>
            </div>
            <Switch
              checked={useAdvancedStyle}
              onCheckedChange={setUseAdvancedStyle}
            />
          </div>
          
          {useAdvancedStyle && (
            <div className="grid gap-6 rounded-2xl border border-border bg-white p-6 shadow-card">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Estilo de outfit</label>
                <Select value={stylePreferences.style} onValueChange={(value) =>
                  setStylePreferences(prev => ({...prev, style: value}))}>
                  <SelectTrigger className="rounded-xl border-border bg-white text-sm">
                    <SelectValue placeholder="Selecciona un estilo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-border bg-white shadow-lg">
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
                <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Temporada</label>
                <Select value={stylePreferences.season} onValueChange={(value) =>
                  setStylePreferences(prev => ({...prev, season: value}))}>
                  <SelectTrigger className="rounded-xl border-border bg-white text-sm">
                    <SelectValue placeholder="Selecciona temporada" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-border bg-white shadow-lg">
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
          
          {/* Opciones adicionales del outfit */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-ink-500 flex items-center gap-2">
              <div className="rounded-lg bg-surface p-1.5">
                <Shirt className="h-4 w-4 text-ink-500" />
              </div>
              Opciones de generación
            </h4>
            
            <div className="grid gap-4 rounded-2xl border border-border bg-white p-5 shadow-card">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-ink-500">Cuerpo completo</label>
                    <p className="text-xs text-text-secondary">Mostrar figura completa del modelo</p>
                  </div>
                  <Switch
                    checked={outfitOptions.fullBodyVisible}
                    onCheckedChange={(checked) => 
                      setOutfitOptions(prev => ({...prev, fullBodyVisible: checked}))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-ink-500">Mostrar zapatos</label>
                    <p className="text-xs text-text-secondary">Incluir calzado en la imagen</p>
                  </div>
                  <Switch
                    checked={outfitOptions.showShoes}
                    onCheckedChange={(checked) => 
                      setOutfitOptions(prev => ({...prev, showShoes: checked}))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-ink-500">Ocultar gorros</label>
                    <p className="text-xs text-text-secondary">Evitar sombreros y gorras</p>
                  </div>
                  <Switch
                    checked={outfitOptions.hideHatsAndCaps}
                    onCheckedChange={(checked) => 
                      setOutfitOptions(prev => ({...prev, hideHatsAndCaps: checked}))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-ink-500">Adaptar zapatos</label>
                    <p className="text-xs text-text-secondary">Coordinar calzado con el look</p>
                  </div>
                  <Switch
                    checked={outfitOptions.adaptShoesToLook}
                    onCheckedChange={(checked) => 
                      setOutfitOptions(prev => ({...prev, adaptShoesToLook: checked}))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-ink-500">Quitar gafas de sol</label>
                    <p className="text-xs text-text-secondary">Eliminar gafas de sol del modelo</p>
                  </div>
                  <Switch
                    checked={outfitOptions.removeSunglasses}
                    onCheckedChange={(checked) => 
                      setOutfitOptions(prev => ({...prev, removeSunglasses: checked}))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-ink-500">Solo prendas seleccionadas</label>
                    <p className="text-xs text-text-secondary">Quitar toda la ropa original del modelo</p>
                  </div>
                  <Switch
                    checked={outfitOptions.onlySelectedGarments}
                    onCheckedChange={(checked) => 
                      setOutfitOptions(prev => ({...prev, onlySelectedGarments: checked}))
                    }
                  />
                </div>
                
                <div className="space-y-2 rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-ink-500">Estilo fotográfico</label>
                    <p className="text-xs text-text-secondary">Fondo e iluminación de la imagen</p>
                  </div>
                  <Select
                    value={outfitOptions.photoStyle}
                    onValueChange={(value: 'original' | 'studio' | 'outdoor' | 'casual' | 'professional') => 
                      setOutfitOptions(prev => ({...prev, photoStyle: value}))
                    }
                  >
                    <SelectTrigger className="w-full bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border bg-white shadow-lg">
                      <SelectItem value="studio">Estudio profesional</SelectItem>
                      <SelectItem value="outdoor">Exterior/aire libre</SelectItem>
                      <SelectItem value="casual">Ambiente casual/interior</SelectItem>
                      <SelectItem value="professional">Entorno profesional</SelectItem>
                      <SelectItem value="original">Original (mantener fondo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-none bg-gradient-to-br from-surface via-white to-blush-50 shadow-card">
            <CardContent className="flex flex-col gap-4 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2.5 shadow-card">
                  <Palette className="h-5 w-5 text-ink-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-ink-500">Resumen de tu outfit</h4>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <p>• Modelo: {selectedModel ? 'Seleccionado' : 'No seleccionado'}</p>
                    <p>• Prendas: {selectedGarments.length} seleccionada{selectedGarments.length !== 1 ? 's' : ''}</p>
                    {useAdvancedStyle && <p>• Estilo: {stylePreferences.style}</p>}
                    {useAdvancedStyle && <p>• Temporada: {stylePreferences.season}</p>}
                    <p>• Vista: {outfitOptions.fullBodyVisible ? 'Cuerpo completo' : 'Vista parcial'}</p>
                    <p>• Calzado: {outfitOptions.showShoes ? 'Incluido' : 'Oculto'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Paso 3: Generar Outfit */}
      {step === 3 && (
        <section className="space-y-8">
          <h2 className="text-lg font-semibold text-ink-500">Generar Outfit</h2>

          <div className="rounded-2xl border border-border bg-gradient-to-br from-white via-pink-50/30 to-rose-50/30 p-10 text-center shadow-card">
            <LoadingAnimation />

            {error && (
              <Alert className="mx-auto mt-6 max-w-md border-destructive/30 bg-destructive/5 text-left text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </section>
      )}

      {/* Paso 4: Ver Resultados */}
      {step === 4 && (
        <section className="space-y-6 pt-8 pb-20">
          {outputs.length > 0 ? (
            <div className="flex justify-center">
              <div
                onClick={() => openPreview(outputs[0], 'Tu Outfit', `Estilo ${stylePreferences.style}`, true)}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer max-w-md w-full"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={outputs[0]}
                    alt="Outfit generado"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center shadow-card">
              <AlertTriangle className="mb-4 h-12 w-12 mx-auto text-destructive" />
              <h3 className="mb-2 text-lg font-semibold text-ink-500">No se pudieron generar outfits</h3>
              <p className="mb-5 text-sm text-text-secondary">
                Hubo un problema durante la generación. Revisa las selecciones y vuelve a intentarlo.
              </p>
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                className="rounded-full border-border bg-white text-ink-500"
              >
                Intentar de nuevo
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Sticky actions */}
      <StickyActions>
        <div className="text-sm text-text-secondary">Paso {step + 1} de {STEPS.length}</div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={prev} disabled={step===0}>Atrás</Button>
          <Button
            variant="accent"
            onClick={()=>{
              console.log('🔘 Botón principal clickeado - Estado:', {
                step,
                stepName: STEPS[step],
                selectedModel,
                selectedGarmentsCount: selectedGarments.length,
                mode
              })

              if (step===0 && !selectedModel && mode==='existente') {
                console.warn('⚠️  Bloqueado en step 0: sin modelo')
                return;
              }
              if (step===1 && selectedGarments.length === 0) {
                console.warn('⚠️  Bloqueado en step 1: sin prendas')
                return;
              }
              if (step===2) {
                console.log('▶️  Verificando créditos desde step 2')
                checkCreditsAndGenerate();
                return;
              }
              if (step===4) {
                console.log('🏁 Finalizando - redirigiendo a galería')
                // Ir a la galería de imágenes
                window.location.assign('/gallery');
                return;
              }
              console.log('⏭️  Avanzando al siguiente paso')
              next();
            }}
            disabled={
              (step===0 && mode==='existente' && !selectedModel) ||
              (step===1 && selectedGarments.length === 0) ||
              (step===3 && loading) || // Durante generación
              (step===4 && outputs.length === 0) // Si no hay resultados
            }
          >
            {step === 2 ? (
              <>
                <Wand2 className="h-4 w-4" />
                Generar Outfit
              </>
            ) : step === 4 ? (
              'Finalizar'
            ) : 'Continuar'}
          </Button>
        </div>
      </StickyActions>
      
      {/* Image Preview Modal */}
      <ImagePreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        imageUrl={previewUrl}
        title={previewTitle}
        subtitle={previewSubtitle}
        showDownload={previewShowDownload}
      />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        currentCredits={insufficientCreditsData.current}
        requiredCredits={insufficientCreditsData.required}
        creditsNeeded={insufficientCreditsData.needed}
      />
    </main>
  )
}