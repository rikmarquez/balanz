import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { db } from '@/lib/db';
import { cardPayments, creditCards, cashAccounts } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const { searchParams } = new URL(request.url);
      
      // Parámetros de filtrado
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const cardId = searchParams.get('cardId');

      // Construir condiciones WHERE
      const whereConditions = [eq(cardPayments.userId, user.id)];
      
      if (startDate) {
        whereConditions.push(gte(cardPayments.paymentDate, startDate));
      }
      
      if (endDate) {
        whereConditions.push(lte(cardPayments.paymentDate, endDate));
      }
      
      if (cardId) {
        whereConditions.push(eq(cardPayments.cardId, cardId));
      }

      // Consulta principal con joins
      const payments = await db
        .select({
          id: cardPayments.id,
          amount: cardPayments.amount,
          paymentDate: cardPayments.paymentDate,
          description: cardPayments.description,
          createdAt: cardPayments.createdAt,
          card: {
            id: creditCards.id,
            name: creditCards.name,
            creditLimit: creditCards.creditLimit,
            currentBalance: creditCards.currentBalance
          },
          sourceAccount: {
            id: cashAccounts.id,
            name: cashAccounts.name
          }
        })
        .from(cardPayments)
        .innerJoin(creditCards, eq(cardPayments.cardId, creditCards.id))
        .innerJoin(cashAccounts, eq(cardPayments.sourceAccountId, cashAccounts.id))
        .where(and(...whereConditions))
        .orderBy(desc(cardPayments.paymentDate), desc(cardPayments.createdAt));

      // Calcular estadísticas
      const stats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, payment) => {
          const amount = typeof payment.amount === 'string' ? 
            parseFloat(payment.amount) : payment.amount;
          return sum + (amount || 0);
        }, 0),
        paymentsByCard: payments.reduce((acc, payment) => {
          const cardName = payment.card.name;
          const amount = typeof payment.amount === 'string' ? 
            parseFloat(payment.amount) : payment.amount;
          
          if (!acc[cardName]) {
            acc[cardName] = {
              count: 0,
              total: 0,
              cardId: payment.card.id,
              cardName: cardName
            };
          }
          
          acc[cardName].count += 1;
          acc[cardName].total += (amount || 0);
          
          return acc;
        }, {} as Record<string, {
          count: number;
          total: number;
          cardId: string;
          cardName: string;
        }>),
        dateRange: {
          firstPayment: payments.length > 0 ? payments[payments.length - 1].paymentDate : null,
          lastPayment: payments.length > 0 ? payments[0].paymentDate : null
        }
      };

      return successResponse({
        payments,
        stats
      }, 'Pagos de tarjetas obtenidos exitosamente');
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('GET /api/reports/card-payments error:', error);
    return errorResponse('Error al obtener los pagos de tarjetas', 500);
  }
}