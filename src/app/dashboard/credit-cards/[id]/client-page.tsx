'use client';

import { useState, useEffect } from 'react';
import { CreditCardDetail } from '@/components/credit-cards/CreditCardDetail';
import { CreditCard } from '@/types';
import { useRouter } from 'next/navigation';

interface CreditCardDetailClientPageProps {
  initialCreditCard: CreditCard;
}

export function CreditCardDetailClientPage({ initialCreditCard }: CreditCardDetailClientPageProps) {
  const [creditCard, setCreditCard] = useState<CreditCard>(initialCreditCard);
  const router = useRouter();

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/credit-cards/${creditCard.id}`);
      if (response.ok) {
        const result = await response.json();
        setCreditCard(result.data);
      }
    } catch (error) {
      console.error('Error refreshing credit card data:', error);
      // Refresh the page as fallback
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <CreditCardDetail creditCard={creditCard} onUpdate={handleUpdate} />
    </div>
  );
}