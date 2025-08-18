'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CashAccount } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface CashAccountDetailProps {
  account: CashAccount;
}

interface AccountStats {
  income: number;
  expense: number;
}

export function CashAccountDetail({ account }: CashAccountDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stats, setStats] = useState<AccountStats>({ income: 0, expense: 0 });

  useEffect(() => {
    const fetchAccountStats = async () => {
      try {
        const response = await fetch(`/api/accounts/${account.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching account stats:', error);
      }
    };

    fetchAccountStats();
  }, [account.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la cuenta');
      }

      router.push('/dashboard/accounts');
      router.refresh();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error al eliminar la cuenta');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/accounts">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-gray-600">Detalles de la cuenta</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <Link href={`/dashboard/accounts/${account.id}/edit`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full sm:w-auto text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Balance Actual */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Balance Actual</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(account.currentBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Ingresos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.income.toString())}
              </p>
            </div>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Egresos</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.expense.toString())}
              </p>
            </div>
          </div>
        </div>

        {/* Diferencia */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              parseFloat(account.currentBalance) - parseFloat(account.initialBalance) >= 0 
                ? 'bg-blue-100' : 'bg-orange-100'
            }`}>
              <BarChart3 className={`h-6 w-6 ${
                parseFloat(account.currentBalance) - parseFloat(account.initialBalance) >= 0 
                  ? 'text-blue-600' : 'text-orange-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Diferencia</p>
              <p className={`text-2xl font-bold ${
                parseFloat(account.currentBalance) - parseFloat(account.initialBalance) >= 0 
                  ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {formatCurrency(
                  (parseFloat(account.currentBalance) - parseFloat(account.initialBalance)).toString()
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Inicial */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-slate-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-slate-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Balance Inicial</p>
              <p className="text-2xl font-bold text-slate-600">
                {formatCurrency(account.initialBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Future: Transaction History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de movimientos</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Esta funcionalidad estará disponible próximamente</p>
          <p className="text-sm text-gray-500 mt-2">
            Aquí podrás ver todas las transacciones asociadas a esta cuenta
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la cuenta &quot;{account.name}&quot;? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}