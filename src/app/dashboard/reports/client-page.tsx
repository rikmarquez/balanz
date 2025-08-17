'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, PieChart as PieIcon, BarChart3, LineChart as LineIcon, Download } from 'lucide-react'
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export function ReportsClient() {
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState<'category-pie' | 'category-bar' | 'evolution'>('category-pie')

  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = startOfMonth(end)
    return { start, end }
  })

  useEffect(() => {
    fetchTransactions()
  }, [dateRange]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const updatePeriod = (newPeriod: typeof period) => {
    setPeriod(newPeriod)
    const end = new Date()
    let start: Date

    switch (newPeriod) {
      case 'week':
        start = subDays(end, 7)
        break
      case 'month':
        start = startOfMonth(end)
        break
      case 'quarter':
        start = subMonths(end, 3)
        break
      case 'year':
        start = subMonths(end, 12)
        break
      default:
        start = startOfMonth(end)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Filtros de período */}
      <div className="flex gap-2">
        {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            onClick={() => updatePeriod(p)}
            className="capitalize"
          >
            {p === 'week' && 'Semana'}
            {p === 'month' && 'Mes'}
            {p === 'quarter' && 'Trimestre'}
            {p === 'year' && 'Año'}
          </Button>
        ))}
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
      <div className="flex gap-2 border-b">
        <Button
          variant={activeChart === 'category-pie' ? 'default' : 'ghost'}
          onClick={() => setActiveChart('category-pie')}
          className="flex items-center gap-2"
        >
          <PieIcon className="w-4 h-4" />
          Gastos por Categoría
        </Button>
        <Button
          variant={activeChart === 'category-bar' ? 'default' : 'ghost'}
          onClick={() => setActiveChart('category-bar')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Comparativa
        </Button>
        <Button
          variant={activeChart === 'evolution' ? 'default' : 'ghost'}
          onClick={() => setActiveChart('evolution')}
          className="flex items-center gap-2"
        >
          <LineIcon className="w-4 h-4" />
          Evolución Temporal
        </Button>
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
                    <span className="font-medium">{category.name}</span>
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
                    <span className="font-medium">{category.name}</span>
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