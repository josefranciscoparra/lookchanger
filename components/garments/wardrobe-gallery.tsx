'use client'
import { useState } from 'react'
import { useAppStore, type GarmentCategory } from '@/lib/store'
import { Shirt, X, Tag, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface WardrobeGalleryProps {
  onAddClick: () => void
}

const categoryInfo = {
  tops: { name: 'Tops', icon: '👕', color: 'bg-ink-100 text-ink-700', description: 'Camisetas, camisas, blusas' },
  bottoms: { name: 'Pantalones', icon: '👖', color: 'bg-slate-100 text-slate-700', description: 'Pantalones, faldas, shorts' },
  vestidos: { name: 'Vestidos', icon: '👗', color: 'bg-gray-100 text-gray-700', description: 'Vestidos y monos' },
  calzado: { name: 'Calzado', icon: '👞', color: 'bg-zinc-100 text-zinc-700', description: 'Zapatos, botas, sandalias' },
  abrigos: { name: 'Abrigos', icon: '🧥', color: 'bg-stone-100 text-stone-700', description: 'Chaquetas, abrigos, blazers' },
  accesorios: { name: 'Accesorios', icon: '👜', color: 'bg-neutral-100 text-neutral-700', description: 'Bolsos, cinturones, joyas' },
}

export function WardrobeGallery({ onAddClick }: WardrobeGalleryProps) {
  const { garments, removeGarment, getGarmentsByCategory } = useAppStore()
  
  const garmentsByCategory = getGarmentsByCategory()
  const garmentCategories = Object.entries(categoryInfo).map(([key, info]) => ({
    key: key as GarmentCategory,
    name: info.name,
    icon: info.icon,
    count: garmentsByCategory[key as GarmentCategory]?.length || 0,
    color: info.color,
    description: info.description
  }))

  const removeImage = (index: number) => {
    removeGarment(index)
  }

  if (garments.length === 0) {
    return (
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
            <Button variant="default" size="lg" onClick={onAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Primera Prenda
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Tu Armario Virtual
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Más
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
                  <Button variant="outline" size="sm" onClick={onAddClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir {category.name}
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}