'use client'
import { cn } from '@/lib/utils'
import { useId } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function GarmentCard({
  img, title, category, selected, onSelect, onPreview
}: { 
  img: string
  title: string
  category: string
  selected?: boolean
  onSelect?: () => void
  onPreview?: () => void
}) {
  const id = useId()
  
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white shadow-card transition cursor-pointer",
        selected ? "border-ink-500 ring-2 ring-ink-200" : "border-border hover:shadow-md"
      )}
      onClick={onSelect}
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img src={img} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      </div>
      
      <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs text-text-secondary">
        {title}
      </div>
      
      {selected && (
        <div className="absolute top-3 right-3 rounded-full bg-ink-500 text-white text-xs px-2 py-1">
          ✓
        </div>
      )}
      
      <div className="absolute bottom-3 right-3">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/90 border-border hover:bg-white"
          onClick={(e) => {
            e.stopPropagation()
            onPreview?.()
          }}
        >
          <Eye className="h-4 w-4 text-ink-500" />
        </Button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
        <p className="text-xs text-white/90 capitalize">{category}</p>
      </div>
      
      <div id={id} className="sr-only">{selected ? 'Seleccionado' : 'No seleccionado'}</div>
    </div>
  )
}