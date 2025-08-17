import { CreateCashAccountForm } from '@/components/cash-accounts/CreateCashAccountForm';

export default function NewAccountPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Cuenta</h1>
        <p className="text-gray-600 mt-2">
          Agrega una nueva cuenta de efectivo para gestionar tus finanzas
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CreateCashAccountForm />
      </div>
    </div>
  );
}