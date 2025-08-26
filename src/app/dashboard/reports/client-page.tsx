'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, PieChart as PieIcon, BarChart3, LineChart as LineIcon, Download, CreditCard } from 'lucide-react'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'

interface TransactionData {
  id: string
  amount: number
  type: 'income' | 'expense'
  date: string
  category: {
    id: string
    name: string
    color: string
  }
  account?: {
    name: string
  }
  creditCard?: {
    name: string
  }
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface ChartData {
  date: string
  income: number
  expense: number
  balance: number
}

interface CardPayment {
  id: string
  amount: number | string
  paymentDate: string
  description?: string
  createdAt: string
  card: {
    id: string
    name: string
    creditLimit: number | string
    currentBalance: number | string
  }
  sourceAccount: {
    id: string
    name: string
  }
}

interface CardPaymentStats {
  totalPayments: number
  totalAmount: number
  paymentsByCard: Record<string, {
    count: number
    total: number
    cardId: string
    cardName: string
  }>
  paymentsByAccount: Record<string, {
    count: number
    total: number
    accountId: string
    accountName: string
  }>
  dateRange: {
    firstPayment: string | null
    lastPayment: string | null
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export function ReportsClient() {
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState<'category-pie' | 'category-bar' | 'evolution' | 'card-payments'>('category-pie')
  const [cardPayments, setCardPayments] = useState<CardPayment[]>([])
  const [cardPaymentStats, setCardPaymentStats] = useState<CardPaymentStats | null>(null)
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [availableCards, setAvailableCards] = useState<{id: string, name: string}[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string>('')

  const [dateRange, setDateRange] = useState(() => {
    const end = endOfMonth(new Date()) // Usar final del mes para incluir todo el mes actual
    const start = startOfMonth(new Date())
    return { start, end }
  })

  useEffect(() => {
    fetchTransactions()
    if (activeChart === 'card-payments') {
      fetchCardPayments()
    }
  }, [dateRange]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeChart === 'card-payments') {
      fetchAvailableCards()
      fetchCardPayments()
    }
  }, [activeChart]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeChart === 'card-payments') {
      fetchCardPayments()
    }
  }, [selectedCardId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      })
      
