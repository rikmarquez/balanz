import { db } from '../db';
import { cashAccounts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export const CreateCashAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  initialBalance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'El balance debe ser un número válido'),
});

export const UpdateCashAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  isActive: z.boolean().optional(),
});

export type CreateCashAccountInput = z.infer<typeof CreateCashAccountSchema>;
export type UpdateCashAccountInput = z.infer<typeof UpdateCashAccountSchema>;

export async function getCashAccounts(userId: string) {
  return await db
    .select()
    .from(cashAccounts)
    .where(eq(cashAccounts.userId, userId))
    .orderBy(cashAccounts.name);
}

export async function getCashAccountById(id: string, userId: string) {
  const result = await db
    .select()
    .from(cashAccounts)
    .where(and(eq(cashAccounts.id, id), eq(cashAccounts.userId, userId)))
    .limit(1);

  return result[0] || null;
}

export async function createCashAccount(data: CreateCashAccountInput, userId: string) {
  const validated = CreateCashAccountSchema.parse(data);
  
  const result = await db
    .insert(cashAccounts)
    .values({
      userId,
      name: validated.name,
      initialBalance: validated.initialBalance,
      currentBalance: validated.initialBalance,
    })
    .returning();

  return result[0];
}

export async function updateCashAccount(id: string, data: UpdateCashAccountInput, userId: string) {
  const validated = UpdateCashAccountSchema.parse(data);
  
  const result = await db
    .update(cashAccounts)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(cashAccounts.id, id), eq(cashAccounts.userId, userId)))
    .returning();

  return result[0] || null;
}

export async function deleteCashAccount(id: string, userId: string) {
  const result = await db
    .delete(cashAccounts)
    .where(and(eq(cashAccounts.id, id), eq(cashAccounts.userId, userId)))
    .returning();

  return result[0] || null;
}

export async function adjustCashAccountBalance(id: string, amount: string, userId: string) {
  const account = await getCashAccountById(id, userId);
  
  if (!account) {
    throw new Error('Cuenta no encontrada');
  }

  const currentBalance = parseFloat(account.currentBalance);
  const adjustmentAmount = parseFloat(amount);
  const newBalance = (currentBalance + adjustmentAmount).toFixed(2);

  const result = await db
    .update(cashAccounts)
    .set({
      currentBalance: newBalance,
      updatedAt: new Date(),
    })
    .where(and(eq(cashAccounts.id, id), eq(cashAccounts.userId, userId)))
    .returning();

  return result[0];
}