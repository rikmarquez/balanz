'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Edit, CreditCard, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { CreditCard as CreditCardType } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CreditCardsListProps {
  creditCards: CreditCardType[];
}

export function CreditCardsList({ creditCards }: CreditCardsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (cardId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarjeta? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(cardId);

    try {
      const response = await fetch(`/api/credit-cards/${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la tarjeta');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting credit card:', error);
      alert('Error al eliminar la tarjeta');
    } finally {
      setDeletingId(null);
    }
  };

  const getAvailableCredit = (card: CreditCardType) => {
    const creditLimit = parseFloat(card.creditLimit);
    const currentBalance = parseFloat(card.currentBalance);
    return creditLimit - currentBalance;
  };

  const getUtilizationPercentage = (card: CreditCardType) => {
    const creditLimit = parseFloat(card.creditLimit);
    const currentBalance = parseFloat(card.currentBalance);
    return creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;
  };

  if (creditCards.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes tarjetas de crédito</h3>
        <p className="text-gray-600 mb-4">Agrega tu primera tarjeta para comenzar a controlar tus gastos</p>
        <Link href="/dashboard/credit-cards/new">
          <Button>Agregar Tarjeta</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {creditCards.map((card) => {
        const availableCredit = getAvailableCredit(card);
        const utilizationPercentage = getUtilizationPercentage(card);

        return (
          <div
            key={card.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header with name and actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {card.name}
                </h3>
              </div>

              <div className="flex space-x-1">
                <Link href={`/dashboard/credit-cards/${card.id}/edit`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(card.id)}
                  disabled={deletingId === card.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Credit Information */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Límite:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {formatCurrency(parseFloat(card.creditLimit))}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Utilizado:</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(parseFloat(card.currentBalance))}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Disponible:</span>
                <span className={`text-lg font-bold ${availableCredit < parseFloat(card.creditLimit) * 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(availableCredit)}
                </span>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="mt-4 space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    utilizationPercentage > 80 ? 'bg-red-500' :
                    utilizationPercentage > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                Utilización: {utilizationPercentage.toFixed(1)}%
              </div>
            </div>

            {/* Footer with payment info and actions */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <div className="flex space-x-4 text-xs text-gray-600">
                  <span>Corte: {card.cutDay}</span>
                  <span>Vence: {card.dueDay}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  card.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {card.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <Link href={`/dashboard/credit-cards/${card.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}