      const response = await fetch(`/api/transactions?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        // El API devuelve un wrapper con success y data
        let transactionsData = []
        if (data.success && data.data && Array.isArray(data.data)) {
          transactionsData = data.data
        } else if (Array.isArray(data)) {
          transactionsData = data
        } else {
          console.error('Unexpected API response format:', data)
        }
        
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCards = async () => {
    try {
      const response = await fetch('/api/credit-cards')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setAvailableCards(data.data.map((card: any) => ({
            id: card.id,
            name: card.name
          })))
        }
      }
    } catch (error) {
      console.error('Error fetching available cards:', error)
      setAvailableCards([])
    }
  }

  const fetchCardPayments = async () => {
    try {
      setLoadingPayments(true)
      const params = new URLSearchParams({
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      })
      
      if (selectedCardId) {
        params.append('cardId', selectedCardId)
      }
      
      const response = await fetch(`/api/reports/card-payments?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.data) {
          setCardPayments(data.data.payments || [])
          setCardPaymentStats(data.data.stats || null)
        } else {
          console.error('Unexpected API response format:', data)
          setCardPayments([])
          setCardPaymentStats(null)
        }
      }
    } catch (error) {
      console.error('Error fetching card payments:', error)
      setCardPayments([])
      setCardPaymentStats(null)
    } finally {
      setLoadingPayments(false)
    }
  }

  const updatePeriod = (newPeriod: typeof period) => {
    setPeriod(newPeriod)
    const today = new Date()
    let start: Date
    let end: Date

    switch (newPeriod) {
      case 'week':
        end = today
        start = subDays(end, 7)
        break
      case 'month':
        end = endOfMonth(today) // Incluir todo el mes actual
        start = startOfMonth(today)
        break
      case 'quarter':
        end = today
        start = subMonths(end, 3)
        break
      case 'year':
        end = today
        start = subMonths(end, 12)
        break
      default:
        end = endOfMonth(today)
        start = startOfMonth(today)
    }

    setDateRange({ start, end })
  }

  // Asegurar que transactions sea un array
  const transactionArray = Array.isArray(transactions) ? transactions : []

  // Datos para gráfica de categorías (gastos)
  const expensesByCategory = transactionArray
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Sin categoría'
      const categoryColor = transaction.category?.color || '#6B7280'
      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
      const existing = acc.find(item => item.name === categoryName)
      
      if (existing) {
        existing.value += Math.abs(amount)
      } else {
        acc.push({
          name: categoryName,
          value: Math.abs(amount),
          color: categoryColor
        })
      }
      return acc
    }, [] as CategoryData[])

  // Datos para gráfica de categorías (ingresos)
  const incomesByCategory = transactionArray
    .filter(t => t.type === 'income')
    .reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Sin categoría'
      const categoryColor = transaction.category?.color || '#6B7280'
      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
      const existing = acc.find(item => item.name === categoryName)
      
      if (existing) {
        existing.value += amount
      } else {
        acc.push({
          name: categoryName,
          value: amount,
          color: categoryColor
        })
      }
      return acc
    }, [] as CategoryData[])

  // Datos para evolución temporal
  const evolutionData = () => {
    const groupedData = new Map<string, { income: number; expense: number }>()
    
    transactionArray.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd')
      const existing = groupedData.get(date) || { income: 0, expense: 0 }
      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
      
      if (transaction.type === 'income') {
        existing.income += amount
      } else {
        existing.expense += Math.abs(amount)
      }
      
      groupedData.set(date, existing)
    })

    const result: ChartData[] = []
    let runningBalance = 0

    Array.from(groupedData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, data]) => {
        runningBalance += data.income - data.expense
        result.push({
          date: format(new Date(date), 'dd/MM'),
          income: data.income,
          expense: data.expense,
          balance: runningBalance
        })
      })

    return result
  }

  const totalIncome = transactionArray
    .filter(t => t.type === 'income')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

  const totalExpense = transactionArray
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      return sum + Math.abs(isNaN(amount) ? 0 : amount)
    }, 0)

  const balance = totalIncome - totalExpense

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Análisis detallado de tus finanzas</p>
        </div>
        <div className="flex">
          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros de período */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Período de Análisis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              onClick={() => updatePeriod(p)}
              className="capitalize w-full"
              size="sm"
            >
              {p === 'week' && 'Semana'}
              {p === 'month' && 'Mes'}
              {p === 'quarter' && 'Trimestre'}
              {p === 'year' && 'Año'}
            </Button>
          ))}
        </div>
      </div>

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gastos Totales</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpense.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-600 rotate-180" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${balance.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Selector de gráficas */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de Análisis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <Button
            variant={activeChart === 'category-pie' ? 'default' : 'outline'}
            onClick={() => setActiveChart('category-pie')}
            className="flex items-center gap-2 w-full justify-start"
            size="sm"
          >
            <PieIcon className="w-4 h-4" />
            Gastos por Categoría
          </Button>
          <Button
            variant={activeChart === 'category-bar' ? 'default' : 'outline'}
            onClick={() => setActiveChart('category-bar')}
            className="flex items-center gap-2 w-full justify-start"
            size="sm"
          >
            <BarChart3 className="w-4 h-4" />
            Comparativa
          </Button>
          <Button
            variant={activeChart === 'evolution' ? 'default' : 'outline'}
            onClick={() => setActiveChart('evolution')}
            className="flex items-center gap-2 w-full justify-start"
            size="sm"
          >
            <LineIcon className="w-4 h-4" />
            Evolución Temporal
          </Button>
          <Button
            variant={activeChart === 'card-payments' ? 'default' : 'outline'}
            onClick={() => setActiveChart('card-payments')}
            className="flex items-center gap-2 w-full justify-start"
            size="sm"
          >
            <CreditCard className="w-4 h-4" />
            Pagos de Tarjetas
          </Button>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeChart === 'category-pie' && (
          <>
            {/* Gastos por categoría */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Gastos por Categoría</h3>
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Monto']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-500">
                  No hay datos de gastos para mostrar
                </div>
              )}
            </div>

            {/* Ingresos por categoría */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Ingresos por Categoría</h3>
              {incomesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Monto']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-500">
                  No hay datos de ingresos para mostrar
                </div>
              )}
            </div>
          </>
        )}

        {activeChart === 'category-bar' && (
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Comparativa: Ingresos vs Gastos por Categoría</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={[
                  ...incomesByCategory.map(c => ({ ...c, type: 'Ingresos' })),
                  ...expensesByCategory.map(c => ({ ...c, type: 'Gastos', value: -c.value }))
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${Math.abs(value).toLocaleString('es-MX')}`} />
                <Tooltip 
                  formatter={(value: number) => [`$${Math.abs(value).toLocaleString('es-MX')}`, value > 0 ? 'Ingresos' : 'Gastos']}
                />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'evolution' && (
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Evolución Temporal</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={evolutionData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString('es-MX')}`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#00C49F" name="Ingresos" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#FF8042" name="Gastos" strokeWidth={2} />
                <Line type="monotone" dataKey="balance" stroke="#0088FE" name="Balance Acumulado" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'card-payments' && (
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pagos de Tarjetas de Crédito</h3>
              
              {/* Filtro por tarjeta */}
              {availableCards.length > 0 && (
                <div className="mt-2 sm:mt-0">
                  <label htmlFor="card-filter" className="sr-only">Filtrar por tarjeta</label>
                  <select
                    id="card-filter"
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[180px]"
                  >
                    <option value="" className="text-gray-900 bg-white">Todas las tarjetas</option>
                    {availableCards.map((card) => (
                      <option key={card.id} value={card.id} className="text-gray-900 bg-white">
                        {card.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {loadingPayments ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Estadísticas generales */}
                {cardPaymentStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Total de Pagos</p>
                      <p className="text-2xl font-bold text-blue-900">{cardPaymentStats.totalPayments}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Monto Total</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${cardPaymentStats.totalAmount.toLocaleString('es-MX')}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Cuentas Usadas</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {Object.keys(cardPaymentStats.paymentsByAccount).length}
                      </p>
                    </div>
                  </div>
                )}

                {/* Resumen por tarjeta */}
                {cardPaymentStats && Object.keys(cardPaymentStats.paymentsByCard).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold mb-3 text-gray-800">Resumen por Tarjeta</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.values(cardPaymentStats.paymentsByCard).map((cardData) => (
                        <div key={cardData.cardId} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{cardData.cardName}</h5>
                            <CreditCard className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Pagos</p>
                              <p className="font-semibold">{cardData.count}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total</p>
                              <p className="font-semibold text-green-600">
                                ${cardData.total.toLocaleString('es-MX')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen por cuenta de origen */}
                {cardPaymentStats && Object.keys(cardPaymentStats.paymentsByAccount).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold mb-3 text-gray-800">Resumen por Cuenta de Origen</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.values(cardPaymentStats.paymentsByAccount).map((accountData) => (
                        <div key={accountData.accountId} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{accountData.accountName}</h5>
                            <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">$</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-blue-700">Pagos realizados</p>
                              <p className="font-semibold text-blue-900">{accountData.count}</p>
                            </div>
                            <div>
                              <p className="text-blue-700">Total pagado</p>
                              <p className="font-semibold text-blue-900">
                                ${accountData.total.toLocaleString('es-MX')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista detallada de pagos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-800">Detalle de Pagos</h4>
                    {cardPayments.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {cardPayments.length} pago{cardPayments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    {cardPayments.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {cardPayments.slice(0, 15).map((payment) => {
                          const amount = typeof payment.amount === 'string' ? 
                            parseFloat(payment.amount) : payment.amount;
                          const displayAmount = Math.abs(amount || 0); // Mostrar como valor absoluto
                          return (
                            <div key={payment.id} className="p-4 hover:bg-white transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <CreditCard className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-gray-900">{payment.card.name}</span>
                                    <span className="text-sm text-gray-500">→</span>
                                    <span className="text-sm text-gray-700">{payment.sourceAccount.name}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>{format(new Date(payment.paymentDate), 'dd/MM/yyyy')}</span>
                                    {payment.description && (
                                      <span className="truncate">{payment.description}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-semibold text-green-600">
                                    ${displayAmount.toLocaleString('es-MX')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {cardPayments.length > 15 && (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            ... y {cardPayments.length - 15} pagos más
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No hay pagos de tarjetas en el período seleccionado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista resumen por categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Gastos por Categoría</h3>
          <div className="space-y-3">
            {expensesByCategory
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-red-600 font-semibold">
                    ${category.value.toLocaleString('es-MX')}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Ingresos por Categoría</h3>
          <div className="space-y-3">
            {incomesByCategory
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-green-600 font-semibold">
                    ${category.value.toLocaleString('es-MX')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}