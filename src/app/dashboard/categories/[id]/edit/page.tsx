import { requireAuth } from '@/lib/auth';
import { getCategoryById } from '@/lib/services/categories';
import { EditCategoryForm } from '@/components/categories/EditCategoryForm';
import { notFound } from 'next/navigation';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const user = await requireAuth();
  const category = await getCategoryById(params.id, user.id);
  
  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar Categoría</h1>
        <p className="text-gray-600 mt-2">
          Modifica la información de la categoría: {category.name}
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EditCategoryForm category={category as any} />
      </div>
    </div>
  );
}