'use client'

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { formatLocalDate } from '@/lib/utils'

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  description: string
  date: string
  category: {
    name: string
    color: string
  }
  account?: {
    name: string
  }
  card?: {
    name: string
  }
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentTransactions()
  }, [])

  const fetchRecentTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions?limit=5')
      if (response.ok) {
        const data = await response.json()
        // El API devuelve un wrapper con success y data
        if (data.success && data.data && Array.isArray(data.data)) {
          setTransactions(data.data)
        } else if (Array.isArray(data)) {
          setTransactions(data)
        } else {
          setTransactions([])
        }
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h2>
        <Link 
          href="/dashboard/transactions"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Ver todas
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
          <p className="text-gray-600">
            Las transacciones recientes aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{transaction.category.name}</span>
                    <span>•</span>
                    <span>{transaction.account?.name || transaction.card?.name}</span>
                    <span>•</span>
                    <span>{formatLocalDate(transaction.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div className={`text-sm font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}