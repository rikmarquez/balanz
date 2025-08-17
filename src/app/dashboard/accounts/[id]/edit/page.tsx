import { requireAuth } from '@/lib/auth';
import { getCashAccountById, hasTransactions } from '@/lib/services/cash-accounts';
import { EditCashAccountForm } from '@/components/cash-accounts/EditCashAccountForm';
import { notFound } from 'next/navigation';

interface EditAccountPageProps {
  params: {
    id: string;
  };
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const user = await requireAuth();
  const [account, accountHasTransactions] = await Promise.all([
    getCashAccountById(params.id, user.id),
    hasTransactions(params.id, user.id)
  ]);
  
  if (!account) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar Cuenta</h1>
        <p className="text-gray-600 mt-2">
          Modifica la información de tu cuenta: {account.name}
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EditCashAccountForm account={account} hasTransactions={accountHasTransactions} />
      </div>
    </div>
  );
}