import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      name: 'Registrar Ingreso',
      href: '/dashboard/transactions/new?type=income',
      icon: TrendingUp,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Registrar Gasto',
      href: '/dashboard/transactions/new?type=expense',
      icon: TrendingDown,
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      name: 'Nueva Cuenta',
      href: '/dashboard/accounts/new',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Nueva Tarjeta',
      href: '/dashboard/credit-cards/new',
      icon: CreditCard,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
      
      <div className="space-y-4">
        {actions.map((action) => (
          <Link key={action.name} href={action.href}>
            <Button 
              className={`w-full justify-start ${action.color}`}
              variant="default"
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}