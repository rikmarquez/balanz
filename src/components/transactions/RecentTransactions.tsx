'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatLocalDate } from '@/lib/utils';
import { TrendingUp, TrendingDown, CreditCard, Wallet, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface RecentTransactionsProps {
  accountId?: string;
  cardId?: string;
  title?: string;
  limit?: number;
}

export function RecentTransactions({ 
  accountId, 
  cardId, 
  title = "Movimientos Recientes",
  limit = 10 
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        
        if (accountId) {
          params.append('accountId', accountId);
        }
        if (cardId) {
          params.append('cardId', cardId);
        }

        const response = await fetch(`/api/transactions?${params}`);
        if (response.ok) {
          const data = await response.json();
          const transactionsData = data.success && data.data ? data.data : data;
          setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        }
      } catch (error) {
        console.error('Error fetching recent transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId, cardId, limit]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>{title}</span>
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>{title}</span>
        </h3>
        {transactions.length > 0 && (
          <Link href="/dashboard/transactions">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <Eye className="h-4 w-4 mr-1" />
              Ver todos
            </Button>
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No hay movimientos recientes</p>
          <p className="text-sm text-gray-500">
            Los movimientos aparecerán aquí una vez que registres transacciones
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              {/* Type Icon */}
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>

              {/* Transaction Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {transaction.description}
                  </h4>
                  {transaction.category && (
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: transaction.category.color || '#6B7280' }}
                    >
                      {transaction.category.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs text-gray-600">
                    {formatLocalDate(transaction.date)}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {transaction.paymentMethod === 'cash' ? (
                      <Wallet className="h-3 w-3 text-gray-400" />
                    ) : (
                      <CreditCard className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-600 truncate">
                      {transaction.paymentMethod === 'cash' 
                        ? transaction.account?.name || 'Efectivo'
                        : transaction.card?.name || 'Tarjeta'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0">
                <span className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}