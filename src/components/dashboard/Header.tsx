'use client';

import { signOut } from 'next-auth/react';
import { User } from '@/types';
import { Bell, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-4 md:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">
              Bienvenido, {user.name}
            </h1>
            <p className="text-sm text-gray-600">
              Gestiona tus finanzas personales
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}