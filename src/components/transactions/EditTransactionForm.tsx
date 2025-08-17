'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TagSelector } from '@/components/tags/TagSelector';
import { ArrowLeft, CreditCard, Wallet, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Category, CashAccount, CreditCard as CreditCardType, Transaction } from '@/types';

interface EditTransactionFormProps {
  transaction: Transaction;
  categories: Category[];
  accounts: CashAccount[];
  cards: CreditCardType[];
}

export function EditTransactionForm({ 
  transaction,
  categories, 
  accounts, 
  cards 
}: EditTransactionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    date: new Date(transaction.date).toISOString().split('T')[0],
    description: transaction.description,
    type: transaction.type,
    paymentMethod: transaction.paymentMethod,
    categoryId: transaction.categoryId || '',
    accountId: transaction.accountId || (accounts.length > 0 ? accounts[0].id : ''),
    cardId: transaction.cardId || (cards.length > 0 ? cards[0].id : ''),
    notes: transaction.notes || '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar tags existentes de la transacción
  useEffect(() => {
    const fetchTransactionTags = async () => {
      try {
        const response = await fetch(`/api/transactions/${transaction.id}/tags`);
        if (response.ok) {
          const tags = await response.json();
          setSelectedTagIds(tags.map((tag: any) => tag.id));
        }
      } catch (error) {
        console.error('Error fetching transaction tags:', error);
      }
    };

    fetchTransactionTags();
  }, [transaction.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Prepare data based on payment method
    const submitData = {
      ...formData,
      accountId: formData.paymentMethod === 'cash' ? formData.accountId : undefined,
      cardId: formData.paymentMethod === 'credit_card' ? formData.cardId : undefined,
      notes: formData.notes || undefined,
      tagIds: selectedTagIds,
    };

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
          return;
        }
        throw new Error(errorData.error || 'Error al actualizar la transacción');
      }

      router.push('/dashboard/transactions');
      router.refresh();
    } catch (error) {
      console.error('Error updating transaction:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la transacción');
      }

      router.push('/dashboard/transactions');
      router.refresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      categoryId: '' // Reset category when type changes
    }));
  };

  // Filter categories by current type
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de transacción *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
              formData.type === 'income'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-green-300'
            }`}
          >
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
              formData.type === 'expense'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 hover:border-red-300'
            }`}
          >
            Gasto
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Monto *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.amount}
              onChange={handleChange}
              className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe la transacción..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
          Categoría *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          value={formData.categoryId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.categoryId ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Selecciona una categoría</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
        )}
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Método de pago *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'cash' } } as any)}
            className={`p-3 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              formData.paymentMethod === 'cash'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Efectivo</span>
          </button>
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'credit_card' } } as any)}
            className={`p-3 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              formData.paymentMethod === 'credit_card'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Tarjeta</span>
          </button>
        </div>
      </div>

      {/* Account/Card Selection */}
      {formData.paymentMethod === 'cash' ? (
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
            Cuenta de efectivo *
          </label>
          <select
            id="accountId"
            name="accountId"
            required
            value={formData.accountId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.accountId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} - ${account.currentBalance}
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="cardId" className="block text-sm font-medium text-gray-700 mb-2">
            Tarjeta de crédito *
          </label>
          <select
            id="cardId"
            name="cardId"
            required
            value={formData.cardId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} - Disponible: ${(parseFloat(card.creditLimit) - parseFloat(card.currentBalance)).toFixed(2)}
              </option>
            ))}
          </select>
          {errors.cardId && (
            <p className="mt-1 text-sm text-red-600">{errors.cardId}</p>
          )}
        </div>
      )}

      <TagSelector
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
      />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.notes ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Información adicional sobre la transacción..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
        )}
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
              ¿Eliminar transacción?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta transacción?
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
          <Link href="/dashboard/transactions">
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
          {isLoading ? 'Actualizando...' : 'Actualizar transacción'}
        </Button>
      </div>
    </form>
  );
}