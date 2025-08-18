import { NextResponse } from 'next/server'
import { migrateData } from '@/scripts/migrate-data'

export async function POST() {
  try {
    console.log('🔄 Iniciando migración de datos desde API...')
    
    const defaultUser = await migrateData()
    
    return NextResponse.json({
      success: true,
      message: 'Migración completada exitosamente',
      user: {
        id: defaultUser.id,
        email: defaultUser.email,
        name: defaultUser.name
      }
    })
  } catch (error: any) {
    console.error('❌ Error en migración:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error durante la migración',
      error: error.message
    }, { status: 500 })
  }
}