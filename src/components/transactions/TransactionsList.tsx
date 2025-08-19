'use client';

import { Transaction } from '@/types';
import { formatCurrency, formatLocalDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Edit, CreditCard, Wallet, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TransactionsListProps {
  transactions: any[]; // Using any for now since we have joined data
  onTransactionUpdate?: () => void;
}

export function TransactionsList({ transactions, onTransactionUpdate }: TransactionsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (transactionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      return;
    }

    setDeletingId(transactionId);

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la transacción');
      }

      if (onTransactionUpdate) {
        onTransactionUpdate();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error al eliminar la transacción');
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
        <p className="text-gray-600 mb-4">Registra tu primera transacción para comenzar</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-xs mx-auto">
          <Link href="/dashboard/transactions/new?type=income" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">Registrar Ingreso</Button>
          </Link>
          <Link href="/dashboard/transactions/new?type=expense" className="flex-1 sm:flex-none">
            <Button className="w-full">Registrar Gasto</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
        >
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
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

                {/* Transaction Description and Amount */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {transaction.description}
                  </h3>
                  <span className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Date and Account/Card in same line with truncation */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                {formatLocalDate(transaction.date)}
              </span>
              
              <div className="flex items-center space-x-1 flex-shrink-0 min-w-0 max-w-[50%]">
                {transaction.paymentMethod === 'cash' ? (
                  <Wallet className="h-4 w-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-600 truncate">
                  {transaction.paymentMethod === 'cash' 
                    ? transaction.account?.name || 'Efectivo'
                    : transaction.card?.name || 'Tarjeta'
                  }
                </span>
              </div>
            </div>

            {/* Category and Action icons in same line */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {transaction.category && (
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: transaction.category.color }}
                  >
                    {transaction.category.name}
                  </span>
                )}
              </div>
              
              {/* Action Icons - only icons */}
              <div className="flex space-x-1 flex-shrink-0">
                <Link href={`/dashboard/transactions/${transaction.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notes - if present */}
            {transaction.notes && (
              <p className="text-sm text-gray-500 mt-2 truncate">{transaction.notes}</p>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Type Icon */}
              <div className={`p-2 rounded-lg ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>

              {/* Transaction Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </h3>
                  {transaction.category && (
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: transaction.category.color }}
                    >
                      {transaction.category.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">
                    {formatLocalDate(transaction.date)}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {transaction.paymentMethod === 'cash' ? (
                      <Wallet className="h-4 w-4 text-gray-400" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {transaction.paymentMethod === 'cash' 
                        ? transaction.account?.name || 'Efectivo'
                        : transaction.card?.name || 'Tarjeta'
                      }
                    </span>
                  </div>
                </div>

                {transaction.notes && (
                  <p className="text-sm text-gray-500 mt-1">{transaction.notes}</p>
                )}
              </div>
            </div>

            {/* Amount and Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
              
              <div className="flex space-x-1">
                <Link href={`/dashboard/transactions/${transaction.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}