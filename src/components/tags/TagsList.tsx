'use client';

import { useState } from 'react';
import { Tag, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface TagsListProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
}

export function TagsList({ tags, onEdit, onDelete }: TagsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (tagId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este tag? Se removerá de todas las transacciones.')) {
      setDeletingId(tagId);
      try {
        await onDelete(tagId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tags</h3>
        <p className="text-gray-600 mb-6">
          Crea tu primer tag para organizar mejor tus transacciones
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="divide-y divide-gray-200">
        {tags.map((tag) => (
          <div key={tag.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{tag.name}</h3>
                <p className="text-sm text-gray-500">
                  Creado {new Date(tag.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(tag)}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(tag.id)}
                disabled={deletingId === tag.id}
                className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {deletingId === tag.id ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}