import { db } from '../db';
import { categories } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'El tipo debe ser "income" o "expense"' })
  }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido').optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres').optional(),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'El tipo debe ser "income" o "expense"' })
  }).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido').optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

export async function getCategories(userId: string, type?: 'income' | 'expense') {
  const baseCondition = and(
    eq(categories.userId, userId),
    eq(categories.isActive, true)
  );
  const whereCondition = type 
    ? and(baseCondition, eq(categories.type, type))
    : baseCondition;

  return await db
    .select()
    .from(categories)
    .where(whereCondition)
    .orderBy(categories.type, categories.name);
}

export async function getCategoryById(id: string, userId: string) {
  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1);

  const category = result[0] || null;
  
  // Asegurar que el tipo sea el correcto
  if (category && (category.type === 'income' || category.type === 'expense')) {
    return {
      ...category,
      type: category.type as 'income' | 'expense'
    };
  }
  
  return category;
}

export async function createCategory(data: CreateCategoryInput, userId: string) {
  const validated = CreateCategorySchema.parse(data);
  
  const result = await db
    .insert(categories)
    .values({
      userId,
      name: validated.name,
      type: validated.type,
      color: validated.color || '#3B82F6',
    })
    .returning();

  return result[0];
}

export async function updateCategory(id: string, data: UpdateCategoryInput, userId: string) {
  const validated = UpdateCategorySchema.parse(data);
  
  const result = await db
    .update(categories)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();

  return result[0] || null;
}

export async function deleteCategory(id: string, userId: string) {
  const result = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();

  return result[0] || null;
}

export async function getDefaultCategories() {
  return [
    // Income categories
    { name: 'Salario', type: 'income', color: '#10B981' },
    { name: 'Freelance', type: 'income', color: '#059669' },
    { name: 'Inversiones', type: 'income', color: '#047857' },
    { name: 'Otros ingresos', type: 'income', color: '#065F46' },
    
    // Expense categories
    { name: 'Alimentación', type: 'expense', color: '#EF4444' },
    { name: 'Transporte', type: 'expense', color: '#DC2626' },
    { name: 'Entretenimiento', type: 'expense', color: '#B91C1C' },
    { name: 'Salud', type: 'expense', color: '#991B1B' },
    { name: 'Educación', type: 'expense', color: '#7F1D1D' },
    { name: 'Hogar', type: 'expense', color: '#F59E0B' },
    { name: 'Ropa', type: 'expense', color: '#D97706' },
    { name: 'Servicios', type: 'expense', color: '#B45309' },
    { name: 'Pago de Tarjeta', type: 'expense', color: '#8B5CF6' }, // Categoría para pagos de tarjetas
    { name: 'Otros gastos', type: 'expense', color: '#92400E' },
  ];
}

export async function createDefaultCategories(userId: string) {
  const defaultCategories = await getDefaultCategories();
  
  const categoriesToInsert = defaultCategories.map(cat => ({
    userId,
    name: cat.name,
    type: cat.type as 'income' | 'expense',
    color: cat.color,
  }));

  const result = await db
    .insert(categories)
    .values(categoriesToInsert)
    .returning();

  return result;
}

export async function getOrCreatePaymentCategory(userId: string): Promise<string> {
  // Buscar la categoría para pagos de tarjetas (debería existir por defecto)
  const existing = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.name, 'Pago de Tarjeta'),
        eq(categories.type, 'expense')
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Si no existe (usuarios antiguos), crear la categoría
  const newCategory = await createCategory({
    name: 'Pago de Tarjeta',
    type: 'expense',
    color: '#8B5CF6' // Púrpura para distinguir pagos de tarjetas
  }, userId);

  return newCategory.id;
}