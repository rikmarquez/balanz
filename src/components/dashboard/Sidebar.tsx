'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMobileMenu } from './MobileMenuProvider';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Settings,
  Tags,
  Hash,
  X
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
  const { isOpen, close } = useMobileMenu();

  const handleLinkClick = () => {
    close(); // Cerrar el menú móvil al navegar
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <Image
                src="/balanz-solo.png"
                alt="Balanz Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
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

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 flex z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={close}
          />
          
          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={close}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="flex items-center">
                  <Image
                    src="/balanz-solo.png"
                    alt="Balanz Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="ml-2 text-xl font-bold text-gray-900">Balanz</span>
                </div>
              </div>
              
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleLinkClick}
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
      )}
    </>
  );
}