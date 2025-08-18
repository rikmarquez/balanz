'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Edit, CreditCard, Trash2, Eye } from 'lucide-react';
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
    <div className="divide-y divide-gray-200">
      {creditCards.map((card) => {
        const availableCredit = getAvailableCredit(card);
        const utilizationPercentage = getUtilizationPercentage(card);
        
        return (
          <div
            key={card.id}
            className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
          >
            {/* Mobile-first layout */}
            <div className="space-y-4">
              {/* Header with name and actions */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Card Icon */}
                  <div className="p-2 md:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  
                  {/* Name and status */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 truncate">
                      {card.name}
                    </h3>
                    {!card.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions - positioned at top right */}
                <div className="flex space-x-1 flex-shrink-0">
                  <Link href={`/dashboard/credit-cards/${card.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/credit-cards/${card.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(card.id)}
                    disabled={deletingId === card.id}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Credit Information - Mobile optimized */}
              <div className="space-y-3">
                {/* Límite y Utilizado */}
                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Límite:</span> {formatCurrency(parseFloat(card.creditLimit))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Utilizado:</span> {formatCurrency(parseFloat(card.currentBalance))}
                  </div>
                </div>

                {/* Disponible - moved below title as requested */}
                <div className="text-sm">
                  <div className="font-medium text-gray-600">Disponible:</div>
                  <div className={`text-lg font-semibold ${availableCredit < parseFloat(card.creditLimit) * 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(availableCredit)}
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="space-y-1">
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
                  <div className="text-xs text-gray-500">
                    Utilización: {utilizationPercentage.toFixed(1)}%
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-1 sm:space-y-0 text-sm text-gray-600">
                  <span>
                    <span className="font-medium">Corte:</span> Día {card.cutDay}
                  </span>
                  <span>
                    <span className="font-medium">Vencimiento:</span> Día {card.dueDay}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}