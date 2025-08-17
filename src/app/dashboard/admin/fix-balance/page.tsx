'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface CreditCard {
  id: string;
  name: string;
  currentBalance: string;
}

export default function FixBalancePage() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await fetch('/api/credit-cards');
      if (response.ok) {
        const data = await response.json();
        setCards(data.data || []);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleFixBalance = async () => {
    if (!selectedCardId || !amount) {
      setMessage('Selecciona una tarjeta y especifica el monto');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/fix-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: selectedCardId,
          amount: parseFloat(amount)
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setAmount('');
        setSelectedCardId('');
        await loadCards(); // Recargar tarjetas para ver el cambio
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error fixing balance:', error);
      setMessage('❌ Error al ajustar saldo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h1 className="text-xl font-bold text-yellow-800 mb-2">
          🛠️ Herramienta de Emergencia - Ajustar Saldos
        </h1>
        <p className="text-yellow-700 text-sm">
          Usa esta herramienta solo para corregir inconsistencias en los saldos de las tarjetas.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarjeta de Crédito
          </label>
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tarjeta...</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} - Saldo actual: ${card.currentBalance}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto a Agregar/Quitar
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej: 5000 (para agregar) o -1000 (para quitar)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-600 mt-1">
            Números positivos agregan saldo, negativos lo reducen
          </p>
        </div>

        <Button
          onClick={handleFixBalance}
          disabled={loading || !selectedCardId || !amount}
          className="w-full"
        >
          {loading ? 'Procesando...' : 'Ajustar Saldo'}
        </Button>

        {message && (
          <div className="p-3 rounded-md bg-gray-50 border">
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Esta página es solo para emergencias. Elimínala después de usar.
      </div>
    </div>
  );
}