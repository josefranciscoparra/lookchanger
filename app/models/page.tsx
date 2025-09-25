'use client'
import { useState } from 'react'
import { Upload, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function ModelsPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploaded, setUploaded] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const onUpload = async () => {
    if (!files.length) {
      setError('Selecciona al menos un archivo')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const body = new FormData()
      files.forEach(f => body.append('files', f))
      const res = await fetch('/api/upload?type=model', { method: 'POST', body })
      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || 'Error al subir archivos')
      }
      
      setUploaded(prev => [...prev, ...(json.urls || [])])
      setFiles([])
      setSuccess(`${json.urls?.length || 0} archivo(s) subido(s) correctamente`)
      
      // Limpiar el input
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      if (input) input.value = ''
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (index: number) => {
    setUploaded(prev => prev.filter((_, i) => i !== index))
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Modelos</h1>
          <p className="text-muted-foreground">Sube fotos de modelos para generar looks virtuales</p>
        </div>
      </div>

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
          <AlertDescription className="flex items-center justify-between">
            <span>✓ {success}</span>
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Modelos</CardTitle>
          <CardDescription>
            Selecciona una o más imágenes de modelos. Formatos soportados: JPG, PNG, WebP (máximo 10MB cada una)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file" 
            multiple 
            accept="image/*" 
            onChange={e => setFiles(Array.from(e.target.files || []))}
            className="cursor-pointer"
          />
          
          {files.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Archivos seleccionados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate">{file.name}</span>
                    <Badge variant="secondary">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          <Button 
            onClick={onUpload}
            disabled={loading || !files.length}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {loading ? 'Subiendo...' : 'Subir Imágenes'}
          </Button>
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {uploaded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Modelos Subidos
              <Badge variant="outline">{uploaded.length}</Badge>
            </CardTitle>
            <CardDescription>
              Haz clic en el ícono X para eliminar una imagen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploaded.map((url, index) => (
                <div key={url} className="relative group">
                  <img 
                    src={url} 
                    alt={`Modelo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border" 
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar imagen"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}