import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'accent'|'secondary'|'ghost'|'primary'

export function AppButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {variant?:Variant}) {
  const v = (props as any).variant as Variant ?? 'accent'
  const base = 'inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1'
  const map: Record<Variant,string> = {
    primary:'bg-ink-500 text-white hover:bg-ink-600 focus:ring-ink-200',
    accent:'bg-blush-400 text-white hover:bg-blush-500 focus:ring-blush-100',
    secondary:'bg-white border border-border text-text-primary hover:bg-surface focus:ring-ink-100',
    ghost:'text-text-secondary hover:bg-surface'
  }
  return <button {...props} className={cn(base, map[v], className)} />
}