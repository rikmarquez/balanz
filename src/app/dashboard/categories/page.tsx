import { requireAuth } from '@/lib/auth';
import { getCategories } from '@/lib/services/categories';
import { CategoriesList } from '@/components/categories/CategoriesList';
import { Button } from '@/components/ui/Button';
import { Plus, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function CategoriesPage() {
  const user = await requireAuth();
  const categories = await getCategories(user.id);

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600">
            Gestiona las categorías para tus ingresos y gastos
          </p>
        </div>
        <Link href="/dashboard/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Categories */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">Ingresos</h2>
              <p className="text-sm text-gray-600">{incomeCategories.length} categorías</p>
            </div>
          </div>
          <CategoriesList categories={incomeCategories as any} />
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Tag className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">Gastos</h2>
              <p className="text-sm text-gray-600">{expenseCategories.length} categorías</p>
            </div>
          </div>
          <CategoriesList categories={expenseCategories as any} />
        </div>
      </div>
    </div>
  );
}