'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Zap, TrendingUp, TrendingDown, Calendar, Info, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreditsPage() {
  const { credits, creditBalance, creditTransactions, loadCreditTransactions, isLoadingCredits } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await loadCreditTransactions(100)
      setLoading(false)
    }
    loadData()
  }, [loadCreditTransactions])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Compra'
      case 'consumption':
        return 'Consumo'
      case 'refund':
        return 'Reembolso'
      case 'admin_adjustment':
        return 'Ajuste Admin'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'refund':
      case 'admin_adjustment':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'consumption':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading || isLoadingCredits) {
    return (
      <main className="mx-auto max-w-5xl px-6 pb-28 pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-500">Créditos</h1>
          <p className="mt-1 text-text-secondary">Cargando tu información de créditos...</p>
        </div>
        <LoadingSpinner size="lg" text="Cargando..." />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-500">Créditos</h1>
        <p className="mt-1 text-text-secondary">Gestiona tus créditos y revisa tu historial de transacciones</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">Balance Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" fill="currentColor" />
              <span className="text-4xl font-bold text-ink-500">{credits}</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {credits === 1 ? 'crédito disponible' : 'créditos disponibles'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Gastado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-7 w-7 text-red-500" />
              <span className="text-3xl font-bold text-ink-500">{creditBalance?.total_spent || 0}</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {creditBalance?.total_spent === 1 ? 'crédito consumido' : 'créditos consumidos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Recibido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-7 w-7 text-green-500" />
              <span className="text-3xl font-bold text-ink-500">{creditBalance?.total_purchased || 0}</span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {creditBalance?.total_purchased === 1 ? 'crédito recibido' : 'créditos recibidos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">¿Cómo funcionan los créditos?</p>
              <ul className="space-y-1 list-disc list-inside text-blue-800">
                <li>Cada imagen generada consume 1 crédito</li>
                <li>Si generas 2 variantes, consumirás 2 créditos</li>
                <li>Puedes reportar imágenes con problemas para obtener reembolsos</li>
                <li>Los reembolsos se procesan en 24-48 horas</li>
              </ul>
              <div className="mt-4">
                <Button asChild size="sm" variant="outline" className="bg-white hover:bg-blue-100">
                  <Link href="/contact">
                    <Mail className="h-4 w-4 mr-2" />
                    ¿Necesitas más créditos? Contáctanos
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creditTransactions.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <Zap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No tienes transacciones todavía</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creditTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-surface transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge className={getTypeColor(transaction.type)} variant="outline">
                        {getTypeLabel(transaction.type)}
                      </Badge>
                      <p className="text-sm font-medium text-ink-500">{transaction.description}</p>
                    </div>
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount}
                    </span>
                    <Zap
                      className={`h-5 w-5 ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                      fill="currentColor"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}