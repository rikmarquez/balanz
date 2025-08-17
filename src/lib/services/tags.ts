import { db } from '../db';
import { tags, transactionTags } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { z } from 'zod';

export const CreateTagSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido').optional(),
});

export const UpdateTagSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido').optional(),
});

export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;

export async function getTags(userId: string) {
  return await db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(tags.name);
}

export async function getTagById(id: string, userId: string) {
  const result = await db
    .select()
    .from(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .limit(1);

  return result[0] || null;
}

export async function createTag(data: CreateTagInput, userId: string) {
  const validated = CreateTagSchema.parse(data);
  
  // Verificar si ya existe un tag con el mismo nombre (sin distinguir mayúsculas/minúsculas)
  const existingTag = await db
    .select()
    .from(tags)
    .where(and(
      eq(tags.userId, userId),
      eq(tags.name, validated.name.trim())
    ))
    .limit(1);

  if (existingTag.length > 0) {
    throw new Error(`Ya existe un tag con el nombre "${validated.name}"`);
  }
  
  const result = await db
    .insert(tags)
    .values({
      userId,
      name: validated.name.trim(),
      color: validated.color || '#6B7280',
    })
    .returning();

  return result[0];
}

export async function updateTag(id: string, data: UpdateTagInput, userId: string) {
  const validated = UpdateTagSchema.parse(data);
  
  // Si se está actualizando el nombre, verificar que no exista otro tag con ese nombre
  if (validated.name) {
    const existingTag = await db
      .select()
      .from(tags)
      .where(and(
        eq(tags.userId, userId),
        eq(tags.name, validated.name.trim())
      ))
      .limit(1);

    if (existingTag.length > 0 && existingTag[0].id !== id) {
      throw new Error(`Ya existe un tag con el nombre "${validated.name}"`);
    }
    
    // Trim del nombre si se está actualizando
    validated.name = validated.name.trim();
  }
  
  const result = await db
    .update(tags)
    .set(validated)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning();

  return result[0] || null;
}

export async function deleteTag(id: string, userId: string) {
  // Primero eliminar todas las relaciones con transacciones
  await db
    .delete(transactionTags)
    .where(eq(transactionTags.tagId, id));

  // Luego eliminar el tag
  const result = await db
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning();

  return result[0] || null;
}

export async function getTagsByTransactionId(transactionId: string) {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(tags)
    .innerJoin(transactionTags, eq(tags.id, transactionTags.tagId))
    .where(eq(transactionTags.transactionId, transactionId));

  return result;
}

export async function addTagsToTransaction(transactionId: string, tagIds: string[]) {
  if (tagIds.length === 0) return;

  const values = tagIds.map(tagId => ({
    transactionId,
    tagId,
  }));

  await db.insert(transactionTags).values(values);
}

export async function removeTagsFromTransaction(transactionId: string, tagIds?: string[]) {
  if (tagIds && tagIds.length > 0) {
    // Remover tags específicos
    await db
      .delete(transactionTags)
      .where(
        and(
          eq(transactionTags.transactionId, transactionId),
          inArray(transactionTags.tagId, tagIds)
        )
      );
  } else {
    // Remover todos los tags de la transacción
    await db
      .delete(transactionTags)
      .where(eq(transactionTags.transactionId, transactionId));
  }
}

export async function updateTransactionTags(transactionId: string, newTagIds: string[]) {
  // Primero remover todos los tags existentes
  await removeTagsFromTransaction(transactionId);
  
  // Luego agregar los nuevos tags
  if (newTagIds.length > 0) {
    await addTagsToTransaction(transactionId, newTagIds);
  }
}

export async function getTransactionsByTagIds(tagIds: string[]): Promise<string[]> {
  if (tagIds.length === 0) return [];

  const result = await db
    .select({
      transactionId: transactionTags.transactionId,
    })
    .from(transactionTags)
    .where(inArray(transactionTags.tagId, tagIds))
    .groupBy(transactionTags.transactionId);

  return result.map(row => row.transactionId);
}