'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#6B7280', '#059669', '#DC2626', '#7C3AED',
  '#0891B2', '#EA580C', '#65A30D', '#7C2D12', '#1F2937'
];

export function CreateCategoryForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/categories', {
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
        throw new Error(errorData.error || 'Error al crear la categoría');
      }

      router.push('/dashboard/categories');
      router.refresh();
    } catch (error) {
      console.error('Error creating category:', error);
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
          Nombre de la categoría *
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
          placeholder="Ej: Alimentación, Salario, etc."
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo *
        </label>
        <select
          id="type"
          name="type"
          required
          value={formData.type}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.type ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex items-center space-x-3">
          <input
            id="color"
            name="color"
            type="color"
            value={formData.color}
            onChange={handleChange}
            className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600">{formData.color}</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {defaultColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color }))}
              className={`w-8 h-8 rounded border-2 ${
                formData.color === color ? 'border-gray-900' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color}</p>
        )}
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Link href="/dashboard/categories">
          <Button variant="outline" type="button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  );
}