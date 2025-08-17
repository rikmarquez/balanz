'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CashAccount } from '@/types';

interface EditCashAccountFormProps {
  account: CashAccount;
  hasTransactions: boolean;
}

export function EditCashAccountForm({ account, hasTransactions }: EditCashAccountFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: account.name,
    isActive: account.isActive,
    initialBalance: account.initialBalance,
  });
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Solo enviar name y isActive para la actualización básica
      const basicData = {
        name: formData.name,
        isActive: formData.isActive,
      };

      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
          return;
        }
        throw new Error(errorData.error || 'Error al actualizar la cuenta');
      }

      router.push('/dashboard/accounts');
      router.refresh();
    } catch (error) {
      console.error('Error updating account:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInitialBalance = async () => {
    setIsUpdatingBalance(true);
    setErrors({});

    try {
      const response = await fetch(`/api/accounts/${account.id}/initial-balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initialBalance: formData.initialBalance }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
          return;
        }
        throw new Error(errorData.error || 'Error al actualizar el saldo inicial');
      }

      router.refresh(); // Refrescar para mostrar los nuevos valores
    } catch (error) {
      console.error('Error updating initial balance:', error);
      setErrors({
        initialBalance: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la cuenta *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Ej: Cuenta personal, Ahorros, etc."
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Cuenta activa
        </label>
      </div>

      {/* Saldo Inicial - Solo editable si no tiene transacciones */}
      <div>
        <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700 mb-2">
          Saldo inicial
        </label>
        {!hasTransactions ? (
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                id="initialBalance"
                name="initialBalance"
                type="number"
                step="0.01"
                min="0"
                value={formData.initialBalance}
                onChange={handleChange}
                className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.initialBalance ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            <button
              type="button"
              onClick={handleUpdateInitialBalance}
              disabled={isUpdatingBalance}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatingBalance ? 'Actualizando...' : 'Actualizar saldo inicial'}
            </button>
            <p className="text-xs text-gray-500">
              Puedes modificar el saldo inicial porque esta cuenta no tiene movimientos registrados.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>${account.initialBalance}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              No se puede modificar el saldo inicial porque esta cuenta ya tiene movimientos registrados.
            </p>
          </div>
        )}
        {errors.initialBalance && (
          <p className="mt-1 text-sm text-red-600">{errors.initialBalance}</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Información de balances</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Balance inicial: ${account.initialBalance}</p>
          <p>Balance actual: ${account.currentBalance}</p>
          <p className="text-xs text-gray-500 mt-2">
            Los balances no se pueden editar desde aquí. Usa la función de ajustes manuales para modificar el balance actual.
          </p>
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Link href="/dashboard/accounts">
          <Button variant="outline" type="button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}