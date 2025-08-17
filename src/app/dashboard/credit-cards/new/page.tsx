import { requireAuth } from '@/lib/auth';
import { CreateCreditCardForm } from '@/components/credit-cards/CreateCreditCardForm';

export default async function NewCreditCardPage() {
  await requireAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Nueva Tarjeta de Crédito
        </h1>
        <p className="text-gray-600 mt-2">
          Agrega una nueva tarjeta de crédito para controlar tus gastos y límites
        </p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CreateCreditCardForm />
      </div>
    </div>
  );
}