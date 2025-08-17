import { requireAuth } from '@/lib/auth';
import { getCategories } from '@/lib/services/categories';
import { getCashAccounts } from '@/lib/services/cash-accounts';
import { getCreditCards } from '@/lib/services/credit-cards';
import { CreateTransactionForm } from '@/components/transactions/CreateTransactionForm';

interface NewTransactionPageProps {
  searchParams: {
    type?: 'income' | 'expense';
  };
}

export default async function NewTransactionPage({ searchParams }: NewTransactionPageProps) {
  const user = await requireAuth();
  const defaultType = searchParams.type || 'expense';

  const [categories, accounts, cards] = await Promise.all([
    getCategories(user.id, defaultType),
    getCashAccounts(user.id),
    getCreditCards(user.id),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Nueva Transacción - {defaultType === 'income' ? 'Ingreso' : 'Gasto'}
        </h1>
        <p className="text-gray-600 mt-2">
          Registra {defaultType === 'income' ? 'un nuevo ingreso' : 'un nuevo gasto'} en tu control financiero
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CreateTransactionForm 
          defaultType={defaultType}
          categories={categories as any}
          accounts={accounts}
          cards={cards}
        />
      </div>
    </div>
  );
}