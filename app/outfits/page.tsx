
'use client'
import { useEffect, useState } from 'react'
import { Wand2, Sparkles, Image, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function OutfitsPage() {
  const [models, setModels] = useState<string[]>([])
  const [garments, setGarments] = useState<string[]>([])
  const [outputs, setOutputs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [variants, setVariants] = useState(2)

  useEffect(() => {
    fetch('/api/list?type=model').then(r => r.json()).then(d => setModels(d.urls || []))
    fetch('/api/list?type=garment').then(r => r.json()).then(d => setGarments(d.urls || []))
  }, [])

  const run = async () => {
    setLoading(true)
    setError('')
    setOutputs([])
    
    try {
      const res = await fetch('/api/outfits/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelUrls: models.slice(0, 1),     // usa el primer modelo
          garmentUrls: garments.slice(0, 3), // usa las primeras 3 prendas
          variants
        })
      })
      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || 'Error al generar el outfit')
      }
      
      setOutputs(json.outputs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = models.length > 0 && garments.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Generador de Outfits</h1>
          <p className="text-muted-foreground">Combina modelos y prendas para crear looks únicos con IA</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 bg-blue-100 rounded-full">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Modelos disponibles</p>
              <p className="text-2xl font-bold">{models.length}</p>
              {models.length === 0 && (
                <p className="text-sm text-muted-foreground">Sube modelos en la página "Modelos"</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 bg-green-100 rounded-full">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Prendas disponibles</p>
              <p className="text-2xl font-bold">{garments.length}</p>
              {garments.length === 0 && (
                <p className="text-sm text-muted-foreground">Sube prendas en la página "Prendas"</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generar Outfit
          </CardTitle>
          <CardDescription>
            Usaremos el primer modelo y las primeras 3 prendas para generar {variants} variaciones del outfit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canGenerate && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Necesitas subir al menos 1 modelo y 1 prenda para generar outfits
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="variants" className="text-sm font-medium">Variantes:</label>
              <select 
                id="variants"
                value={variants} 
                onChange={e => setVariants(Number(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={run} 
            disabled={loading || !canGenerate}
            className="w-full"
            size="lg"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {loading ? 'Generando outfit...' : 'Generar Outfit con IA'}
          </Button>
          
          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              <p>🤖 La IA está trabajando en tu outfit...</p>
              <p>Esto puede tardar unos segundos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {outputs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resultados Generados
              <Badge variant="outline">{outputs.length} outfit(s)</Badge>
            </CardTitle>
            <CardDescription>
              ¡Tu outfit ha sido generado! Puedes descargar las imágenes haciendo clic derecho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outputs.map((url, index) => (
                <div key={url} className="space-y-2">
                  <img 
                    src={url} 
                    alt={`Outfit generado ${index + 1}`}
                    className="w-full h-80 object-cover rounded-lg border shadow-sm" 
                  />
                  <p className="text-sm text-center text-muted-foreground">
                    Variante {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
