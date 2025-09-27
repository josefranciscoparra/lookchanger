'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Accordion({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-border bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4"
        aria-expanded={open}
      >
        <span className="font-medium">{title}</span>
        <span className={cn('transition', open ? 'rotate-180' : '')}>▾</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-text-secondary">{children}</div>}
    </div>
  )
}