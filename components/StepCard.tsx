import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function StepCard({
  icon, title, desc, cta, href, ctaVariant = 'secondary-minimal',
}: { 
  icon: ReactNode; 
  title: string; 
  desc: string; 
  cta: string; 
  href: string;
  ctaVariant?: 'primary' | 'accent' | 'secondary-minimal'
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-card hover:shadow-md transition">
      <div className="mb-3 text-ink-500">{icon}</div>
      <h3 className="text-base font-semibold mb-1 text-ink-500">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{desc}</p>
      <Button variant={ctaVariant} asChild>
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  )
}