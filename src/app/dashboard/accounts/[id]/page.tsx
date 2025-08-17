import { requireAuth } from '@/lib/auth';
import { getCashAccountById } from '@/lib/services/cash-accounts';
import { CashAccountDetail } from '@/components/cash-accounts/CashAccountDetail';
import { notFound } from 'next/navigation';

interface AccountDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const user = await requireAuth();
  const account = await getCashAccountById(params.id, user.id);
  
  if (!account) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CashAccountDetail account={account} />
    </div>
  );
}