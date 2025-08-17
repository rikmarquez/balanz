'use client';

import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Edit, Tag } from 'lucide-react';
import Link from 'next/link';

interface CategoriesListProps {
  categories: Category[];
}

export function CategoriesList({ categories }: CategoriesListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <Tag className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">No hay categorías</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: category.color || '#6B7280' }}
            />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href={`/dashboard/categories/${category.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}