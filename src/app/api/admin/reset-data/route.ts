import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { db } from '@/lib/db';
import { 
  transactions, 
  transactionTags, 
  cardPayments, 
  balanceAdjustments,
  adjustments,
  cashAccounts,
  creditCards
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      // Confirmar que el usuario realmente quiere hacer esto
      const body = await request.json();
      if (body.confirm !== 'RESET_TRANSACTIONS') {
        return errorResponse('Confirmación requerida para eliminar las transacciones', 400);
      }

      try {
        // 1. Obtener IDs de transacciones del usuario
        const userTransactions = await db
          .select({ id: transactions.id })
          .from(transactions)
          .where(eq(transactions.userId, user.id));

        const transactionIds = userTransactions.map(t => t.id);

        // 2. Eliminar relaciones de tags si hay transacciones
        if (transactionIds.length > 0) {
          await db.delete(transactionTags).where(
            eq(transactionTags.transactionId, transactionIds[0]) // Esto eliminará todas las relaciones
          );
          // Para eliminar todas, necesitamos hacer un loop o usar raw SQL
          for (const txId of transactionIds) {
            await db.delete(transactionTags).where(eq(transactionTags.transactionId, txId));
          }
        }
        
        // 3. Eliminar todas las transacciones
        await db.delete(transactions).where(eq(transactions.userId, user.id));

        // 4. Eliminar pagos de tarjetas
        await db.delete(cardPayments).where(eq(cardPayments.userId, user.id));

        // 5. Eliminar ajustes de balance
        await db.delete(balanceAdjustments).where(eq(balanceAdjustments.userId, user.id));
        
        // 6. Eliminar ajustes manuales
        await db.delete(adjustments).where(eq(adjustments.userId, user.id));

        // 7. Obtener cuentas y resetear saldos
        const userAccounts = await db
          .select()
          .from(cashAccounts)
          .where(eq(cashAccounts.userId, user.id));

        console.log('Resetting accounts:', userAccounts.length);
        for (const account of userAccounts) {
          console.log(`Account ${account.name}: ${account.currentBalance} -> ${account.initialBalance}`);
          await db.update(cashAccounts)
            .set({ 
              currentBalance: account.initialBalance,
              updatedAt: new Date()
            })
            .where(eq(cashAccounts.id, account.id));
        }

        // 8. Obtener tarjetas y resetear saldos
        const userCards = await db
          .select()
          .from(creditCards)
          .where(eq(creditCards.userId, user.id));

        console.log('Resetting credit cards:', userCards.length);
        for (const card of userCards) {
          console.log(`Card ${card.name}: ${card.currentBalance} -> ${card.initialBalance}`);
          await db.update(creditCards)
            .set({ 
              currentBalance: card.initialBalance,
              updatedAt: new Date()
            })
            .where(eq(creditCards.id, card.id));
        }

        return successResponse(
          { 
            message: 'Todas las transacciones han sido eliminadas y los saldos han sido restaurados a los valores iniciales',
            deletedTransactions: transactionIds.length,
            deletedPayments: 'Todos los pagos de tarjetas',
            resetAccounts: userAccounts.length,
            resetCards: userCards.length
          },
          'Reset de transacciones realizado exitosamente'
        );

      } catch (dbError) {
        console.error('Error during data reset:', dbError);
        return errorResponse('Error al eliminar los datos', 500);
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('POST /api/admin/reset-data error:', error);
    return errorResponse('Error interno del servidor', 500);
  }
}