'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Zap, Mail } from 'lucide-react'
import Link from 'next/link'

interface InsufficientCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  currentCredits: number
  requiredCredits: number
  creditsNeeded: number
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  currentCredits,
  requiredCredits,
  creditsNeeded
}: InsufficientCreditsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Créditos Insuficientes</DialogTitle>
          <DialogDescription className="text-center">
            No tienes suficientes créditos para completar esta operación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Balance actual vs necesario */}
          <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Créditos actuales:</span>
              <span className="font-semibold text-ink-500">
                <Zap className="inline h-4 w-4 mr-1" />
                {currentCredits}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Créditos necesarios:</span>
              <span className="font-semibold text-ink-500">
                <Zap className="inline h-4 w-4 mr-1" />
                {requiredCredits}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink-500">Te faltan:</span>
              <span className="font-bold text-red-600">
                <Zap className="inline h-4 w-4 mr-1" fill="currentColor" />
                {creditsNeeded} {creditsNeeded === 1 ? 'crédito' : 'créditos'}
              </span>
            </div>
          </div>

          {/* Información adicional */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">¿Cómo obtener más créditos?</p>
            <p className="text-xs">
              Actualmente estamos asignando créditos manualmente. Contacta con nosotros para
              obtener más créditos y seguir creando outfits increíbles.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button asChild variant="accent" className="w-full sm:w-auto">
            <Link href="/contact">
              <Mail className="h-4 w-4 mr-2" />
              Contactar
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}