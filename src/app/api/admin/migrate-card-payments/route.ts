import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { db } from '@/lib/db';
import { transactions, creditCards } from '@/lib/db/schema';
import { eq, and, isNull, like, sql } from 'drizzle-orm';

/**
 * Endpoint temporal para migrar pagos de tarjeta existentes
 * Actualiza transacciones de tipo 'transfer' que tienen descripción "Pago de tarjeta"
 * pero no tienen cardId asociado
 */
export async function POST(request: NextRequest) {
  try {
    return await withAuth(request, async (user) => {
      // Obtener todas las tarjetas del usuario
      const userCards = await db
        .select()
        .from(creditCards)
        .where(eq(creditCards.userId, user.id));

      if (userCards.length === 0) {
        return successResponse({ updated: 0, message: 'No hay tarjetas para migrar' });
      }

      let totalUpdated = 0;

      // Para cada tarjeta, buscar transacciones de pago que coincidan
      for (const card of userCards) {
        const paymentDescription = `Pago de tarjeta ${card.name}`;

        // Buscar transacciones de tipo transfer con esta descripción que no tengan cardId
        const result = await db
          .update(transactions)
          .set({
            cardId: card.id,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(transactions.userId, user.id),
              eq(transactions.type, 'transfer'),
              like(transactions.description, paymentDescription),
              isNull(transactions.cardId)
            )
          )
          .returning({ id: transactions.id });

        totalUpdated += result.length;
      }

      return successResponse({
        updated: totalUpdated,
        message: `Se actualizaron ${totalUpdated} pagos de tarjeta exitosamente`
      });
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('POST /api/admin/migrate-card-payments error:', error);
    return errorResponse('Error al migrar pagos de tarjeta', 500);
  }
}
