import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  cashAccounts, 
  creditCards, 
  categories, 
  tags, 
  transactions, 
  transactionTags,
  balanceAdjustments 
} from '@/lib/db/schema'

export async function POST() {
  try {
    console.log('🗑️ Iniciando limpieza completa de datos...')
    
    // Eliminar en orden para respetar las foreign keys
    
    // 1. Eliminar relaciones transaction_tags
    await db.delete(transactionTags)
    console.log('✅ Relaciones transacción-tags eliminadas')
    
    // 2. Eliminar transacciones
    const deletedTransactions = await db.delete(transactions)
    console.log('✅ Transacciones eliminadas')
    
    // 3. Eliminar ajustes de balance
    await db.delete(balanceAdjustments)
    console.log('✅ Ajustes de balance eliminados')
    
    // 4. Eliminar cuentas de efectivo
    const deletedAccounts = await db.delete(cashAccounts)
    console.log('✅ Cuentas de efectivo eliminadas')
    
    // 5. Eliminar tarjetas de crédito
    const deletedCards = await db.delete(creditCards)
    console.log('✅ Tarjetas de crédito eliminadas')
    
    // 6. Eliminar categorías
    const deletedCategories = await db.delete(categories)
    console.log('✅ Categorías eliminadas')
    
    // 7. Eliminar tags
    const deletedTags = await db.delete(tags)
    console.log('✅ Tags eliminados')
    
    console.log('🎉 Limpieza completa terminada!')
    console.log('👤 Usuarios mantenidos intactos')
    
    return NextResponse.json({
      success: true,
      message: 'Limpieza completa exitosa',
      summary: {
        message: 'Todos los datos eliminados excepto usuarios',
        usersKept: 'Los usuarios se mantienen para poder hacer login',
        nextSteps: 'Puedes crear nuevas cuentas, tarjetas y transacciones desde cero'
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error durante la limpieza:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error durante la limpieza completa',
      error: error.message
    }, { status: 500 })
  }
}