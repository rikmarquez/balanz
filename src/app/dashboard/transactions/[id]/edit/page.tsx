import { requireAuth } from '@/lib/auth';
import { getCategories } from '@/lib/services/categories';
import { getCashAccounts } from '@/lib/services/cash-accounts';
import { getCreditCards } from '@/lib/services/credit-cards';
import { getTransactionById } from '@/lib/services/transactions';
import { EditTransactionForm } from '@/components/transactions/EditTransactionForm';
import { notFound } from 'next/navigation';

interface EditTransactionPageProps {
  params: {
    id: string;
  };
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const user = await requireAuth();
  
  // Get the transaction to edit
  const transaction = await getTransactionById(params.id, user.id);
  
  if (!transaction) {
    notFound();
  }

  // Get related data
  const [categories, accounts, cards] = await Promise.all([
    getCategories(user.id, transaction.type as 'income' | 'expense'),
    getCashAccounts(user.id),
    getCreditCards(user.id),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Editar Transacción
        </h1>
        <p className="text-gray-600 mt-2">
          Modifica los detalles de la transacción
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EditTransactionForm 
          transaction={transaction as any}
          categories={categories as any}
          accounts={accounts}
          cards={cards}
        />
      </div>
    </div>
  );
}