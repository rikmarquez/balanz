'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CashAccount } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Edit, Settings, Trash2, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface CashAccountDetailProps {
  account: CashAccount;
}

export function CashAccountDetail({ account }: CashAccountDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/accounts/${account.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        {/* Balance Inicial */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Balance Inicial</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(account.initialBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              account.isActive ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Settings className={`h-6 w-6 ${
                account.isActive ? 'text-green-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className={`text-lg font-bold ${
                account.isActive ? 'text-green-600' : 'text-gray-600'
              }`}>
                {account.isActive ? 'Activa' : 'Inactiva'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la cuenta</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-600">ID de la cuenta</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">{account.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Fecha de creación</label>
            <p className="text-sm text-gray-900">
              {new Date(account.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Última actualización</label>
            <p className="text-sm text-gray-900">
              {new Date(account.updatedAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Diferencia</label>
            <p className={`text-sm font-medium ${
              parseFloat(account.currentBalance) - parseFloat(account.initialBalance) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency(
                (parseFloat(account.currentBalance) - parseFloat(account.initialBalance)).toString()
              )}
            </p>
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