import { Clock } from 'lucide-react';

export function RecentTransactions() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h2>
        <button className="text-sm text-blue-600 hover:text-blue-500">
          Ver todas
        </button>
      </div>
      
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
        <p className="text-gray-600">
          Las transacciones recientes aparecerán aquí
        </p>
      </div>
    </div>
  );
}