'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagFormProps {
  tag?: Tag;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DEFAULT_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6B7280', // gray
  '#1F2937', // gray-800
];

export function TagForm({ tag, onSubmit, onCancel, isLoading = false }: TagFormProps) {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || DEFAULT_COLORS[0]);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({ name: name.trim(), color });
    } catch (error) {
      console.error('Error submitting tag form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Tag
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${
            errors.name
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="Ej: Comida rápida, Trabajo, Personal..."
          maxLength={50}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Color del Tag
        </label>
        <div className="grid grid-cols-5 gap-3">
          {DEFAULT_COLORS.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              onClick={() => setColor(colorOption)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                color === colorOption
                  ? 'border-gray-900 scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: colorOption }}
              title={colorOption}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center space-x-2">
          <label htmlFor="custom-color" className="text-sm text-gray-600">
            Color personalizado:
          </label>
          <input
            type="color"
            id="custom-color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Guardando...' : (tag ? 'Actualizar Tag' : 'Crear Tag')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}