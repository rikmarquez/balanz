'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { transfersService, AccountTransfer, CreateTransferData, transferTypeLabels } from '@/lib/services/transfers';
import { getCurrentLocalDate } from '@/utils/dateUtils';

interface CashAccount {
  id: string;
  name: string;
  currentBalance: string;
  isActive: boolean;
}

interface TransferFormProps {
  transfer?: AccountTransfer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransferForm({ transfer, onSuccess, onCancel }: TransferFormProps) {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [formData, setFormData] = useState<{
    fromAccountId: string;
    toAccountId: string;
    amount: string;
    transferDate: string;
    description: string;
    transferType: 'atm_withdrawal' | 'internal_transfer' | 'cash_deposit';
  }>({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    transferDate: getCurrentLocalDate(),
    description: '',
    transferType: 'internal_transfer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const isEditing = !!transfer;

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (transfer) {
      setFormData({
        fromAccountId: transfer.fromAccountId || '',
        toAccountId: transfer.toAccountId || '',
        amount: transfer.amount,
        transferDate: transfer.transferDate,
        description: transfer.description,
        transferType: transfer.transferType,
      });
    }
  }, [transfer]);

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        console.log('Accounts API response:', data);
        // La respuesta puede venir en data.data o directamente en data
        const accountsArray = data.data || data;
        console.log('Accounts array:', accountsArray);
        // Solo mostrar cuentas activas
        const activeAccounts = accountsArray.filter((account: CashAccount) => account.isActive);
        console.log('Active accounts:', activeAccounts);
        setAccounts(activeAccounts);
      } else {
        console.error('Error loading accounts - Response not OK:', response.status);
        setErrors({ ...errors, accounts: 'Error al cargar las cuentas' });
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      setErrors({ ...errors, accounts: 'Error de conexión al cargar las cuentas' });
    }
    setLoadingAccounts(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fromAccountId) {
      newErrors.fromAccountId = 'Selecciona una cuenta origen';
    }

    if (!formData.toAccountId) {
      newErrors.toAccountId = 'Selecciona una cuenta destino';
    }

    if (formData.fromAccountId === formData.toAccountId) {
      newErrors.toAccountId = 'La cuenta origen y destino no pueden ser la misma';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.transferDate) {
      newErrors.transferDate = 'Selecciona una fecha';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Ingresa una descripción';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const transferData: CreateTransferData = {
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      amount: parseFloat(formData.amount),
      transferDate: formData.transferDate,
      description: formData.description.trim(),
      transferType: formData.transferType,
    };

    const response = isEditing
      ? await transfersService.update(transfer!.id, transferData)
      : await transfersService.create(transferData);

    if (response.success) {
      onSuccess();
    } else {
      setErrors({ submit: response.error || 'Error al procesar la transferencia' });
    }

    setLoading(false);
  };

  const getFromAccountBalance = () => {
    const account = accounts.find(acc => acc.id === formData.fromAccountId);
    return account ? parseFloat(account.currentBalance) : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (loadingAccounts) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ArrowLeftRight className="mr-2 h-6 w-6 text-blue-600" />
          {isEditing ? 'Editar Transferencia' : 'Nueva Transferencia'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? 'Modifica los datos de la transferencia'
            : 'Transfiere dinero entre tus cuentas'
          }
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {errors.accounts && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.accounts}
            </div>
          )}

          {/* Tipo de transferencia */}
          <div>
            <label htmlFor="transferType" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de transferencia
            </label>
            <select
              id="transferType"
              value={formData.transferType}
              onChange={(e) => setFormData({
                ...formData,
                transferType: e.target.value as any,
                description: e.target.value === 'atm_withdrawal'
                  ? 'Retiro de cajero automático'
                  : e.target.value === 'cash_deposit'
                  ? 'Depósito en efectivo'
                  : ''
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(transferTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cuenta origen */}
            <div>
              <label htmlFor="fromAccountId" className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta origen
              </label>
              <select
                id="fromAccountId"
                value={formData.fromAccountId}
                onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fromAccountId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.length === 0 && !loadingAccounts && (
                  <option value="" disabled>No hay cuentas disponibles</option>
                )}
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(parseFloat(account.currentBalance))}
                  </option>
                ))}
              </select>
              {errors.fromAccountId && (
                <p className="mt-1 text-sm text-red-600">{errors.fromAccountId}</p>
              )}
              {formData.fromAccountId && (
                <p className="mt-1 text-xs text-gray-500">
                  Saldo disponible: {formatCurrency(getFromAccountBalance())}
                </p>
              )}
            </div>

            {/* Cuenta destino */}
            <div>
              <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta destino
              </label>
              <select
                id="toAccountId"
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.toAccountId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.length === 0 && !loadingAccounts && (
                  <option value="" disabled>No hay cuentas disponibles</option>
                )}
                {accounts
                  .filter(account => account.id !== formData.fromAccountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(parseFloat(account.currentBalance))}
                    </option>
                  ))}
              </select>
              {errors.toAccountId && (
                <p className="mt-1 text-sm text-red-600">{errors.toAccountId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monto */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Monto
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
              {formData.amount && parseFloat(formData.amount) > getFromAccountBalance() && (
                <p className="mt-1 text-sm text-red-600">
                  El monto excede el saldo disponible
                </p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                id="transferDate"
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.transferDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.transferDate && (
                <p className="mt-1 text-sm text-red-600">{errors.transferDate}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Retiro de cajero automático, Transferencia para gastos, etc."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-3 sm:space-y-0 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || parseFloat(formData.amount || '0') > getFromAccountBalance()}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Procesando...' : isEditing ? 'Actualizar Transferencia' : 'Crear Transferencia'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}