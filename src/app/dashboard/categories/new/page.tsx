import { CreateCategoryForm } from '@/components/categories/CreateCategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Categoría</h1>
        <p className="text-gray-600 mt-2">
          Agrega una nueva categoría para organizar tus ingresos y gastos
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CreateCategoryForm />
      </div>
    </div>
  );
}