'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Settings,
  Tags,
  Hash
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cuentas', href: '/dashboard/accounts', icon: Wallet },
  { name: 'Tarjetas', href: '/dashboard/credit-cards', icon: CreditCard },
  { name: 'Transacciones', href: '/dashboard/transactions', icon: TrendingUp },
  { name: 'Categorías', href: '/dashboard/categories', icon: Tags },
  { name: 'Tags', href: '/dashboard/tags', icon: Hash },
  { name: 'Reportes', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Balanz</span>
          </div>
        </div>
        
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}