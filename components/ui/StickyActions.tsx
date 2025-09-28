import { ReactNode } from 'react'
export function StickyActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {children}
      </div>
    </div>
  )
}