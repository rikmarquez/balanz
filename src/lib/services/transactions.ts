import { db } from '../db';
import { transactions, categories, cashAccounts, creditCards } from '../db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { getTagsByTransactionId, updateTransactionTags } from './tags';

export const CreateTransactionSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El monto debe ser un número válido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
  description: z.string().min(1, 'La descripción es requerida').max(255, 'La descripción no puede exceder 255 caracteres'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'El tipo debe ser "income" o "expense"' })
  }),
  paymentMethod: z.enum(['cash', 'credit_card'], {
    errorMap: () => ({ message: 'El método de pago debe ser "cash" o "credit_card"' })
  }),
  categoryId: z.string().uuid('El ID de categoría debe ser un UUID válido'),
  accountId: z.string().uuid('El ID de cuenta debe ser un UUID válido').optional(),
  cardId: z.string().uuid('El ID de tarjeta debe ser un UUID válido').optional(),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
  tagIds: z.array(z.string().uuid('El ID de tag debe ser un UUID válido')).optional(),
}).refine((data) => {
  if (data.paymentMethod === 'cash' && !data.accountId) {
    return false;
  }
  if (data.paymentMethod === 'credit_card' && !data.cardId) {
    return false;
  }
  return true;
}, {
  message: 'Debe especificar accountId para pagos en efectivo o cardId para pagos con tarjeta',
  path: ['paymentMethod']
});

export const UpdateTransactionSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El monto debe ser un número válido').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD').optional(),
  description: z.string().min(1, 'La descripción es requerida').max(255, 'La descripción no puede exceder 255 caracteres').optional(),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'El tipo debe ser "income" o "expense"' })
  }).optional(),
  paymentMethod: z.enum(['cash', 'credit_card'], {
    errorMap: () => ({ message: 'El método de pago debe ser "cash" o "credit_card"' })
  }).optional(),
  categoryId: z.string().uuid('El ID de categoría debe ser un UUID válido').optional(),
  accountId: z.string().uuid('El ID de cuenta debe ser un UUID válido').optional(),
  cardId: z.string().uuid('El ID de tarjeta debe ser un UUID válido').optional(),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().nullable(),
  tagIds: z.array(z.string().uuid('El ID de tag debe ser un UUID válido')).optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;

