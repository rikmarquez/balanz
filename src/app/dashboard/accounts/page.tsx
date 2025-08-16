import { requireAuth } from '@/lib/auth';
import { getCashAccounts } from '@/lib/services/cash-accounts';
import { CashAccountsList } from '@/components/cash-accounts/CashAccountsList';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function AccountsPage() {
  const user = await requireAuth();
  const accounts = await getCashAccounts(user.id);

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.currentBalance);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuentas de Efectivo</h1>
          <p className="text-gray-600">
            Balance total: <span className="font-semibold text-green-600">${totalBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <Link href="/dashboard/accounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </Link>
      </div>

      <CashAccountsList accounts={accounts} />
    </div>
  );
}