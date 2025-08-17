import { formatCurrency } from '@/lib/utils';
import { Wallet, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardStatsProps {
  totalCashBalance: number;
  cashAccountsCount: number;
  totalCreditBalance: number;
  creditCardsCount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export function DashboardStats({ totalCashBalance, cashAccountsCount, totalCreditBalance, creditCardsCount, monthlyIncome, monthlyExpenses }: DashboardStatsProps) {
  const generalStats = [
    {
      name: 'Balance Total en Efectivo',
      value: formatCurrency(totalCashBalance),
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Cuentas de Efectivo',
      value: cashAccountsCount.toString(),
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Tarjetas de Crédito',
      value: creditCardsCount.toString(),
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Saldo en Tarjetas',
      value: formatCurrency(totalCreditBalance),
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const monthlyStats = [
    {
      name: 'Ingresos del Mes',
      value: formatCurrency(monthlyIncome),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Gastos del Mes',
      value: formatCurrency(monthlyExpenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas Generales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {generalStats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas Mensuales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Mes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {monthlyStats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}