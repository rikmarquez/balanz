import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { adjustCreditCardBalance } from '@/lib/services/credit-cards';

export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const { cardId, amount } = await request.json();
      
      if (!cardId || amount === undefined) {
        return errorResponse('cardId y amount son requeridos', 400);
      }

      // Ajustar el saldo de la tarjeta
      const result = await adjustCreditCardBalance(cardId, amount.toString(), user.id);
      
      return successResponse(result, `Saldo ajustado por $${amount}`);
    });
  } catch (error) {
    console.error('POST /api/admin/fix-balance error:', error);
    return errorResponse('Error al ajustar saldo', 500);
  }
}