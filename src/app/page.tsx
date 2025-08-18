import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Balanz</h1>
            <p className="text-gray-600">Control de gastos personal</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700 mb-6">
              Gestiona tus finanzas personales de manera inteligente y sencilla
            </p>
            
            <div className="space-y-6">
              <Link href="/auth/signin">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Iniciar Sesión
                </button>
              </Link>
              
              <Link href="/auth/signin">
                <button className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium">
                  Crear Cuenta
                </button>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <div className="font-medium">✓ Múltiples cuentas</div>
                <div>✓ Tarjetas de crédito</div>
              </div>
              <div>
                <div className="font-medium">✓ Reportes detallados</div>
                <div>✓ Control total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}