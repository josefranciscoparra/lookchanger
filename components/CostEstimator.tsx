'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CostEstimatorProps {
  variants: number
  className?: string
}

export function CostEstimator({ variants, className }: CostEstimatorProps) {
  const { credits } = useAppStore()
  const [estimate, setEstimate] = useState<{
    cost: number
    hasSufficient: boolean
    creditsNeeded: number
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/credits/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variants })
        })

        const data = await response.json()
        if (response.ok && data.success) {
          setEstimate({
            cost: data.cost,
            hasSufficient: data.has_sufficient_credits,
            creditsNeeded: data.credits_needed
          })
        }
      } catch (error) {
        console.error('Error fetching cost estimate:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEstimate()
  }, [variants])

  if (loading || !estimate) {
    return (
      <div className={cn('rounded-lg border border-border bg-surface p-3 animate-pulse', className)}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        estimate.hasSufficient
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {estimate.hasSufficient ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <div className="text-sm">
            <p className={cn(
              'font-medium',
              estimate.hasSufficient ? 'text-green-900' : 'text-red-900'
            )}>
              {estimate.hasSufficient
                ? 'Tienes créditos suficientes'
                : 'Créditos insuficientes'}
            </p>
            <p className={cn(
              'text-xs',
              estimate.hasSufficient ? 'text-green-700' : 'text-red-700'
            )}>
              Esta generación costará{' '}
              <span className="font-semibold">{estimate.cost}</span>{' '}
              {estimate.cost === 1 ? 'crédito' : 'créditos'}
              {!estimate.hasSufficient && (
                <> (te faltan {estimate.creditsNeeded})</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm font-bold">
          <Zap
            className={cn(
              'h-5 w-5',
              estimate.hasSufficient ? 'text-green-600' : 'text-red-600'
            )}
            fill="currentColor"
          />
          <span className={cn(
            estimate.hasSufficient ? 'text-green-900' : 'text-red-900'
          )}>
            {credits}
          </span>
        </div>
      </div>
    </div>
  )
}