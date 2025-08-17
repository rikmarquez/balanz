import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api/response';
import { getCreditCardById, updateCreditCard } from '@/lib/services/credit-cards';
import { z } from 'zod';

interface RouteContext {
  params: { id: string };
}

const InitialBalanceSchema = z.object({
  initialBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El saldo inicial debe ser un número válido'),
});

export async function POST(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const { initialBalance } = InitialBalanceSchema.parse(body);
        
        // Verificar que la tarjeta existe y pertenece al usuario
        const creditCard = await getCreditCardById(params.id, user.id);
        if (!creditCard) {
          return notFoundResponse('Tarjeta de crédito');
        }

        // Actualizar el saldo inicial y actual
        const updatedCard = await updateCreditCard(params.id, {
          // También actualizar el currentBalance al nuevo initialBalance
          currentBalance: initialBalance
        }, user.id);

        if (!updatedCard) {
          return errorResponse('Error al actualizar el saldo inicial', 500);
        }

        // Actualizar específicamente el initialBalance usando una consulta directa
        const { db } = await import('@/lib/db');
        const { creditCards } = await import('@/lib/db/schema');
        const { eq, and } = await import('drizzle-orm');

        await db.update(creditCards)
          .set({ 
            initialBalance,
            currentBalance: initialBalance,
            updatedAt: new Date()
          })
          .where(and(eq(creditCards.id, params.id), eq(creditCards.userId, user.id)));

        return successResponse(
          { ...updatedCard, initialBalance, currentBalance: initialBalance },
          'Saldo inicial actualizado exitosamente'
        );
      } catch (error) {
        if (error instanceof z.ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`POST /api/credit-cards/${params.id}/initial-balance error:`, error);
    return errorResponse('Error al actualizar el saldo inicial', 500);
  }
}