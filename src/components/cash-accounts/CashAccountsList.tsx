'use client';

import { CashAccount } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface CashAccountsListProps {
  accounts: CashAccount[];
}

export function CashAccountsList({ accounts }: CashAccountsListProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuentas</h3>
        <p className="text-gray-600 mb-4">Crea tu primera cuenta de efectivo para comenzar</p>
        <Link href="/dashboard/accounts/new">
          <Button>Crear cuenta</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
            <div className="flex space-x-2">
              <Link href={`/dashboard/accounts/${account.id}/edit`}>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Balance inicial:</span>
              <span className="text-sm font-medium">
                {formatCurrency(account.initialBalance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Balance actual:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(account.currentBalance)}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${
                account.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {account.isActive ? 'Activa' : 'Inactiva'}
              </span>
              <Link href={`/dashboard/accounts/${account.id}`}>
                <Button variant="outline" size="sm">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}