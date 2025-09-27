import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { accountTransfers, cashAccounts } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const createTransferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.number().positive(),
  transferDate: z.string(),
  description: z.string().min(1),
  transferType: z.enum(['atm_withdrawal', 'internal_transfer', 'cash_deposit']),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener transferencias con alias para las cuentas
    const transfersWithFromAccount = await db
      .select({
        id: accountTransfers.id,
        amount: accountTransfers.amount,
        transferDate: accountTransfers.transferDate,
        description: accountTransfers.description,
        transferType: accountTransfers.transferType,
        createdAt: accountTransfers.createdAt,
        fromAccountId: accountTransfers.fromAccountId,
        toAccountId: accountTransfers.toAccountId,
        fromAccount: {
          id: cashAccounts.id,
          name: cashAccounts.name,
        },
      })
      .from(accountTransfers)
      .leftJoin(cashAccounts, eq(accountTransfers.fromAccountId, cashAccounts.id))
      .where(eq(accountTransfers.userId, user.id))
      .orderBy(desc(accountTransfers.transferDate), desc(accountTransfers.createdAt));

    // Obtener las cuentas de destino
    const transfersWithDetails = await Promise.all(
      transfersWithFromAccount.map(async (transfer) => {
        const toAccount = await db
          .select({
            id: cashAccounts.id,
            name: cashAccounts.name,
          })
          .from(cashAccounts)
          .where(eq(cashAccounts.id, transfer.toAccountId))
          .limit(1);

        return {
          ...transfer,
          toAccount: toAccount[0] || null,
        };
      })
    );

    return NextResponse.json(transfersWithDetails);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTransferSchema.parse(body);

    // Validar que las cuentas existan y pertenezcan al usuario
    const accounts = await db
      .select()
      .from(cashAccounts)
      .where(
        and(
          eq(cashAccounts.userId, user.id),
          // Verificar que ambas cuentas existan
        )
      );

    const fromAccount = accounts.find(acc => acc.id === validatedData.fromAccountId);
    const toAccount = accounts.find(acc => acc.id === validatedData.toAccountId);

    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: 'Una o ambas cuentas no existen' },
        { status: 400 }
      );
    }

    if (validatedData.fromAccountId === validatedData.toAccountId) {
      return NextResponse.json(
        { error: 'La cuenta origen y destino no pueden ser la misma' },
        { status: 400 }
      );
    }

    // Verificar que la cuenta origen tenga saldo suficiente
    if (parseFloat(fromAccount.currentBalance) < validatedData.amount) {
      return NextResponse.json(
        { error: 'Saldo insuficiente en la cuenta origen' },
        { status: 400 }
      );
    }

    // Crear la transferencia y actualizar saldos en una transacción
    await db.transaction(async (tx) => {
      // Crear el registro de transferencia
      await tx.insert(accountTransfers).values({
        userId: user.id,
        fromAccountId: validatedData.fromAccountId,
        toAccountId: validatedData.toAccountId,
        amount: validatedData.amount.toString(),
        transferDate: validatedData.transferDate,
        description: validatedData.description,
        transferType: validatedData.transferType,
      });

      // Actualizar saldo de cuenta origen (restar)
      await tx
        .update(cashAccounts)
        .set({
          currentBalance: (parseFloat(fromAccount.currentBalance) - validatedData.amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, validatedData.fromAccountId));

      // Actualizar saldo de cuenta destino (sumar)
      await tx
        .update(cashAccounts)
        .set({
          currentBalance: (parseFloat(toAccount.currentBalance) + validatedData.amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, validatedData.toAccountId));
    });

    return NextResponse.json(
      { message: 'Transferencia creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}