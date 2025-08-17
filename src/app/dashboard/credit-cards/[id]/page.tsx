import { requireAuth } from '@/lib/auth';
import { getCreditCardById } from '@/lib/services/credit-cards';
import { CreditCardDetailClientPage } from './client-page';
import { notFound } from 'next/navigation';

interface CreditCardDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CreditCardDetailPage({ params }: CreditCardDetailPageProps) {
  const user = await requireAuth();
  const creditCard = await getCreditCardById(params.id, user.id);

  if (!creditCard) {
    notFound();
  }

  return <CreditCardDetailClientPage initialCreditCard={creditCard} />;
}