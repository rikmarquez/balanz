import { requireAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cashAccounts, creditCards, balanceAdjustments } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const createAdjustmentSchema = z.object({
  entityType: z.enum(['account', 'card']),
  entityId: z.string().min(1),
  newBalance: z.number(),
  reason: z.string().min(1).max(500)
})

export async function GET() {
  try {
    const user = await requireAuth()

    const adjustmentsData = await db
      .select({
        id: balanceAdjustments.id,
        accountId: balanceAdjustments.accountId,
        creditCardId: balanceAdjustments.creditCardId,
        previousBalance: balanceAdjustments.previousBalance,
        newBalance: balanceAdjustments.newBalance,
        adjustmentAmount: balanceAdjustments.adjustmentAmount,
        reason: balanceAdjustments.reason,
        createdAt: balanceAdjustments.createdAt,
        account: {
          name: cashAccounts.name
        },
        creditCard: {
          name: creditCards.name
        }
      })
      .from(balanceAdjustments)
      .leftJoin(cashAccounts, eq(balanceAdjustments.accountId, cashAccounts.id))
      .leftJoin(creditCards, eq(balanceAdjustments.creditCardId, creditCards.id))
      .where(eq(balanceAdjustments.userId, user.id))
      .orderBy(desc(balanceAdjustments.createdAt))

    return NextResponse.json(adjustmentsData)

  } catch (error) {
    console.error('Error fetching balance adjustments:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validatedData = createAdjustmentSchema.parse(body)

    let currentBalance = 0
    let entityData: any = null

    // Obtener el saldo actual
    if (validatedData.entityType === 'account') {
      entityData = await db
        .select()
        .from(cashAccounts)
        .where(eq(cashAccounts.id, validatedData.entityId))
        .limit(1)

      if (!entityData.length || entityData[0].userId !== user.id) {
        return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
      }

      currentBalance = parseFloat(entityData[0].currentBalance || '0')
    } else {
      entityData = await db
        .select()
        .from(creditCards)
        .where(eq(creditCards.id, validatedData.entityId))
        .limit(1)

      if (!entityData.length || entityData[0].userId !== user.id) {
        return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
      }

      currentBalance = parseFloat(entityData[0].currentBalance || '0')
    }

    const adjustmentAmount = validatedData.newBalance - currentBalance

    // Crear el registro del ajuste
    const adjustmentData = {
      userId: user.id,
      accountId: validatedData.entityType === 'account' ? validatedData.entityId : null,
      creditCardId: validatedData.entityType === 'card' ? validatedData.entityId : null,
      previousBalance: currentBalance.toString(),
      newBalance: validatedData.newBalance.toString(),
      adjustmentAmount: adjustmentAmount.toString(),
      reason: validatedData.reason
    }

    const [newAdjustment] = await db
      .insert(balanceAdjustments)
      .values(adjustmentData)
      .returning()

    // Actualizar el saldo de la entidad
    if (validatedData.entityType === 'account') {
      await db
        .update(cashAccounts)
        .set({ currentBalance: validatedData.newBalance.toString() })
        .where(eq(cashAccounts.id, validatedData.entityId))
    } else {
      await db
        .update(creditCards)
        .set({ currentBalance: validatedData.newBalance.toString() })
        .where(eq(creditCards.id, validatedData.entityId))
    }

    return NextResponse.json(newAdjustment, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating balance adjustment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}