import { requireAuth } from '@/lib/auth';
import { getCashAccounts } from '@/lib/services/cash-accounts';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default async function DashboardPage() {
  const user = await requireAuth();
  const cashAccounts = await getCashAccounts(user.id);

  const totalCashBalance = cashAccounts.reduce((sum, account) => {
    return sum + parseFloat(account.currentBalance);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Resumen de tu estado financiero actual
        </p>
      </div>

      <DashboardStats 
        totalCashBalance={totalCashBalance}
        cashAccountsCount={cashAccounts.length}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}