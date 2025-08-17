'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  Calculator, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Wallet,
  CreditCard,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Account {
  id: string
  name: string
  currentBalance: number
  type: string
}

interface CreditCard {
  id: string
  name: string
  currentBalance: number
  creditLimit: number
}

interface BalanceAdjustment {
  id: string
  accountId?: string
  creditCardId?: string
  previousBalance: number
  newBalance: number
  adjustmentAmount: number
  reason: string
  createdAt: string
  account?: { name: string }
  creditCard?: { name: string }
}

export function BalanceAdjustmentsClient() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [adjustments, setAdjustments] = useState<BalanceAdjustment[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'account' | 'card'; id: string } | null>(null)
  const [newBalance, setNewBalance] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [accountsRes, cardsRes, adjustmentsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/credit-cards'),
        fetch('/api/admin/balance-adjustments')
      ])

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(accountsData)
      }

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json()
        setCreditCards(cardsData)
      }

      if (adjustmentsRes.ok) {
        const adjustmentsData = await adjustmentsRes.json()
        setAdjustments(adjustmentsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEntity || !newBalance || !reason) return

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/balance-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: selectedEntity.type,
          entityId: selectedEntity.id,
          newBalance: parseFloat(newBalance),
          reason
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ajuste de saldo realizado exitosamente' })
        setShowForm(false)
        setSelectedEntity(null)
        setNewBalance('')
        setReason('')
        await fetchData()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Error al realizar ajuste' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentBalance = () => {
    if (!selectedEntity) return 0
    
    if (selectedEntity.type === 'account') {
      const account = accounts.find(a => a.id === selectedEntity.id)
      return account?.currentBalance || 0
    } else {
      const card = creditCards.find(c => c.id === selectedEntity.id)
      return card?.currentBalance || 0
    }
  }

  const getAdjustmentAmount = () => {
    const current = getCurrentBalance()
    const target = parseFloat(newBalance) || 0
    return target - current
  }

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000)
  }

  useEffect(() => {
    if (message) clearMessage()
  }, [message])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Calculator className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Ajustes Manuales de Saldos</h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Ajuste
        </Button>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Formulario de nuevo ajuste */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Crear Ajuste de Saldo</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selección de cuenta/tarjeta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Cuenta o Tarjeta
              </label>
              <div className="space-y-2">
                {/* Cuentas */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cuentas de Efectivo</p>
                  <div className="grid gap-2">
                    {accounts.map((account) => (
                      <label key={account.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="entity"
                          value={`account-${account.id}`}
                          checked={selectedEntity?.type === 'account' && selectedEntity.id === account.id}
                          onChange={() => setSelectedEntity({ type: 'account', id: account.id })}
                          className="text-blue-600"
                        />
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <span className="font-medium">{account.name}</span>
                          <span className="ml-2 text-sm text-gray-600">
                            Saldo actual: ${account.currentBalance.toLocaleString()}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tarjetas */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tarjetas de Crédito</p>
                  <div className="grid gap-2">
                    {creditCards.map((card) => (
                      <label key={card.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="entity"
                          value={`card-${card.id}`}
                          checked={selectedEntity?.type === 'card' && selectedEntity.id === card.id}
                          onChange={() => setSelectedEntity({ type: 'card', id: card.id })}
                          className="text-blue-600"
                        />
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <span className="font-medium">{card.name}</span>
                          <span className="ml-2 text-sm text-gray-600">
                            Saldo actual: ${card.currentBalance.toLocaleString()}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Nuevo saldo */}
            {selectedEntity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Saldo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                {newBalance && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Saldo actual:</span> ${getCurrentBalance().toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Nuevo saldo:</span> ${parseFloat(newBalance || '0').toLocaleString()}
                    </p>
                    <p className={`text-sm font-medium ${
                      getAdjustmentAmount() >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <span>Ajuste:</span> {getAdjustmentAmount() >= 0 ? '+' : ''}${getAdjustmentAmount().toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del Ajuste
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Explica el motivo del ajuste manual..."
                required
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!selectedEntity || !newBalance || !reason || loading}
                className="flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                {loading ? 'Aplicando...' : 'Aplicar Ajuste'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Historial de ajustes */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Historial de Ajustes</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuenta/Tarjeta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo Anterior
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nuevo Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ajuste
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustments.map((adjustment) => (
                <tr key={adjustment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(adjustment.createdAt), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {adjustment.accountId ? (
                        <Wallet className="w-4 h-4 text-gray-400" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {adjustment.account?.name || adjustment.creditCard?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${adjustment.previousBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${adjustment.newBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      adjustment.adjustmentAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {adjustment.adjustmentAmount >= 0 ? '+' : ''}${adjustment.adjustmentAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {adjustment.reason}
                  </td>
                </tr>
              ))}
              {adjustments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay ajustes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}