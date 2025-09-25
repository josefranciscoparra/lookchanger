import Link from 'next/link'
import { ArrowRight, Sparkles, User, Shirt, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Page() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold">AI Look Try-On</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Genera looks fotorrealistas combinando modelos y prendas usando inteligencia artificial avanzada
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>1. Sube Modelos</CardTitle>
            <CardDescription>
              Agrega fotos de modelos con diferentes poses y expresiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/models">
                Subir Modelos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shirt className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>2. Sube Prendas</CardTitle>
            <CardDescription>
              Agrega ropa, zapatos y complementos con fondo neutro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/garments">
                Subir Prendas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Wand2 className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>3. Genera Outfits</CardTitle>
            <CardDescription>
              Crea looks únicos combinando modelos y prendas con IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/outfits">
                Generar Outfits <Sparkles className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>💡 Consejos para mejores resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Para modelos:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Usa diferentes poses y expresiones</li>
                <li>• Buena iluminación y resolución</li>
                <li>• Fondo simple y neutro</li>
                <li>• Modelo claramente visible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Para prendas:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Fondo blanco o neutro</li>
                <li>• Prenda bien extendida</li>
                <li>• Sin sombras pronunciadas</li>
                <li>• Resolución entre 1024-2048px</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}