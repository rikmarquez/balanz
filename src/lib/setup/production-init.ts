// Script para inicialización en producción
// Este código se ejecuta automáticamente cuando un usuario se registra

import { db } from '@/lib/db';
import { users, cashAccounts, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_CASH_ACCOUNTS = [
  { name: 'Cuenta Personal', balance: '0' },
  { name: 'Cuenta de Ahorros', balance: '0' },
  { name: 'Efectivo', balance: '0' }
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salario', color: '#22C55E' },
  { name: 'Freelance', color: '#10B981' },
  { name: 'Inversiones', color: '#059669' },
  { name: 'Otros Ingresos', color: '#047857' }
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alimentación', color: '#EF4444' },
  { name: 'Transporte', color: '#F97316' },
  { name: 'Entretenimiento', color: '#8B5CF6' },
  { name: 'Servicios', color: '#06B6D4' },
  { name: 'Salud', color: '#EC4899' },
  { name: 'Educación', color: '#6366F1' },
  { name: 'Otros Gastos', color: '#6B7280' }
];

export async function initializeUserData(userId: string, email: string, name: string) {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('Usuario ya existe, saltando inicialización');
      return;
    }

    // Crear usuario
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: userId,
        email: email,
        name: name
      })
      .returning();

    console.log('Usuario creado:', newUser.id);

    // Crear cuentas por defecto
    const accountPromises = DEFAULT_CASH_ACCOUNTS.map(account =>
      db.insert(cashAccounts).values({
        userId: newUser.id,
        name: account.name,
        initialBalance: account.balance,
        currentBalance: account.balance
      })
    );

    await Promise.all(accountPromises);
    console.log('Cuentas por defecto creadas');

    // Crear categorías de ingresos
    const incomePromises = DEFAULT_INCOME_CATEGORIES.map(category =>
      db.insert(categories).values({
        userId: newUser.id,
        name: category.name,
        type: 'income',
        color: category.color
      })
    );

    await Promise.all(incomePromises);

    // Crear categorías de gastos
    const expensePromises = DEFAULT_EXPENSE_CATEGORIES.map(category =>
      db.insert(categories).values({
        userId: newUser.id,
        name: category.name,
        type: 'expense',
        color: category.color
      })
    );

    await Promise.all(expensePromises);
    console.log('Categorías por defecto creadas');

    return newUser;

  } catch (error) {
    console.error('Error inicializando datos del usuario:', error);
    throw error;
  }
}