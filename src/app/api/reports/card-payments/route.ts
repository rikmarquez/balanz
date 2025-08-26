import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { db } from '@/lib/db';
import { transactions, creditCards, cashAccounts, categories } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, like } from 'drizzle-orm';

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

      // Buscar la categoría exacta "Pago de Tarjeta" que se crea automáticamente
      const paymentCategory = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(and(
          eq(categories.userId, user.id),
          eq(categories.name, 'Pago de Tarjeta'),
          eq(categories.type, 'expense')
        ))
        .limit(1);
      
      // Construir condiciones WHERE
      const whereConditions = [eq(transactions.userId, user.id)];
      
      if (paymentCategory.length > 0) {
        // Usar la categoría específica si existe
        whereConditions.push(eq(transactions.categoryId, paymentCategory[0].id));
      } else {
        // Fallback: buscar por descripción
        whereConditions.push(like(transactions.description, '%Pago de tarjeta%'));
      }
      
      if (startDate) {
        whereConditions.push(gte(transactions.date, startDate));
      }
      
      if (endDate) {
        whereConditions.push(lte(transactions.date, endDate));
      }


      // Consulta principal con joins
      const payments = await db
        .select({
          id: transactions.id,
          amount: transactions.amount,
          paymentDate: transactions.date,
          description: transactions.description,
          createdAt: transactions.createdAt,
          accountId: transactions.accountId,
          category: {
            name: categories.name
          }
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(and(...whereConditions))
        .orderBy(desc(transactions.date), desc(transactions.createdAt));

      // Obtener información completa de las cuentas para los pagos
      const paymentsWithDetails = await Promise.all(
        payments.map(async (payment) => {
          // Extraer nombre de tarjeta de la descripción usando diferentes patrones
          let cardName = 'Tarjeta desconocida';
          if (payment.description) {
            // Patrón principal: "Pago de tarjeta NombreTarjeta"
            const cardNameMatch = payment.description.match(/Pago de tarjeta (.+)$/);
            if (cardNameMatch) {
              cardName = cardNameMatch[1];
            } else if (payment.description.includes('Pago')) {
              // Si contiene "Pago" pero no sigue el patrón exacto
              cardName = payment.description.replace(/^.*Pago.*?(\w+).*$/i, '$1') || 'Tarjeta desconocida';
            }
          }
          
          // Obtener información de la cuenta de origen
          const account = payment.accountId ? await db
            .select({ 
              id: cashAccounts.id, 
              name: cashAccounts.name,
              currentBalance: cashAccounts.currentBalance 
            })
            .from(cashAccounts)
            .where(eq(cashAccounts.id, payment.accountId))
            .limit(1) : null;

          return {
            id: payment.id,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            description: payment.description,
            createdAt: payment.createdAt,
            card: {
              id: 'extracted-' + cardName.replace(/\s+/g, '-').toLowerCase(),
              name: cardName,
              creditLimit: '0',
              currentBalance: '0'
            },
            sourceAccount: {
              id: account?.[0]?.id || '',
              name: account?.[0]?.name || 'Cuenta desconocida'
            }
          };
        })
      );

      // Filtrar por tarjeta específica si se solicita
      let filteredPayments = paymentsWithDetails;
      if (cardId) {
        // Obtener nombre de la tarjeta seleccionada
        const selectedCard = await db
          .select({ name: creditCards.name })
          .from(creditCards)
          .where(eq(creditCards.id, cardId))
          .limit(1);
        
        console.log('🔍 Debug filtro tarjeta - cardId seleccionado:', cardId);
        console.log('🔍 Debug filtro tarjeta - tarjeta encontrada:', selectedCard[0]);
        console.log('🔍 Debug filtro tarjeta - nombres en pagos:', paymentsWithDetails.map(p => p.card.name));
        
        if (selectedCard[0]) {
          filteredPayments = paymentsWithDetails.filter(payment => {
            const match = payment.card.name === selectedCard[0].name;
            console.log(`🔍 Debug - "${payment.card.name}" === "${selectedCard[0].name}" = ${match}`);
            return match;
          });
          
          console.log('🔍 Debug - Pagos filtrados:', filteredPayments.length);
        }
      }

      // Calcular estadísticas usando los pagos filtrados
      const stats = {
        totalPayments: filteredPayments.length,
        totalAmount: filteredPayments.reduce((sum, payment) => {
          const amount = typeof payment.amount === 'string' ? 
            parseFloat(payment.amount) : payment.amount;
          return sum + Math.abs(amount || 0); // Usar valor absoluto ya que las transferencias son negativas
        }, 0),
        paymentsByCard: filteredPayments.reduce((acc, payment) => {
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
          acc[cardName].total += Math.abs(amount || 0); // Usar valor absoluto
          
          return acc;
        }, {} as Record<string, {
          count: number;
          total: number;
          cardId: string;
          cardName: string;
        }>),
        paymentsByAccount: filteredPayments.reduce((acc, payment) => {
          const accountName = payment.sourceAccount.name;
          const amount = typeof payment.amount === 'string' ? 
            parseFloat(payment.amount) : payment.amount;
          
          if (!acc[accountName]) {
            acc[accountName] = {
              count: 0,
              total: 0,
              accountId: payment.sourceAccount.id,
              accountName: accountName
            };
          }
          
          acc[accountName].count += 1;
          acc[accountName].total += Math.abs(amount || 0); // Usar valor absoluto
          
          return acc;
        }, {} as Record<string, {
          count: number;
          total: number;
          accountId: string;
          accountName: string;
        }>),
        dateRange: {
          firstPayment: filteredPayments.length > 0 ? filteredPayments[filteredPayments.length - 1].paymentDate : null,
          lastPayment: filteredPayments.length > 0 ? filteredPayments[0].paymentDate : null
        }
      };

      return successResponse({
        payments: filteredPayments,
        stats
      }, 'Pagos de tarjetas obtenidos exitosamente');
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('GET /api/reports/card-payments error:', error);
    return errorResponse('Error al obtener los pagos de tarjetas', 500);
  }
}