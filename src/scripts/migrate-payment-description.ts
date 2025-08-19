import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Script de migración para actualizar la descripción del pago de tarjeta
async function migratePaymentDescription() {
  try {
    console.log('🔄 Iniciando migración de descripción de pago de tarjeta...')

    // Buscar la transacción con la descripción específica
    const paymentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.description, 'PAGO PARA NO GENERAR INTERESES'))

    console.log(`📝 Encontradas ${paymentTransactions.length} transacciones con la descripción "PAGO PARA NO GENERAR INTERESES"`)

    if (paymentTransactions.length > 0) {
      // Actualizar todas las transacciones encontradas
      const result = await db
        .update(transactions)
        .set({ description: 'OPENBANK' })
        .where(eq(transactions.description, 'PAGO PARA NO GENERAR INTERESES'))

      console.log(`✅ Descripción actualizada exitosamente para ${paymentTransactions.length} transacciones`)
      console.log('🔄 Nueva descripción: "OPENBANK"')
      
      // Mostrar detalles de las transacciones actualizadas
      paymentTransactions.forEach((transaction, index) => {
        console.log(`   ${index + 1}. ID: ${transaction.id}, Monto: $${transaction.amount}, Fecha: ${transaction.date}`)
      })
    } else {
      console.log('ℹ️ No se encontraron transacciones con la descripción especificada')
    }

    console.log('🎉 Migración de descripción completada exitosamente!')
    
    return paymentTransactions.length

  } catch (error) {
    console.error('❌ Error durante la migración de descripción:', error)
    throw error
  }
}

// Función principal para ejecutar el script
async function main() {
  try {
    const updatedCount = await migratePaymentDescription()
    console.log(`\n📊 Resumen: ${updatedCount} transacciones actualizadas`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error)
    process.exit(1)
  }
}

// Ejecutar solo si este archivo se ejecuta directamente
if (require.main === module) {
  main()
}

export { migratePaymentDescription }