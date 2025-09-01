'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { CashAccount, CreditCard, Category, Tag } from '@/types';
import { getCurrentLocalDate, formatDateToLocal } from '@/utils/dateUtils';

interface TransactionFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  isLoading?: boolean;
}

export interface FilterValues {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  tagIds?: string[];
  paymentMethod?: 'cash' | 'credit_card' | '';
  type?: 'income' | 'expense' | '';
  egressType?: 'all' | 'cash_only' | 'transfers_only' | '';
  accountId?: string;
  cardId?: string;
  searchText?: string;
}

export function TransactionFilters({ onFiltersChange, isLoading }: TransactionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Configurar filtros por defecto para mostrar solo transacciones del mes actual
  const getDefaultFilters = (): FilterValues => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      startDate: formatDateToLocal(monthStart),
      endDate: getCurrentLocalDate(),
      categoryIds: [],
      tagIds: [],
      paymentMethod: '',
      type: '',
      egressType: '',
      accountId: '',
      cardId: '',
      searchText: ''
    };
  };

  const [filters, setFilters] = useState<FilterValues>(getDefaultFilters());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Aplicar filtros automáticamente cuando cambien
    const cleanFilters: FilterValues = {};
    
    if (filters.startDate) cleanFilters.startDate = filters.startDate;
    if (filters.endDate) cleanFilters.endDate = filters.endDate;
    if (filters.categoryIds && filters.categoryIds.length > 0) cleanFilters.categoryIds = filters.categoryIds;
    if (filters.tagIds && filters.tagIds.length > 0) cleanFilters.tagIds = filters.tagIds;
    if (filters.paymentMethod) cleanFilters.paymentMethod = filters.paymentMethod as 'cash' | 'credit_card';
    if (filters.type) cleanFilters.type = filters.type as 'income' | 'expense';
    if (filters.egressType) cleanFilters.egressType = filters.egressType as 'all' | 'cash_only' | 'transfers_only';
    if (filters.accountId) cleanFilters.accountId = filters.accountId;
    if (filters.cardId) cleanFilters.cardId = filters.cardId;
    if (filters.searchText) cleanFilters.searchText = filters.searchText;

    onFiltersChange(cleanFilters);
  }, [filters, onFiltersChange]);

  const loadData = async () => {
    try {
      const [accountsRes, cardsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/credit-cards'),
        fetch('/api/categories'),
        fetch('/api/tags')
      ]);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.data || []);
      }

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setCards(cardsData.data || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data || []);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData.data || []);
      }
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const updateFilter = (key: keyof FilterValues, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters(getDefaultFilters());
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  const getQuickDateFilter = (type: 'today' | 'week' | 'month' | 'prev_month' | 'year') => {
    const today = new Date();
    let startDate = '';
    
    switch (type) {
      case 'today':
        startDate = getCurrentLocalDate();
        updateFilter('startDate', startDate);
        updateFilter('endDate', startDate);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        updateFilter('startDate', formatDateToLocal(weekAgo));
        updateFilter('endDate', getCurrentLocalDate());
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        updateFilter('startDate', formatDateToLocal(monthStart));
        updateFilter('endDate', getCurrentLocalDate());
        break;
      case 'prev_month':
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Último día del mes anterior
        updateFilter('startDate', formatDateToLocal(prevMonthStart));
        updateFilter('endDate', formatDateToLocal(prevMonthEnd));
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        updateFilter('startDate', formatDateToLocal(yearStart));
        updateFilter('endDate', getCurrentLocalDate());
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header con búsqueda y toggle de filtros */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-4">
          {/* Búsqueda de texto */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en descripción o notas..."
              value={filters.searchText || ''}
              onChange={(e) => updateFilter('searchText', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Botones de filtros */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showFilters || hasActiveFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).filter(value => 
                    Array.isArray(value) ? value.length > 0 : Boolean(value)
                  ).length}
                </span>
              )}
            </Button>

            {/* Botón limpiar */}
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Filtros de fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Rango de Fechas
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fecha desde"
                />
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fecha hasta"
                />
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => getQuickDateFilter('today')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => getQuickDateFilter('week')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    7 días
                  </button>
                  <button
                    onClick={() => getQuickDateFilter('month')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Este mes
                  </button>
                  <button
                    onClick={() => getQuickDateFilter('prev_month')}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    Mes anterior
                  </button>
                  <button
                    onClick={() => getQuickDateFilter('year')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Este año
                  </button>
                </div>
              </div>
            </div>

            {/* Tipo de transacción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={filters.paymentMethod || ''}
                onChange={(e) => updateFilter('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="cash">Efectivo</option>
                <option value="credit_card">Tarjeta de Crédito</option>
              </select>
            </div>

            {/* Tipo de Egreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Egreso
              </label>
              <select
                value={filters.egressType || ''}
                onChange={(e) => updateFilter('egressType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los egresos</option>
                <option value="cash_only">Solo efectivo</option>
                <option value="transfers_only">Solo transferencias</option>
                <option value="all">Efectivo + Transferencias</option>
              </select>
            </div>

            {/* Cuenta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta
              </label>
              <select
                value={filters.accountId || ''}
                onChange={(e) => updateFilter('accountId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las cuentas</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tarjeta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarjeta
              </label>
              <select
                value={filters.cardId || ''}
                onChange={(e) => updateFilter('cardId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las tarjetas</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Categorías */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorías
              </label>
              <select
                multiple
                value={filters.categoryIds || []}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  updateFilter('categoryIds', selectedOptions);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}