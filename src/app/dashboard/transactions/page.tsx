import { requireAuth } from '@/lib/auth';
import { getTransactions } from '@/lib/services/transactions';
import { TransactionsClientPage } from './client-page';

export default async function TransactionsPage() {
  const user = await requireAuth();
  const transactions = await getTransactions(user.id, 50); // Limitar a 50 transacciones iniciales

  return <TransactionsClientPage initialTransactions={transactions} />;
}