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
    <div className={cn("flex w-full sm:inline-flex bg-surface border border-border rounded-2xl p-1", className)} role="tablist">
      {options.map(o => {
        const active = o.value === current
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition flex-1 sm:flex-none",
              active ? "bg-white shadow-card text-ink-500" : "text-text-secondary hover:text-text-primary"
            )}
            onClick={() => { setLocal(o.value); onChange?.(o.value) }}
          >
            <span className="inline-flex items-center gap-1 sm:gap-2 justify-center">
              {o.icon}
              <span className="hidden sm:inline">{o.label}</span>
              <span className="sm:hidden">{o.label.split(' ')[0]}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}