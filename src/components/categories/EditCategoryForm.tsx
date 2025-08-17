'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/types';

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#6B7280', '#059669', '#DC2626', '#7C3AED',
  '#0891B2', '#EA580C', '#65A30D', '#7C2D12', '#1F2937'
];

interface EditCategoryFormProps {
  category: Category;
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    type: category.type,
    color: category.color,
    isActive: category.isActive,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
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
        throw new Error(errorData.error || 'Error al actualizar la categoría');
      }

      router.push('/dashboard/categories');
      router.refresh();
    } catch (error) {
      console.error('Error updating category:', error);
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
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }

      router.push('/dashboard/categories');
      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
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
    <div className="space-y-6">
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
              value={formData.color || '#6B7280'}
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
            Categoría activa
          </label>
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
          
          <div className="flex items-center space-x-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la categoría &quot;{category.name}&quot;? 
              Esta acción no se puede deshacer y eliminará todas las transacciones asociadas.
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