export async function getTransactions(userId: string, limit?: number) {
  const query = db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      type: transactions.type,
      paymentMethod: transactions.paymentMethod,
      notes: transactions.notes,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      category: {
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
      },
      account: {
        id: cashAccounts.id,
        name: cashAccounts.name,
      },
      card: {
        id: creditCards.id,
        name: creditCards.name,
      },
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(cashAccounts, eq(transactions.accountId, cashAccounts.id))
    .leftJoin(creditCards, eq(transactions.cardId, creditCards.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  if (limit) {
    query.limit(limit);
  }

  return await query;
}

export async function getTransactionById(id: string, userId: string) {
  const result = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      type: transactions.type,
      paymentMethod: transactions.paymentMethod,
      notes: transactions.notes,
      categoryId: transactions.categoryId,
      accountId: transactions.accountId,
      cardId: transactions.cardId,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      category: {
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
      },
      account: {
        id: cashAccounts.id,
        name: cashAccounts.name,
      },
      card: {
        id: creditCards.id,
        name: creditCards.name,
      },
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(cashAccounts, eq(transactions.accountId, cashAccounts.id))
    .leftJoin(creditCards, eq(transactions.cardId, creditCards.id))
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1);

  return result[0] || null;
}

export async function createTransaction(data: CreateTransactionInput, userId: string) {
  const validated = CreateTransactionSchema.parse(data);
  
  const result = await db
    .insert(transactions)
    .values({
      userId,
      amount: validated.amount,
      date: validated.date,
      description: validated.description,
      type: validated.type,
      paymentMethod: validated.paymentMethod,
      categoryId: validated.categoryId,
      accountId: validated.accountId || null,
      cardId: validated.cardId || null,
      notes: validated.notes || null,
    })
    .returning();

  const transaction = result[0];

  // Actualizar saldos automáticamente
  await updateBalancesOnTransaction(transaction, 'create', userId);

  // Agregar tags si se proporcionaron
  if (validated.tagIds && validated.tagIds.length > 0) {
    await updateTransactionTags(transaction.id, validated.tagIds);
  }

  return transaction;
}

export async function updateTransaction(id: string, data: UpdateTransactionInput, userId: string) {
  const validated = UpdateTransactionSchema.parse(data);
  
  // Obtener la transacción original para revertir sus efectos
  const originalTransaction = await getTransactionById(id, userId);
  if (!originalTransaction) {
    throw new Error('Transacción no encontrada');
  }
  
  // Extraer tagIds para manejo separado
  const { tagIds, ...transactionData } = validated;
  
  const result = await db
    .update(transactions)
    .set({
      ...transactionData,
      updatedAt: new Date(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();

  const transaction = result[0];
  
  if (transaction) {
    // Revertir los efectos de la transacción original
    await updateBalancesOnTransaction(originalTransaction, 'delete', userId);
    
    // Aplicar los efectos de la nueva transacción
    await updateBalancesOnTransaction(transaction, 'create', userId);
    
    // Actualizar tags si se proporcionaron
    if (tagIds !== undefined) {
      await updateTransactionTags(id, tagIds);
    }
  }

  return transaction;
}

export async function deleteTransaction(id: string, userId: string) {
  // Obtener la transacción antes de eliminarla para revertir sus efectos
  const transaction = await getTransactionById(id, userId);
  if (!transaction) {
    return null;
  }

  const result = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();

  const deletedTransaction = result[0];
  
  if (deletedTransaction) {
    // Revertir los efectos de la transacción eliminada
    await updateBalancesOnTransaction(transaction, 'delete', userId);
  }

  return deletedTransaction;
}

export async function getCurrentMonthStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  const result = await db
    .select({
      type: transactions.type,
      total: sql<string>`SUM(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .groupBy(transactions.type);

  const stats = {
    income: 0,
    expense: 0,
  };

  result.forEach((row) => {
    if (row.type === 'income') {
      stats.income = parseFloat(row.total || '0');
    } else if (row.type === 'expense') {
      stats.expense = parseFloat(row.total || '0');
    }
  });

  return stats;
}

export async function getTransactionWithTags(id: string, userId: string) {
  const transaction = await getTransactionById(id, userId);
  
  if (!transaction) {
    return null;
  }

  const tags = await getTagsByTransactionId(id);
  
  return {
    ...transaction,
    tags,
  };
}

// Función para actualizar saldos automáticamente en transacciones
async function updateBalancesOnTransaction(
  transaction: any, 
  action: 'create' | 'delete', 
  userId: string
) {
  const amount = parseFloat(transaction.amount);
  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';
  
  // Determinar el factor multiplicador según la acción
  const factor = action === 'create' ? 1 : -1;

  try {
    if (transaction.paymentMethod === 'cash' && transaction.accountId) {
      // Actualizar saldo de cuenta de efectivo
      const { adjustCashAccountBalance } = await import('./cash-accounts');
      
      let adjustmentAmount: number;
      if (isIncome) {
        // Los ingresos aumentan el saldo de la cuenta
        adjustmentAmount = amount * factor;
      } else {
        // Los gastos reducen el saldo de la cuenta
        adjustmentAmount = -amount * factor;
      }
      
      await adjustCashAccountBalance(
        transaction.accountId, 
        adjustmentAmount.toString(), 
        userId
      );
    } else if (transaction.paymentMethod === 'credit_card' && transaction.cardId) {
      // Actualizar saldo de tarjeta de crédito
      const { adjustCreditCardBalance } = await import('./credit-cards');
      
      let adjustmentAmount: number;
      if (isIncome) {
        // Los ingresos reducen la deuda de la tarjeta (pago hacia la tarjeta)
        adjustmentAmount = -amount * factor;
      } else {
        // Los gastos aumentan la deuda de la tarjeta
        adjustmentAmount = amount * factor;
      }
      
      await adjustCreditCardBalance(
        transaction.cardId, 
        adjustmentAmount.toString(), 
        userId
      );
    }
  } catch (error) {
    console.error('Error updating balances on transaction:', error);
    throw new Error('Error al actualizar saldos automáticamente');
  }
}

// Función para recalcular todos los saldos basándose en el historial de transacciones
export async function recalculateAllBalances(userId: string) {
  try {
    // Resetear todos los saldos a sus valores iniciales
    await resetBalancesToInitial(userId);
    
    // Obtener todas las transacciones ordenadas por fecha
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.date, transactions.createdAt);

    // Aplicar cada transacción en orden cronológico
    for (const transaction of allTransactions) {
      await updateBalancesOnTransaction(transaction, 'create', userId);
    }

    return {
      success: true,
      processedTransactions: allTransactions.length,
      message: `Se recalcularon los saldos basándose en ${allTransactions.length} transacciones`
    };
  } catch (error) {
    console.error('Error recalculating balances:', error);
    throw new Error('Error al recalcular saldos históricos');
  }
}

// Función auxiliar para resetear saldos a valores iniciales
async function resetBalancesToInitial(userId: string) {
  // Resetear cuentas de efectivo
  await db
    .update(cashAccounts)
    .set({
      currentBalance: sql`${cashAccounts.initialBalance}`,
      updatedAt: new Date()
    })
    .where(eq(cashAccounts.userId, userId));

  // Resetear tarjetas de crédito
  await db
    .update(creditCards)
    .set({
      currentBalance: sql`${creditCards.initialBalance}`,
      updatedAt: new Date()
    })
    .where(eq(creditCards.userId, userId));
}

// Interfaz para filtros de transacciones
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  tagIds?: string[];
  paymentMethod?: 'cash' | 'credit_card';
  type?: 'income' | 'expense';
  accountId?: string;
  cardId?: string;
  searchText?: string;
}

// Función para obtener transacciones con filtros
export async function getFilteredTransactions(
  userId: string, 
  filters: TransactionFilters = {},
  limit?: number
) {
  // Construir condiciones WHERE
  const conditions = [eq(transactions.userId, userId)];

  // Filtro por fecha
  if (filters.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }

  // Filtro por categorías
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    conditions.push(sql`${transactions.categoryId} IN ${filters.categoryIds}`);
  }

  // Filtro por método de pago
  if (filters.paymentMethod) {
    conditions.push(eq(transactions.paymentMethod, filters.paymentMethod));
  }

  // Filtro por tipo
  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type));
  }

  // Filtro por cuenta específica
  if (filters.accountId) {
    conditions.push(eq(transactions.accountId, filters.accountId));
  }

  // Filtro por tarjeta específica
  if (filters.cardId) {
    conditions.push(eq(transactions.cardId, filters.cardId));
  }

  // Filtro por texto (buscar en descripción y notas)
  if (filters.searchText) {
    const searchPattern = `%${filters.searchText.toLowerCase()}%`;
    conditions.push(
      sql`(LOWER(${transactions.description}) LIKE ${searchPattern} OR LOWER(${transactions.notes}) LIKE ${searchPattern})`
    );
  }

  const baseQuery = db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      type: transactions.type,
      paymentMethod: transactions.paymentMethod,
      notes: transactions.notes,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      category: {
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
      },
      account: {
        id: cashAccounts.id,
        name: cashAccounts.name,
      },
      card: {
        id: creditCards.id,
        name: creditCards.name,
      },
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(cashAccounts, eq(transactions.accountId, cashAccounts.id))
    .leftJoin(creditCards, eq(transactions.cardId, creditCards.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  // Aplicar límite si se especifica
  const finalQuery = limit ? baseQuery.limit(limit) : baseQuery;
  const results = await finalQuery;

  // Si hay filtro por tags, filtrar los resultados
  if (filters.tagIds && filters.tagIds.length > 0) {
    const { getTransactionsByTagIds } = await import('./tags');
    const transactionIdsWithTags = await getTransactionsByTagIds(filters.tagIds);
    
    return results.filter(transaction => 
      transactionIdsWithTags.includes(transaction.id)
    );
  }

  return results;
}

// Función para obtener estadísticas por cuenta específica
export async function getAccountStats(accountId: string, userId: string) {
  const result = await db
    .select({
      type: transactions.type,
      total: sql<string>`SUM(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.accountId, accountId),
        eq(transactions.paymentMethod, 'cash')
      )
    )
    .groupBy(transactions.type);

  const stats = {
    income: 0,
    expense: 0,
  };

  result.forEach((row) => {
    if (row.type === 'income') {
      stats.income = parseFloat(row.total || '0');
    } else if (row.type === 'expense') {
      stats.expense = parseFloat(row.total || '0');
    }
  });

  return stats;
}