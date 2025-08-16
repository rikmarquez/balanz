'use client';

import { UserButton } from '@clerk/nextjs';
import { User } from '@/types';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
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
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}