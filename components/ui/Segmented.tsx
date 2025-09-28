'use client'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type Option = { value: string; label: string; icon?: React.ReactNode }
export function Segmented({
  value, onChange, options, className
}: { value?: string; onChange?: (v:string)=>void; options: Option[]; className?: string }) {
  const [local, setLocal] = useState(value ?? options[0]?.value)
  const current = value ?? local
  return (
    <div className={cn("inline-flex bg-surface border border-border rounded-2xl p-1", className)} role="tablist">
      {options.map(o => {
        const active = o.value === current
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            className={cn(
              "px-4 py-2 rounded-xl text-sm transition",
              active ? "bg-white shadow-card text-ink-500" : "text-text-secondary hover:text-text-primary"
            )}
            onClick={() => { setLocal(o.value); onChange?.(o.value) }}
          >
            <span className="inline-flex items-center gap-2">{o.icon}{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}