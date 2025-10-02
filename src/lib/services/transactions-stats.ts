import { db } from '../db';
import { transactions } from '../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { TransactionFilters } from './transactions';

// Función para obtener estadísticas con filtros aplicados
export async function getFilteredTransactionStats(
  userId: string,
  filters: TransactionFilters = {}
) {
  // Construir condiciones WHERE (mismo código que getFilteredTransactions)
  const conditions = [eq(transactions.userId, userId)];

  if (filters.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    conditions.push(sql`${transactions.categoryId} IN (${filters.categoryIds})`);
  }
  if (filters.paymentMethod) {
    conditions.push(eq(transactions.paymentMethod, filters.paymentMethod));
  }
  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters.accountId) {
    conditions.push(eq(transactions.accountId, filters.accountId));
  }
  if (filters.cardId) {
    conditions.push(eq(transactions.cardId, filters.cardId));
  }
  if (filters.searchText) {
    const searchPattern = `%${filters.searchText.toLowerCase()}%`;
    conditions.push(
      sql`(LOWER(${transactions.description}) LIKE ${searchPattern} OR LOWER(${transactions.notes}) LIKE ${searchPattern})`
    );
  }

  // Filtro por tipo de egreso
  if (filters.egressType) {
    if (filters.egressType === 'cash_only') {
      const egressCondition = and(
        eq(transactions.type, 'expense'),
        eq(transactions.paymentMethod, 'cash')
      );
      if (egressCondition) {
        conditions.push(egressCondition);
      }
    } else if (filters.egressType === 'transfers_only') {
      conditions.push(eq(transactions.type, 'transfer'));
    } else if (filters.egressType === 'all') {
      conditions.push(sql`(
        (${transactions.type} = 'expense' AND ${transactions.paymentMethod} = 'cash') OR
        (${transactions.type} = 'transfer')
      )`);
    }
  }

  // Calcular totales por tipo
  const result = await db
    .select({
      type: transactions.type,
      paymentMethod: transactions.paymentMethod,
      total: sql<string>`SUM(${transactions.amount})`,
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(transactions.type, transactions.paymentMethod);

  // Obtener el conteo total de transacciones con los mismos filtros
  const countResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(and(...conditions));

  // Obtener conteo de gastos para calcular "gastos por transacción"
  const expenseCountResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(and(...conditions, eq(transactions.type, 'expense')));

  const stats = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    totalEgresos: 0,
    cashFlow: 0,
    totalCount: countResult[0]?.count || 0,
    expenseCount: expenseCountResult[0]?.count || 0,
    periodDays: 0,
  };

  // Calcular totales
  result.forEach((row) => {
    const amount = parseFloat(row.total || '0');

    if (row.type === 'income') {
      stats.totalIncome += amount;
    } else if (row.type === 'expense') {
      stats.totalExpenses += amount;
      // Egresos = gastos en efectivo
      if (row.paymentMethod === 'cash') {
        stats.totalEgresos += amount;
      }
    } else if (row.type === 'transfer') {
      // Transferencias también son egresos (pagos de tarjeta)
      stats.totalEgresos += amount;
    }
  });

  // Balance = Ingresos - Gastos totales
  stats.balance = stats.totalIncome - stats.totalExpenses;

  // Flujo de efectivo = Ingresos - Egresos (efectivo + transferencias)
  stats.cashFlow = stats.totalIncome - stats.totalEgresos;

  // Calcular días del período
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    stats.periodDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  }

  // Si hay filtro por tags, necesitamos filtrar adicionalmente
  if (filters.tagIds && filters.tagIds.length > 0) {
    // Para tags, necesitamos recalcular porque involucra joins
    const { getTransactionsByTagIds } = await import('./tags');
    const transactionIdsWithTags = await getTransactionsByTagIds(filters.tagIds);

    if (transactionIdsWithTags.length === 0) {
      // Si no hay transacciones con esos tags, retornar stats vacías
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        totalEgresos: 0,
        cashFlow: 0,
        totalCount: 0,
        expenseCount: 0,
        periodDays: 0,
      };
    }

    // Agregar condición de IDs
    const idsString = transactionIdsWithTags.map(id => `'${id}'`).join(',');
    conditions.push(sql.raw(`${transactions.id.name} IN (${idsString})`));

    // Recalcular con la condición de tags
    const resultWithTags = await db
      .select({
        type: transactions.type,
        paymentMethod: transactions.paymentMethod,
        total: sql<string>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(transactions.type, transactions.paymentMethod);

    // Recalcular conteo con tags
    const countResultWithTags = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions));

    // Recalcular conteo de gastos con tags
    const expenseCountResultWithTags = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(and(...conditions, eq(transactions.type, 'expense')));

    // Resetear estadísticas
    stats.totalIncome = 0;
    stats.totalExpenses = 0;
    stats.totalEgresos = 0;
    stats.totalCount = countResultWithTags[0]?.count || 0;
    stats.expenseCount = expenseCountResultWithTags[0]?.count || 0;

    resultWithTags.forEach((row) => {
      const amount = parseFloat(row.total || '0');

      if (row.type === 'income') {
        stats.totalIncome += amount;
      } else if (row.type === 'expense') {
        stats.totalExpenses += amount;
        if (row.paymentMethod === 'cash') {
          stats.totalEgresos += amount;
        }
      } else if (row.type === 'transfer') {
        stats.totalEgresos += amount;
      }
    });

    stats.balance = stats.totalIncome - stats.totalExpenses;
    stats.cashFlow = stats.totalIncome - stats.totalEgresos;
  }

  return stats;
}
