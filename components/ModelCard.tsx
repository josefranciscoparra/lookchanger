'use client'
import { cn } from '@/lib/utils'
import { useId } from 'react'

export function ModelCard({
  img, title, selected, onSelect
}: { img: string; title: string; selected?: boolean; onSelect?: () => void }) {
  const id = useId()
  return (
    <button
      aria-pressed={selected}
      aria-describedby={id}
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white shadow-card transition",
        selected ? "border-ink-500 ring-2 ring-ink-200" : "border-border hover:shadow-md"
      )}
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        <img src={img} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs text-text-secondary">
        {title}
      </div>
      {selected && (
        <div className="absolute top-3 right-3 rounded-full bg-ink-500 text-white text-xs px-2 py-1">
          ✓
        </div>
      )}
      <div id={id} className="sr-only">{selected ? 'Seleccionado' : 'No seleccionado'}</div>
    </button>
  )
}