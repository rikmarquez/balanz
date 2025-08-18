import { db } from '@/lib/db'
import { users, cashAccounts, creditCards, categories, tags, transactions } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'

// Script de migración para crear un usuario por defecto y asociar todos los datos existentes
async function migrateData() {
  try {
    console.log('🔄 Iniciando migración de datos...')

    // 1. Crear usuario específico si no existe
    const adminUserEmail = 'rik@rikmarquez.com'
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminUserEmail))
      .limit(1)

    let adminUser;
    if (existingUser.length === 0) {
      console.log('📝 Creando usuario administrador...')
      const newUser = await db
        .insert(users)
        .values({
          email: adminUserEmail,
          name: 'Rik Marquez',
          clerkId: 'rik-admin-user', // ID único para este usuario
        })
        .returning()
      
      adminUser = newUser[0]
      console.log(`✅ Usuario creado: ${adminUser.name} (${adminUser.email})`)
    } else {
      adminUser = existingUser[0]
      console.log(`✅ Usuario existente encontrado: ${adminUser.name}`)
    }

    // 2. Actualizar cuentas de efectivo huérfanas
    console.log('🏦 Actualizando cuentas de efectivo...')
    const orphanedCashAccounts = await db
      .select()
      .from(cashAccounts)
      .where(isNull(cashAccounts.userId))

    if (orphanedCashAccounts.length > 0) {
      await db
        .update(cashAccounts)
        .set({ userId: adminUser.id })
        .where(isNull(cashAccounts.userId))
      
      console.log(`✅ ${orphanedCashAccounts.length} cuentas de efectivo actualizadas`)
    }

    // 3. Actualizar tarjetas de crédito huérfanas
    console.log('💳 Actualizando tarjetas de crédito...')
    const orphanedCreditCards = await db
      .select()
      .from(creditCards)
      .where(isNull(creditCards.userId))

    if (orphanedCreditCards.length > 0) {
      await db
        .update(creditCards)
        .set({ userId: adminUser.id })
        .where(isNull(creditCards.userId))
      
      console.log(`✅ ${orphanedCreditCards.length} tarjetas de crédito actualizadas`)
    }

    // 4. Actualizar categorías huérfanas
    console.log('🏷️ Actualizando categorías...')
    const orphanedCategories = await db
      .select()
      .from(categories)
      .where(isNull(categories.userId))

    if (orphanedCategories.length > 0) {
      await db
        .update(categories)
        .set({ userId: adminUser.id })
        .where(isNull(categories.userId))
      
      console.log(`✅ ${orphanedCategories.length} categorías actualizadas`)
    }

    // 5. Actualizar tags huérfanos
    console.log('🏷️ Actualizando tags...')
    const orphanedTags = await db
      .select()
      .from(tags)
      .where(isNull(tags.userId))

    if (orphanedTags.length > 0) {
      await db
        .update(tags)
        .set({ userId: adminUser.id })
        .where(isNull(tags.userId))
      
      console.log(`✅ ${orphanedTags.length} tags actualizados`)
    }

    // 6. Actualizar transacciones huérfanas
    console.log('💰 Actualizando transacciones...')
    const orphanedTransactions = await db
      .select()
      .from(transactions)
      .where(isNull(transactions.userId))

    if (orphanedTransactions.length > 0) {
      await db
        .update(transactions)
        .set({ userId: adminUser.id })
        .where(isNull(transactions.userId))
      
      console.log(`✅ ${orphanedTransactions.length} transacciones actualizadas`)
    }

    console.log('🎉 Migración completada exitosamente!')
    console.log(`📊 Todos los datos ahora están asociados al usuario: ${adminUser.email}`)
    
    return adminUser

  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  }
}

export { migrateData }