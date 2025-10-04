'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Database } from 'lucide-react';
import Link from 'next/link';

export default function MigratePaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ updated: number; message: string } | null>(null);
  const [error, setError] = useState('');

  const handleMigrate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate-card-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Error al migrar pagos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Migrar Pagos de Tarjeta</h1>
          <p className="text-gray-600 mt-1">
            Actualiza los pagos de tarjeta existentes para relacionarlos con sus tarjetas correspondientes
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">¿Qué hace esta migración?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Esta migración actualiza todas las transacciones de tipo &quot;transfer&quot; (pagos de tarjeta)
                que tienen la descripción &quot;Pago de tarjeta [nombre]&quot; pero no tienen un cardId asociado.
                Después de esta migración, los pagos de tarjeta aparecerán correctamente en la sección de
                &quot;Últimos Movimientos&quot; de cada tarjeta.
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={handleMigrate}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Migrando...' : 'Ejecutar Migración'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 font-medium">{result.message}</p>
              <p className="text-sm text-green-600 mt-1">
                Transacciones actualizadas: {result.updated}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
