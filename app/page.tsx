import Link from 'next/link'
import { ArrowRight, Sparkles, User, Shirt, Wand2, Zap, Star, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Page() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <Badge className="mx-auto" variant="secondary">
            <Zap className="h-3 w-3 mr-1" />
            Potenciado por IA
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            LookChanger
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transforma tu estilo con inteligencia artificial. Pruébate ropa virtualmente 
            y descubre looks únicos en segundos.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/outfits">
              <Sparkles className="mr-2 h-5 w-5" />
              Empezar Ahora
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="/models">
              Explorar Modelos
            </Link>
          </Button>
        </div>
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