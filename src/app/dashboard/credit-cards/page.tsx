import { requireAuth } from '@/lib/auth';
import { getCreditCards } from '@/lib/services/credit-cards';
import { CreditCardsList } from '@/components/credit-cards/CreditCardsList';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default async function CreditCardsPage() {
  const user = await requireAuth();
  const creditCards = await getCreditCards(user.id);

  const totalBalance = creditCards.reduce((sum, card) => {
    return sum + parseFloat(card.currentBalance);
  }, 0);

  const totalLimit = creditCards.reduce((sum, card) => {
    return sum + parseFloat(card.creditLimit);
  }, 0);

  const totalAvailable = totalLimit - totalBalance;
  const utilizationPercentage = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header con título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tarjetas de Crédito</h1>
        <p className="text-gray-600">Gestiona tus tarjetas de crédito y controla tus límites</p>
      </div>

      {/* Métricas de resumen y botón */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Crédito Total</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalLimit)}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Deuda</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Crédito Disponible</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalAvailable)}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Tarjetas</p>
            <p className="text-xl font-bold text-purple-600">{creditCards.length}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Utilización</p>
            <p className="text-xl font-bold text-orange-600">{utilizationPercentage.toFixed(1)}%</p>
          </div>
        </div>
        <Link href="/dashboard/credit-cards/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarjeta
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <CreditCardsList creditCards={creditCards} />
      </div>
    </div>
  );
}