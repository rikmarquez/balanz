import { requireAuth } from '@/lib/auth';
import { getCreditCardById } from '@/lib/services/credit-cards';
import { EditCreditCardForm } from '@/components/credit-cards/EditCreditCardForm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface EditCreditCardPageProps {
  params: {
    id: string;
  };
}

export default async function EditCreditCardPage({ params }: EditCreditCardPageProps) {
  const user = await requireAuth();
  const creditCard = await getCreditCardById(params.id, user.id);

  if (!creditCard) {
    notFound();
  }

  // Verificar si la tarjeta tiene transacciones
  const cardTransactions = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(and(
      eq(transactions.userId, user.id),
      eq(transactions.cardId, params.id)
    ))
    .limit(1);

  const hasTransactions = cardTransactions.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Editar Tarjeta de Crédito
        </h1>
        <p className="text-gray-600 mt-2">
          Modifica la información de tu tarjeta de crédito
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <EditCreditCardForm creditCard={creditCard} hasTransactions={hasTransactions} />
      </div>
    </div>
  );
}