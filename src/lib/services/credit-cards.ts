import { db } from '../db';
import { creditCards } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export const CreateCreditCardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  creditLimit: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El límite debe ser un número válido'),
  initialBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El balance inicial debe ser un número válido').optional().default('0'),
  cutDay: z.number().min(1, 'El día de corte debe estar entre 1 y 31').max(31, 'El día de corte debe estar entre 1 y 31'),
  dueDay: z.number().min(1, 'El día de vencimiento debe estar entre 1 y 31').max(31, 'El día de vencimiento debe estar entre 1 y 31'),
});

export const UpdateCreditCardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres').optional(),
  creditLimit: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El límite debe ser un número válido').optional(),
  currentBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El balance actual debe ser un número válido').optional(),
  initialBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El balance inicial debe ser un número válido').optional(),
  cutDay: z.number().min(1, 'El día de corte debe estar entre 1 y 31').max(31, 'El día de corte debe estar entre 1 y 31').optional(),
  dueDay: z.number().min(1, 'El día de vencimiento debe estar entre 1 y 31').max(31, 'El día de vencimiento debe estar entre 1 y 31').optional(),
  isActive: z.boolean().optional(),
});

export type CreateCreditCardInput = z.infer<typeof CreateCreditCardSchema>;
export type UpdateCreditCardInput = z.infer<typeof UpdateCreditCardSchema>;

export async function getCreditCards(userId: string) {
  return await db
    .select()
    .from(creditCards)
    .where(eq(creditCards.userId, userId))
    .orderBy(creditCards.name);
}

export async function getCreditCardById(id: string, userId: string) {
  const result = await db
    .select()
    .from(creditCards)
    .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
    .limit(1);

  return result[0] || null;
}

export async function createCreditCard(data: CreateCreditCardInput, userId: string) {
  const validated = CreateCreditCardSchema.parse(data);
  
  const result = await db
    .insert(creditCards)
    .values({
      userId,
      name: validated.name,
      creditLimit: validated.creditLimit,
      initialBalance: validated.initialBalance || '0',
      currentBalance: validated.initialBalance || '0',
      cutDay: validated.cutDay,
      dueDay: validated.dueDay,
    })
    .returning();

  return result[0];
}

export async function updateCreditCard(id: string, data: UpdateCreditCardInput, userId: string) {
  const validated = UpdateCreditCardSchema.parse(data);
  
  const result = await db
    .update(creditCards)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
    .returning();

  return result[0] || null;
}

export async function deleteCreditCard(id: string, userId: string) {
  const result = await db
    .delete(creditCards)
    .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
    .returning();

  return result[0] || null;
}

export async function adjustCreditCardBalance(id: string, amount: string, userId: string) {
  const card = await getCreditCardById(id, userId);
  
  if (!card) {
    throw new Error('Tarjeta no encontrada');
  }

  const currentBalance = parseFloat(card.currentBalance);
  const adjustmentAmount = parseFloat(amount);
  const newBalance = (currentBalance + adjustmentAmount).toFixed(2);

  const result = await db
    .update(creditCards)
    .set({
      currentBalance: newBalance,
      updatedAt: new Date(),
    })
    .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
    .returning();

  return result[0];
}

interface PaymentData {
  amount: number;
  accountId: string;
  description?: string;
}

interface PaymentResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function processCreditCardPayment(
  cardId: string, 
  paymentData: PaymentData, 
  userId: string
): Promise<PaymentResult> {
  const { adjustCashAccountBalance } = await import('./cash-accounts');
  
  try {
    // Verificar que la tarjeta existe
    const card = await getCreditCardById(cardId, userId);
    if (!card) {
      return { success: false, error: 'Tarjeta no encontrada' };
    }

    // Verificar que la cuenta existe
    const { getCashAccountById } = await import('./cash-accounts');
    const account = await getCashAccountById(paymentData.accountId, userId);
    if (!account) {
      return { success: false, error: 'Cuenta no encontrada' };
    }

    // Verificar que la cuenta tenga saldo suficiente
    const accountBalance = parseFloat(account.currentBalance);
    if (accountBalance < paymentData.amount) {
      return { success: false, error: 'Saldo insuficiente en la cuenta' };
    }

    // Verificar que el monto no exceda la deuda de la tarjeta
    const cardBalance = parseFloat(card.currentBalance);
    if (paymentData.amount > cardBalance) {
      return { success: false, error: 'El monto del pago no puede ser mayor a la deuda de la tarjeta' };
    }

    // Procesar el pago
    // 1. Reducir el saldo de la cuenta de efectivo
    await adjustCashAccountBalance(paymentData.accountId, (-paymentData.amount).toString(), userId);
    
    // 2. Reducir el saldo de la tarjeta (menos deuda)
    await adjustCreditCardBalance(cardId, (-paymentData.amount).toString(), userId);

    // 3. Asegurar que existe la categoría para pagos de tarjetas
    const { ensurePaymentCategory } = await import('./user-setup');
    await ensurePaymentCategory(userId);
    
    // 4. Obtener la categoría para pagos de tarjetas
    const { getCategories } = await import('./categories');
    const categories = await getCategories(userId, 'expense');
    const paymentCategory = categories.find(cat => cat.name === 'Pago de tarjeta');
    
    if (!paymentCategory) {
      throw new Error('Error interno: No se pudo crear la categoría "Pago de tarjeta".');
    }
    
    const paymentCategoryId = paymentCategory.id;

    // 5. Crear registro de transacción (pago de tarjeta)
    const { createTransaction } = await import('./transactions');
    const transaction = await createTransaction({
      type: 'expense',
      paymentMethod: 'cash',
      amount: paymentData.amount.toString(),
      description: paymentData.description || `Pago de tarjeta ${card.name}`,
      accountId: paymentData.accountId,
      categoryId: paymentCategoryId,
      date: new Date().toISOString().split('T')[0],
      tagIds: []
    }, userId);

    return { 
      success: true, 
      data: { 
        transaction,
        cardNewBalance: (cardBalance - paymentData.amount).toFixed(2),
        accountNewBalance: (accountBalance - paymentData.amount).toFixed(2)
      }
    };

  } catch (error) {
    console.error('Error processing credit card payment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    };
  }
}