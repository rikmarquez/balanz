'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { CreditCard } from '@/types';

interface EditCreditCardFormProps {
  creditCard: CreditCard;
  hasTransactions?: boolean;
}

export function EditCreditCardForm({ creditCard, hasTransactions = false }: EditCreditCardFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: creditCard.name,
    creditLimit: creditCard.creditLimit,
    cutDay: creditCard.cutDay,
    dueDay: creditCard.dueDay,
    isActive: creditCard.isActive,
    initialBalance: creditCard.initialBalance,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Solo enviar datos básicos, sin initialBalance
      const basicData = {
        name: formData.name,
        creditLimit: formData.creditLimit,
        cutDay: formData.cutDay,
        dueDay: formData.dueDay,
        isActive: formData.isActive,
      };

      const response = await fetch(`/api/credit-cards/${creditCard.id}`, {
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
        throw new Error(errorData.error || 'Error al actualizar la tarjeta');
      }

      router.push(`/dashboard/credit-cards/${creditCard.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating credit card:', error);
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
      const response = await fetch(`/api/credit-cards/${creditCard.id}/initial-balance`, {
        method: 'POST',
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

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/credit-cards/${creditCard.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la tarjeta');
      }

      router.push('/dashboard/credit-cards');
      router.refresh();
    } catch (error) {
      console.error('Error deleting credit card:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'cutDay' || name === 'dueDay') ? parseInt(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la tarjeta *
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
          placeholder="Ej: Visa Principal, Mastercard Gold..."
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 mb-2">
          Límite de crédito *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            id="creditLimit"
            name="creditLimit"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.creditLimit}
            onChange={handleChange}
            className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.creditLimit ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.creditLimit && (
          <p className="mt-1 text-sm text-red-600">{errors.creditLimit}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="cutDay" className="block text-sm font-medium text-gray-700 mb-2">
            Día de corte *
          </label>
          <select
            id="cutDay"
            name="cutDay"
            required
            value={formData.cutDay}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cutDay ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                Día {day}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Día del mes en que se cierra el período de facturación
          </p>
          {errors.cutDay && (
            <p className="mt-1 text-sm text-red-600">{errors.cutDay}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDay" className="block text-sm font-medium text-gray-700 mb-2">
            Día de vencimiento *
          </label>
          <select
            id="dueDay"
            name="dueDay"
            required
            value={formData.dueDay}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.dueDay ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                Día {day}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Día límite para pagar la tarjeta
          </p>
          {errors.dueDay && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDay}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Tarjeta activa
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Las tarjetas inactivas no aparecerán en los formularios de transacciones
        </p>
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
              Puedes modificar el saldo inicial porque esta tarjeta no tiene movimientos registrados.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>${creditCard.initialBalance}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              No se puede modificar el saldo inicial porque esta tarjeta ya tiene movimientos registrados.
            </p>
          </div>
        )}
        {errors.initialBalance && (
          <p className="mt-1 text-sm text-red-600">{errors.initialBalance}</p>
        )}
      </div>

      {/* Current Balance Info */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Información actual</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>Saldo inicial:</strong> ${creditCard.initialBalance}</p>
          <p><strong>Saldo actual:</strong> ${creditCard.currentBalance}</p>
          <p><strong>Crédito disponible:</strong> ${(parseFloat(creditCard.creditLimit) - parseFloat(creditCard.currentBalance)).toFixed(2)}</p>
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ¿Eliminar tarjeta de crédito?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta tarjeta?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <div className="flex space-x-3">
          <Link href={`/dashboard/credit-cards/${creditCard.id}`}>
            <Button variant="outline" type="button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </Link>
          
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Actualizando...' : 'Actualizar tarjeta'}
        </Button>
      </div>
    </form>
  );
}