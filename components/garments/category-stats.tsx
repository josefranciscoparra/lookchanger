'use client'
import { useAppStore, type GarmentCategory } from '@/lib/store'
import { Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const categoryInfo = {
  tops: { name: 'Tops', icon: '👕', color: 'bg-ink-100 text-ink-700', description: 'Camisetas, camisas, blusas' },
  bottoms: { name: 'Pantalones', icon: '👖', color: 'bg-slate-100 text-slate-700', description: 'Pantalones, faldas, shorts' },
  vestidos: { name: 'Vestidos', icon: '👗', color: 'bg-gray-100 text-gray-700', description: 'Vestidos y monos' },
  calzado: { name: 'Calzado', icon: '👞', color: 'bg-zinc-100 text-zinc-700', description: 'Zapatos, botas, sandalias' },
  abrigos: { name: 'Abrigos', icon: '🧥', color: 'bg-stone-100 text-stone-700', description: 'Chaquetas, abrigos, blazers' },
  accesorios: { name: 'Accesorios', icon: '👜', color: 'bg-neutral-100 text-neutral-700', description: 'Bolsos, cinturones, joyas' },
}

export function CategoryStats() {
  const { garments, getGarmentsByCategory } = useAppStore()
  
  const garmentsByCategory = getGarmentsByCategory()
  const garmentCategories = Object.entries(categoryInfo).map(([key, info]) => ({
    key: key as GarmentCategory,
    name: info.name,
    icon: info.icon,
    count: garmentsByCategory[key as GarmentCategory]?.length || 0,
    color: info.color,
    description: info.description
  }))

  if (garments.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-sm">
          {garments.length} prenda{garments.length !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="secondary" className="text-sm">
          <Tag className="h-3 w-3 mr-1" />
          {garmentCategories.filter(c => c.count > 0).length} categorías activas
        </Badge>
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
    </div>
  )
}