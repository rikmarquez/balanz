'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';
import { transfersService, AccountTransfer, transferTypeLabels } from '@/lib/services/transfers';
import { TransferForm } from '@/components/transfers/TransferForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function TransfersClientPage() {
  const [transfers, setTransfers] = useState<AccountTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<AccountTransfer | null>(null);

  const loadTransfers = async () => {
    setLoading(true);
    const response = await transfersService.getAll();

    if (response.success && response.data) {
      setTransfers(response.data);
      setError(null);
    } else {
      setError(response.error || 'Error al cargar transferencias');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTransfer(null);
    loadTransfers();
  };

  const handleEdit = (transfer: AccountTransfer) => {
    setEditingTransfer(transfer);
    setShowForm(true);
  };

  const handleDelete = async (transfer: AccountTransfer) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transferencia? Esta acción revertirá los cambios en los saldos de las cuentas.')) {
      return;
    }

    const response = await transfersService.delete(transfer.id);

    if (response.success) {
      loadTransfers();
    } else {
      alert('Error al eliminar la transferencia: ' + response.error);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-6">
        <TransferForm
          transfer={editingTransfer}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingTransfer(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ArrowLeftRight className="mr-2 h-6 w-6 text-blue-600" />
            Transferencias
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las transferencias entre tus cuentas
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Transferencia
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {transfers.length === 0 ? (
        <div className="text-center py-12">
          <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay transferencias</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primera transferencia entre cuentas.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Transferencia
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {transfers.map((transfer) => (
              <li key={transfer.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transfer.fromAccount?.name} → {transfer.toAccount?.name}
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {transferTypeLabels[transfer.transferType]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {transfer.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(transfer.transferDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(transfer.amount)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transfer)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transfer)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}