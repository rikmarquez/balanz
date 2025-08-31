'use client';

import { useState, useEffect, useCallback } from 'react';
import { TransactionsList } from '@/components/transactions/TransactionsList';
import { TransactionFilters, FilterValues } from '@/components/transactions/TransactionFilters';
import { Button } from '@/components/ui/Button';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: string;
  date: string;
  description: string;
  type: string;
  paymentMethod: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    type: string;
    color: string | null;
  } | null;
  account?: {
    id: string;
    name: string;
  } | null;
  card?: {
    id: string;
    name: string;
  } | null;
}

interface TransactionsClientPageProps {
  initialTransactions: Transaction[];
}

export function TransactionsClientPage({ initialTransactions }: TransactionsClientPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});

  const loadTransactions = useCallback(async (filters: FilterValues = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Agregar parámetros de filtros a la URL
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        params.append('categoryIds', filters.categoryIds.join(','));
      }
      if (filters.tagIds && filters.tagIds.length > 0) {
        params.append('tagIds', filters.tagIds.join(','));
      }
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.type) params.append('type', filters.type);
      if (filters.egressType) params.append('egressType', filters.egressType);
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.cardId) params.append('cardId', filters.cardId);
      if (filters.searchText) params.append('searchText', filters.searchText);
      
      // Siempre limitar a 100 transacciones para performance
      params.append('limit', '100');
      
      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFiltersChange = useCallback((filters: FilterValues) => {
    setActiveFilters(filters);
    loadTransactions(filters);
  }, [loadTransactions]);

  // Calcular estadísticas basadas en las transacciones filtradas
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // EGRESOS = gastos en efectivo + transferencias (pagos de tarjeta)
  const totalEgresos = transactions
    .filter(t => 
      (t.type === 'expense' && t.paymentMethod === 'cash') || 
      (t.type === 'transfer')
    )
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // FLUJO DE EFECTIVO = INGRESOS - EGRESOS
  const cashFlow = totalIncome - totalEgresos;

  const balance = totalIncome - totalExpenses;

  // Determinar si hay filtros activos para mostrar indicadores
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-600">
            Registra y gestiona tus ingresos y gastos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/transactions/new?type=income" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Nuevo Ingreso
            </Button>
          </Link>
          <Link href="/dashboard/transactions/new?type=expense" className="flex-1 sm:flex-none">
            <Button className="w-full sm:w-auto">
              <TrendingDown className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Total Ingresos
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Total Gastos
                </p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <Plus className={`h-6 w-6 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Balance
                </p>
              </div>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Egresos
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                ${totalEgresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${cashFlow >= 0 ? 'bg-purple-100' : 'bg-red-100'}`}>
              <Plus className={`h-6 w-6 ${cashFlow >= 0 ? 'text-purple-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Flujo de Efectivo
                </p>
              </div>
              <p className={`text-2xl font-bold ${cashFlow >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                ${cashFlow.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <TransactionFilters 
        onFiltersChange={handleFiltersChange}
        isLoading={loading}
      />

      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Transacciones
                {Object.keys(activeFilters).length > 0 && ' (Filtradas)'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? 'Cargando...' : `${transactions.length} transacciones`}
                {Object.keys(activeFilters).length > 0 && ' encontradas'}
              </p>
            </div>
            {Object.keys(activeFilters).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFiltersChange({})}
              >
                Ver Todas
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Cargando transacciones...</p>
          </div>
        ) : (
          <TransactionsList 
            transactions={transactions} 
            onTransactionUpdate={() => loadTransactions(activeFilters)}
          />
        )}
      </div>
    </div>
  );
}