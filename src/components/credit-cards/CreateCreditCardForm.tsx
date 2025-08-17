'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function CreateCreditCardForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    creditLimit: '',
    initialBalance: '0',
    cutDay: 1,
    dueDay: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/credit-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
          return;
        }
        throw new Error(errorData.error || 'Error al crear la tarjeta');
      }

      router.push('/dashboard/credit-cards');
      router.refresh();
    } catch (error) {
      console.error('Error creating credit card:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cutDay' || name === 'dueDay' ? parseInt(value) : value
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

      <div className="grid gap-6 md:grid-cols-2">
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

        <div>
          <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700 mb-2">
            Saldo inicial usado
          </label>
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
          <p className="mt-1 text-sm text-gray-500">
            Si ya tienes saldo utilizado en esta tarjeta
          </p>
          {errors.initialBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.initialBalance}</p>
          )}
        </div>
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

      {errors.submit && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Link href="/dashboard/credit-cards">
          <Button variant="outline" type="button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear tarjeta'}
        </Button>
      </div>
    </form>
  );
}