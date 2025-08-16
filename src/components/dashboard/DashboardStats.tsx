import { formatCurrency } from '@/lib/utils';
import { Wallet, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardStatsProps {
  totalCashBalance: number;
  cashAccountsCount: number;
}

export function DashboardStats({ totalCashBalance, cashAccountsCount }: DashboardStatsProps) {
  const stats = [
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
      value: '0',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Gastos del Mes',
      value: formatCurrency(0),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
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
  );
}