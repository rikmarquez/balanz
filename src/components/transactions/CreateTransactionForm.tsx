'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TagSelector } from '@/components/tags/TagSelector';
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Category, CashAccount, CreditCard as CreditCardType } from '@/types';

interface CreateTransactionFormProps {
  defaultType: 'income' | 'expense';
  categories: Category[];
  accounts: CashAccount[];
  cards: CreditCardType[];
}

export function CreateTransactionForm({ 
  defaultType, 
  categories, 
  accounts, 
  cards 
}: CreateTransactionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    description: '',
    type: defaultType,
    paymentMethod: 'cash' as 'cash' | 'credit_card',
    categoryId: '',
    accountId: accounts.length > 0 ? accounts[0].id : '',
    cardId: cards.length > 0 ? cards[0].id : '',
    notes: '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Error al crear la transacción');
      }

      router.push('/dashboard/transactions');
      router.refresh();
    } catch (error) {
      console.error('Error creating transaction:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsLoading(false);
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

      <div className="flex items-center justify-between pt-4">
        <Link href="/dashboard/transactions">
          <Button variant="outline" type="button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear transacción'}
        </Button>
      </div>
    </form>
  );
}