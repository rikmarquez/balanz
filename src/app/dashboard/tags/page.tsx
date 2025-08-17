'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TagsList } from '@/components/tags/TagsList';
import { TagForm } from '@/components/tags/TagForm';

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        // El API devuelve un wrapper con success y data
        if (data.success && data.data && Array.isArray(data.data)) {
          setTags(data.data);
        } else if (Array.isArray(data)) {
          setTags(data);
        } else {
          setTags([]);
        }
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async (data: { name: string; color: string }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchTags();
        setShowForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear el tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      setError('Error de conexión al crear el tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTag = async (data: { name: string; color: string }) => {
    if (!editingTag) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchTags();
        setEditingTag(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al actualizar el tag');
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      setError('Error de conexión al actualizar el tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTags();
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTag(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600">Organiza tus transacciones con tags personalizados</p>
        </div>
        {!showForm && !editingTag && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Tag
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Crear Nuevo Tag</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <TagForm
            onSubmit={handleCreateTag}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {editingTag && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Editar Tag</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <TagForm
            tag={editingTag}
            onSubmit={handleUpdateTag}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <TagsList
          tags={tags}
          onEdit={handleEdit}
          onDelete={handleDeleteTag}
        />
      </div>
    </div>
  );
}