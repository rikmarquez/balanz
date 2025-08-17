// Script de emergencia para restablecer saldo de tarjeta
const { Pool } = require('pg');

async function fixBalance() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Primero, vamos a ver el estado actual
    console.log('🔍 Verificando estado actual...');
    
    const cards = await pool.query(`
      SELECT id, name, initial_balance, current_balance 
      FROM credit_cards 
      ORDER BY name
    `);
    
    console.log('📋 Tarjetas encontradas:');
    cards.rows.forEach(card => {
      console.log(`- ${card.name}: Inicial: $${card.initial_balance}, Actual: $${card.current_balance}`);
    });

    // Buscar transacciones de pagos de tarjetas (si las hay)
    const payments = await pool.query(`
      SELECT t.*, cc.name as card_name 
      FROM transactions t 
      LEFT JOIN credit_cards cc ON t.card_id = cc.id
      WHERE t.description LIKE '%Pago de tarjeta%'
      ORDER BY t.created_at DESC
    `);

    console.log(`\n💳 Transacciones de pagos encontradas: ${payments.rows.length}`);
    payments.rows.forEach(payment => {
      console.log(`- ${payment.description}: $${payment.amount} (${payment.created_at})`);
    });

    // Mostrar opciones
    console.log('\n🛠️  Opciones disponibles:');
    console.log('1. Restaurar saldo inicial de todas las tarjetas');
    console.log('2. Agregar saldo específico a una tarjeta');
    console.log('3. Solo mostrar estado (no cambiar nada)');
    
    // Para este script de emergencia, vamos a restaurar el saldo inicial
    // Si quieres una tarjeta específica, modifica este ID:
    const targetCardId = '2a1dea6c-26c5-48b9-a12b-5d1182f26473'; // ID de tu tarjeta
    const newBalance = '5000.00'; // Pon aquí el saldo que quieres
    
    console.log(`\n🔧 Restaurando saldo de tarjeta ${targetCardId} a $${newBalance}...`);
    
    await pool.query(`
      UPDATE credit_cards 
      SET current_balance = $1, updated_at = NOW()
      WHERE id = $2
    `, [newBalance, targetCardId]);
    
    console.log('✅ Saldo restaurado exitosamente!');
    
    // Verificar el resultado
    const updated = await pool.query(`
      SELECT id, name, current_balance 
      FROM credit_cards 
      WHERE id = $1
    `, [targetCardId]);
    
    if (updated.rows.length > 0) {
      const card = updated.rows[0];
      console.log(`📊 Nuevo saldo: ${card.name} = $${card.current_balance}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  fixBalance();
}

module.exports = { fixBalance };