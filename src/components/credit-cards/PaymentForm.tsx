'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { CreditCard as CreditCardIcon, DollarSign, ArrowRight } from 'lucide-react';
import { CreditCard, CashAccount } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PaymentFormProps {
  creditCard: CreditCard;
  onPaymentSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ creditCard, onPaymentSuccess, onCancel }: PaymentFormProps) {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cardBalance = parseFloat(creditCard.currentBalance);
  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
  const accountBalance = selectedAccount ? parseFloat(selectedAccount.currentBalance) : 0;

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const paymentAmount = parseFloat(amount);
      
      // Validaciones del frontend
      if (!selectedAccountId) {
        setError('Debe seleccionar una cuenta de origen');
        setLoading(false);
        return;
      }

      if (paymentAmount <= 0) {
        setError('El monto debe ser mayor a 0');
        setLoading(false);
        return;
      }

      if (paymentAmount > accountBalance) {
        setError('Saldo insuficiente en la cuenta seleccionada');
        setLoading(false);
        return;
      }

      if (paymentAmount > cardBalance) {
        setError('El monto no puede ser mayor a la deuda de la tarjeta');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/credit-cards/${creditCard.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentAmount,
          accountId: selectedAccountId,
          description: creditCard.name
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onPaymentSuccess?.();
      } else {
        setError(result.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountPreset = (preset: 'min' | 'no_interest' | 'half' | 'full') => {
    switch (preset) {
      case 'min':
        const minPayment = Math.min(cardBalance * 0.05, cardBalance); // 5% o el saldo total si es menor
        setAmount(minPayment.toFixed(2));
        break;
      case 'no_interest':
        // Pago para no generar intereses: saldo total actual
        // Esto equivale al concepto de "pago para no generar intereses"
        setAmount(cardBalance.toFixed(2));
        break;
      case 'half':
        setAmount((cardBalance / 2).toFixed(2));
        break;
      case 'full':
        setAmount(cardBalance.toFixed(2));
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Realizar Pago a Tarjeta</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Transfiere dinero desde una cuenta de efectivo para pagar la deuda de tu tarjeta
        </p>
      </div>

      {/* Card Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">{creditCard.name}</h4>
              <p className="text-sm text-blue-700">Deuda actual</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(cardBalance)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Selection */}
        <div>
          <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
            Cuenta de Origen *
          </label>
          <select
            id="account"
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleccionar cuenta...</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} - {formatCurrency(parseFloat(account.currentBalance))}
              </option>
            ))}
          </select>
          {selectedAccount && (
            <p className="mt-2 text-sm text-gray-600">
              Saldo disponible: <span className="font-medium">{formatCurrency(accountBalance)}</span>
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Monto a Pagar *
          </label>
          <div className="space-y-3">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={Math.min(cardBalance, accountBalance)}
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-2 gap-2 md:flex md:space-x-2 md:grid-cols-none">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAmountPreset('min')}
                disabled={cardBalance <= 0}
                className="text-xs"
              >
                Pago Mínimo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAmountPreset('no_interest')}
                disabled={cardBalance <= 0}
                className="text-xs bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              >
                NO intereses
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAmountPreset('half')}
                disabled={cardBalance <= 0}
                className="text-xs"
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAmountPreset('full')}
                disabled={cardBalance <= 0}
                className="text-xs"
              >
                Pago Total
              </Button>
            </div>
          </div>
        </div>


        {/* Payment Summary */}
        {amount && selectedAccount && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Resumen del Pago</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto del pago:</span>
                <span className="font-medium">{formatCurrency(parseFloat(amount) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Desde cuenta:</span>
                <span className="font-medium">{selectedAccount.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nuevo saldo cuenta:</span>
                <span className="font-medium">
                  {formatCurrency(accountBalance - (parseFloat(amount) || 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nueva deuda tarjeta:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(cardBalance - (parseFloat(amount) || 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={loading || !amount || !selectedAccountId || cardBalance <= 0}
            className="flex-1"
          >
            {loading ? (
              'Procesando...'
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Procesar Pago
              </>
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}