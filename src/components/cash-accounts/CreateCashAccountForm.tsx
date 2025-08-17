'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function CreateCashAccountForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    initialBalance: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/accounts', {
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
        throw new Error(errorData.error || 'Error al crear la cuenta');
      }

      router.push('/dashboard/accounts');
      router.refresh();
    } catch (error) {
      console.error('Error creating account:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      <div>
        <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700 mb-2">
          Balance inicial *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            id="initialBalance"
            name="initialBalance"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.initialBalance}
            onChange={handleChange}
            className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.initialBalance ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.initialBalance && (
          <p className="mt-1 text-sm text-red-600">{errors.initialBalance}</p>
        )}
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
          {isLoading ? 'Creando...' : 'Crear cuenta'}
        </Button>
      </div>
    </form>
  );
}